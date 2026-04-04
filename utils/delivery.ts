// utils/delivery.ts

export const getDistanceInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) => {
    const R = 6371; // radius of Earth in km
    const toRad = (x) => (x * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(2); // distance in km
};

export const calculateDeliveryCharges = ({
    supplierTotal,
    delivery,
}: {
    supplierTotal: number;
    delivery: any;
}) => {
    if (!delivery || !delivery.status) {
        return {
            deliveryFee: 0,
            packingCharge: 0,
            isFreeDelivery: true,
            distanceKm: 0,
            isDeliverable: true,
            message: "Delivery not configured",
        };
    }

    // Deliverable check
    const isDeliverable = Number(delivery?.distKm) <= (delivery.max_delivery_km);


    if (!isDeliverable) {
        return {
            deliveryFee: 0,
            packingCharge: 0,
            isFreeDelivery: false,
            distanceKm: Number(delivery?.distKm),
            isDeliverable: false,
            message: `Delivery not available beyond ${delivery.max_delivery_km} km`,
        };
    }

    let deliveryFee = 0;

    const isFreeDeliveryEligible = delivery.free_delivery_above > 0 && supplierTotal >= delivery.free_delivery_above;

    if (isFreeDeliveryEligible) {
        deliveryFee = 0;
    } else {
        // Delivery Fee Logic
        if (delivery.delivery_type === "flat") {
            deliveryFee = delivery.flat_charge || 0;
        }

        if (delivery.delivery_type === "per_km") {
            deliveryFee = Math.ceil(Number(delivery?.distKm) * (delivery.per_km_charge || 0));
        }
    }

    const packingCharge = delivery.packing_charge || 0;

    return {
        deliveryFee,
        packingCharge,
        isFreeDelivery: deliveryFee === 0,
        distanceKm: Number(delivery?.distKm),
        isDeliverable: true,
        message: "Delivery charges calculated",
    };
};
