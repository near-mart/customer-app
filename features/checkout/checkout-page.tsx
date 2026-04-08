"use client"
import { getCart } from '@/services/products';
import { fetchDeliverySettings, fetchSupplier } from '@/services/suppliers';
import useLocationStore from '@/store/location';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Home, } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react'
import { Coupon } from './coupon';
import { BillSummary } from './bill-summary';
import { notify } from '@/functions/notify';
import { SelectedItems } from './selected-items';
import { Button } from '@/components/ui/button';
import { DeliveryTip } from './delivery-tip';
import { createOnlineOrder, getOrderTiming } from '@/services/checkout';
import { useFetchUser } from '@/hooks/useFetchUser';
import { useAuthValidator } from '@/store/authValidater';
import { useRouter } from 'next/navigation';
import { calculateDeliveryCharges } from '@/utils/delivery';
import { useCartStore } from '@/store/cartStore';

export function CheckOut({ store }: any) {
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [freeProductCoupon, setFreeProductCoupon] = useState<any>(null);
    const [tip, setTip] = useState(0);
    const { isAuthenticate } = useAuthValidator();
    const router = useRouter();
    const { data: userData } = useFetchUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { locationData } = useLocationStore();


    const handleApplyCoupon = (coupon: any) => {
        if (!coupon) return;

        // 1️⃣ Check Active Status
        if (!coupon.isActive) {
            notify("Coupon is not active");
            return;
        }

        // 2️⃣ Check Date Validity
        const now = new Date();
        if (coupon.startDate && new Date(coupon.startDate) > now) {
            notify("Coupon is not started yet");
            return;
        }

        if (coupon.endDate && new Date(coupon.endDate) < now) {
            notify("Coupon expired");
            return;
        }

        // 3️⃣ Check Minimum Order Value
        if (supplierTotal < coupon.minOrderValue) {
            notify(`Add ₹${coupon.minOrderValue - supplierTotal} more to apply this coupon`);
            return;
        }

        let discount = 0;

        // 4️⃣ Flat Coupon
        if (coupon.type === "flat") {
            discount = coupon.value;
        }

        // 5️⃣ Percentage Coupon
        if (coupon.type === "percentage") {
            discount = Math.floor((supplierTotal * coupon.value) / 100);
        }

        // 6️⃣ Free Product Coupon
        if (coupon.type === "free_product") {
            setFreeProductCoupon(coupon.freeProduct);
            discount = 0; // no direct discount
        } else {
            setFreeProductCoupon(null);
        }

        discount = Math.min(discount, supplierTotal);

        setAppliedCoupon(coupon);
        setDiscountAmount(discount);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setFreeProductCoupon(null);
    };

    const { data: suppliers, isLoading: supplierLoading } = useQuery({
        queryKey: ["fetchSupplier", store, locationData],
        queryFn: ({ signal }) =>
            fetchSupplier(signal, {
                page: 0,
                page_size: 15,
                handle: store,
                latitude: locationData?.latitude,
                longitude: locationData?.longitude,
            }),
        enabled: !!store,
    });

    const supplier = suppliers?._payload?.[0];

    const { data: delivery } = useQuery({
        queryKey: ["fetchDeliverySettings", supplier?._id || ""],
        queryFn: ({ signal }) => fetchDeliverySettings(signal, supplier?._id),
        enabled: !!supplier?._id,
    });
    const deliveryInfo = delivery?._payload;

    const { data: timing } = useQuery({
        queryKey: ["getOrderTiming", supplier?._id || "", deliveryInfo?.max_delivery_km],
        queryFn: ({ signal }) => getOrderTiming(
            signal,
            supplier?._id,
            supplier?.address?.latitude,
            supplier?.address?.longitude,
            locationData?.latitude,
            locationData?.longitude,
            deliveryInfo?.max_delivery_km || 0
        ),
        enabled: !!(supplier?._id && deliveryInfo),
    });



    const [selectedSupplier, setSelectedSupplier] = useState<any[]>([])
    const { data } = useQuery({
        queryKey: ["getCart"],
        queryFn: ({ signal }) => getCart(signal),
    });
    useEffect(() => {
        if (data?._payload && store) {
            const check = data?._payload?.find((it) => it.supplier?.handle == store)
            setSelectedSupplier([check] || [])
        }
    }, [data?._payload])

    const supplierTotal = selectedSupplier[0]?.items?.reduce((sum: number, item: any) => {
        const product = item.product?.[0];
        if (!product) return sum;
        const variant = product.variants?.find(
            (v: any) => v._id === item.variant_id
        );
        const price = variant?.discount_price || variant?.selling_price || 0;
        return sum + price * item.qty;
    }, 0);

    const finalTotal = Math.max(0, supplierTotal - discountAmount);

    const { clearSupplierCart } = useCartStore();
    const onSubmit = async () => {
        if (!isAuthenticate) {
            notify("Please login to place your order", "error");
            return;
        }

        if (!selectedSupplier[0] || !supplier) {
            notify("No items in cart", "error");
            return;
        }

        const deliveryConfig = {
            ...supplier?.address,
            ...deliveryInfo,
            distKm: supplier?.distKm,
            distance_km: supplier?.distance_km
        };

        const deliveryData = calculateDeliveryCharges({
            supplierTotal,
            delivery: deliveryConfig,
        });

        if (!deliveryData.isDeliverable) {
            notify(deliveryData.message, "error");
            return;
        }

        if (!locationData) {
            notify("Please select a delivery location first", "error");
            return;
        }

        try {
            setIsSubmitting(true);
            const items = selectedSupplier[0].items.map((item: any) => ({
                productId: item.product?.[0]?._id,
                variantId: item.variant_id,
                qty: item.qty
            }));

            const orderData = {
                items,
                name: userData?.name || "Customer",
                mobile: userData?.mobile,
                email: userData?.email,
                countryCode: userData?.countryCode || "91",
                discount: discountAmount,
                couponCode: appliedCoupon?.code,
                payment_mode: "cod",
                isDeliveryFee: deliveryData.deliveryFee > 0,
                isPackagingFee: deliveryData.packingCharge > 0,
                isPlatformFee: true,
                address: locationData ? JSON.stringify(locationData) : "Selected Location",
                note: "",
                status: "completed",
                fulfillment: "delivery",
                channel: "online"
            };

            const idempotencyKey = `ord_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            const response = await createOnlineOrder(orderData, supplier._id, idempotencyKey);

            if (response?.success) {
                notify("Order placed successfully!", "success");
                clearSupplierCart(supplier._id);
                router.replace("/account/orders");
            } else {
                notify(response?.message || "Failed to place order", "error");
            }
        } catch (err: any) {
            notify(err?.response?.data?.message || "Something went wrong", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const checkoutDeliveryConfig = {
        ...supplier?.address,
        ...deliveryInfo,
        distKm: supplier?.distKm,
        distance_km: supplier?.distance_km
    };

    const checkoutDeliveryData = calculateDeliveryCharges({
        supplierTotal,
        delivery: checkoutDeliveryConfig
    });

    const totalToPay = finalTotal + checkoutDeliveryData.deliveryFee + checkoutDeliveryData.packingCharge + tip;

    return (
        <div className='mb-30'>
            <nav aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList" className="mb-2 mt-6">
                <ol className="flex items-center flex-wrap  text-sm" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                    <li className="flex items-center gap-1 text-gray-600 hover:text-primary" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <Link href="/" itemProp="item" className="flex items-center gap-1 text-gray-600 hover:text-primary">
                            <Home className="w-4 h-4" />
                            <span itemProp="name">Home</span>
                        </Link>
                        <meta itemProp="position" content="1" />
                    </li>
                    <ChevronRight className="mx-2 text-gray-400" />
                    <li className="flex items-center gap-1 text-gray-600 hover:text-primary" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <Link href={`/store/${store}`} itemProp="item" className="flex items-center gap-1 text-gray-600 hover:text-primary">
                            <span itemProp="name">{supplier?.storeName}</span>
                        </Link>
                        <meta itemProp="position" content="1" />
                    </li>
                    <ChevronRight className="mx-2 text-gray-400" />
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <span className="text-primary font-medium" itemProp="name">Cart</span>
                        <meta itemProp="position" content="2" />
                    </li>
                </ol>
            </nav>
            <Coupon
                supplier={supplier}
                supplierTotal={supplierTotal}
                appliedCoupon={appliedCoupon}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
            />

            <SelectedItems selectedSupplier={selectedSupplier} store={store} timing={timing} />
            {supplier && <BillSummary
                originalTotal={supplierTotal}
                supplierTotal={finalTotal}
                discountAmount={discountAmount}
                deliveryConfig={checkoutDeliveryConfig}
                locationData={locationData}
                appliedCoupon={appliedCoupon}
                freeProductCoupon={freeProductCoupon}
                tip={tip}
            />}
            <DeliveryTip tip={tip} setTip={setTip} />
            <PayFooter amount={totalToPay} onPay={onSubmit} disabled={isSubmitting} />

        </div>
    )
}

export const PayFooter = ({
    amount = 0,
    onPay,
    disabled = false,
}: {
    amount: number;
    onPay: () => void;
    disabled?: boolean;
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t shadow-md px-4 py-3">
            <div className="flex items-center justify-between gap-4  max-w-xl mx-auto px-4">

                {/* Amount */}
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-500 font-medium">To Pay</span>

                        <span className="text-xl font-bold text-gray-900">
                            ₹{amount}
                        </span>
                    </div>

                    {/* Note */}
                    <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 w-fit">
                        💵 Pay directly to the delivery partner at delivery
                    </div>
                </div>


                {/* Pay Button */}
                <Button
                    disabled={disabled}
                    onClick={onPay}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-xl font-semibold w-[60%] sm:w-auto"
                >
                    Place Order
                </Button>
            </div>
        </div>
    );
};
