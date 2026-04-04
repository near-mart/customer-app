import { api } from "@/lib/AxiosInstants";

export const getOrderTiming = async (signal, supplierId, lat, lng, userLat, userLng, max_delivery_km) => {
    try {
        const response = await api.get(`/service/order_service/v1/supplier/order/time/${supplierId}`, { signal, params: { lat, lng, userLat, userLng, max_delivery_km } })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}