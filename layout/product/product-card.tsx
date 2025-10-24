import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function ProductCard({ product }) {
    const variants = product.variants || [];
    const allOutOfStock = variants.every((v) => v.stock <= 0);
    const defaultVariant = variants.find((v) => v.stock > 0) || variants[0];

    const { addOrReplace, increment, decrement, getQty, getVariantId } = useCartStore();

    const selectedVariantIdInCart = getVariantId(product._id);
    const variantFromCart = variants.find((v) => v._id === selectedVariantIdInCart);
    const [selectedVariant, setSelectedVariant] = useState(
        variantFromCart || defaultVariant
    );

    // 🩷 Wishlist Store
    const { addWishlist, removeWishlist, isWishlisted } = useWishlistStore();
    const wishlisted = isWishlisted(product._id);

    useEffect(() => {
        if (variantFromCart && variantFromCart._id !== selectedVariant._id) {
            setSelectedVariant(variantFromCart);
        }
    }, [variantFromCart?._id]);

    const qty = getQty(product._id);

    const discount = Math.max(
        0,
        (selectedVariant?.selling_price || 0) - (selectedVariant?.discount_price || 0)
    );

    const handleAdd = () => {
        addOrReplace({
            productId: product._id,
            variantId: selectedVariant._id,
            name: product.name,
            qty: 1,
            price: selectedVariant.discount_price,
            image: product.images?.[0]?.url,
            unit: selectedVariant.unit,
            selling_qty: selectedVariant.selling_qty,
        });
    };

    return (
        <div
            className={`p-1.5 sm:p-2 border rounded-xl bg-white transition relative ${allOutOfStock ? "opacity-60" : "hover:shadow-md"
                }`}
        >
            {/* 🖼️ Image with zoom + heart icon */}
            <div className="relative w-full aspect-square sm:aspect-4/3 rounded-lg overflow-hidden group">
                <Image
                    src={product.images?.[0]?.url || "/product-placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />

                {/* ❤️ Wishlist Icon */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (wishlisted) removeWishlist(product._id);
                        else
                            addWishlist({
                                productId: product._id,
                                name: product.name,
                                image: product.images?.[0]?.url,
                            });
                    }}
                    className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-white/90 hover:bg-white rounded-full p-1 sm:p-1.5 shadow-sm transition"
                >
                    <Heart
                        size={14}
                        strokeWidth={1.8}
                        className={`${wishlisted ? "text-pink-600 fill-pink-600" : "text-gray-500"}`}
                    />
                </button>

                {/* 🛒 Add / Counter / Out of stock */}
                {allOutOfStock ? (
                    <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 text-[9px] sm:text-[10px] bg-gray-700 text-white px-2 py-[2px] rounded-md">
                        Out of stock
                    </div>
                ) : qty > 0 ? (
                    <div className="absolute  bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 flex items-center gap-1 sm:gap-2 bg-white rounded-md border border-pink-600 px-1.5 sm:px-2 py-[2px] sm:py-1">
                        <button
                            className="text-pink-600 font-bold text-xs sm:text-sm cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                decrement(product._id);
                            }}
                        >
                            −
                        </button>
                        <span className="text-xs sm:text-sm font-semibold">{qty}</span>
                        <button
                            className="text-pink-600 font-bold text-xs sm:text-sm cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                increment(product._id);
                            }}
                        >
                            +
                        </button>
                    </div>
                ) : selectedVariant?.stock > 0 ? (
                    <button
                        className="absolute cursor-pointer  bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 bg-white text-pink-600 font-semibold text-[10px] sm:text-xs border border-pink-600 px-2 sm:px-3 py-[2px] sm:py-1 rounded-md hover:bg-pink-600 hover:text-white transition"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAdd();
                        }}
                    >
                        ADD
                    </button>
                ) : (
                    <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 text-[9px] sm:text-[10px] bg-gray-700 text-white px-2 py-[2px] rounded-md">
                        Out of stock
                    </div>
                )}
            </div>

            {/* 💰 Price + Variant Selector */}
            <div className="mt-1 sm:mt-2">
                <div
                    className={`flex items-center gap-1 text-[12px] sm:text-base font-semibold ${allOutOfStock ? "text-gray-400" : "text-gray-900"}`}
                >
                    ₹{selectedVariant?.discount_price}
                    {selectedVariant?.selling_price > selectedVariant?.discount_price && (
                        <>
                            <span className="text-gray-400 line-through text-[9px] sm:text-sm">
                                ₹{selectedVariant?.selling_price}
                            </span>
                            {!allOutOfStock && (
                                <span className="text-green-600 text-[9px] sm:text-xs font-medium">
                                    SAVE ₹{discount}
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* 📦 Variant Selector */}
                {variants.length > 1 && (
                    <div className="mt-0.5 sm:mt-1">
                        <Select
                            disabled={allOutOfStock}

                            value={selectedVariant?._id}
                            onValueChange={(id) => {
                                const variant = variants.find((v) => v._id === id);
                                setSelectedVariant(variant);

                                if (qty > 0 && variant && variant.stock > 0) {
                                    addOrReplace({
                                        productId: product._id,
                                        variantId: variant._id,
                                        name: product.name,
                                        qty,
                                        price: variant.discount_price,
                                        image: product.images?.[0]?.url,
                                        unit: variant.unit,
                                        selling_qty: variant.selling_qty,
                                    });
                                }
                            }}

                        >
                            <SelectTrigger className="!h-6 sm:!h-8 !min-h-6 sm:!min-h-8 px-1.5 sm:px-2 text-[9px] sm:text-xs border-gray-300 rounded-md data-[state=open]:ring-0 data-[state=open]:border-primary">
                                <SelectValue
                                    placeholder={
                                        selectedVariant?.stock > 0
                                            ? `${selectedVariant?.selling_qty} ${selectedVariant?.unit}`
                                            : `${selectedVariant?.selling_qty} ${selectedVariant?.unit} (Out of stock)`
                                    }
                                />
                            </SelectTrigger>

                            <SelectContent className="text-[9px] sm:text-xs py-1 sm:py-1.5">
                                {variants.map((v) => (
                                    <SelectItem
                                        key={v._id}
                                        value={v._id}
                                        disabled={v.stock <= 0}
                                        className="text-[9px] sm:text-xs py-1 sm:py-1.5"
                                    >
                                        {v.selling_qty} {v.unit}
                                        {v.stock <= 0 ? " — Out of stock" : ""}
                                        {v._id === selectedVariantIdInCart && qty > 0 && " ✓"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>
                )}

                {/* 🥦 Product Name */}
                <p
                    className={`text-[11px] sm:text-sm font-medium line-clamp-1 mt-1 ${allOutOfStock ? "text-gray-500" : "text-gray-700"
                        }`}
                >
                    {product.name}
                </p>

                {/* 🕒 Availability Message */}
                {allOutOfStock && (
                    <div className="mt-0.5 sm:mt-1">
                        <p className="text-[9px] sm:text-xs text-red-500 font-medium">
                            🕒 Available from tomorrow at 9:00 AM
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
