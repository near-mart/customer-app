import { api } from "@/lib/AxiosInstants";

export const getOrderTiming = async (signal: any, supplierId: string, lat: number, lng: number, userLat: number, userLng: number, max_delivery_km: number) => {
    try {
        const response = await api.get(`/service/order_service/v1/supplier/order/time/${supplierId}`, { signal, params: { lat, lng, userLat, userLng, max_delivery_km } })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}

export const createOnlineOrder = async (orderData: any, supplierId: string, idempotencyKey: string) => {
    try {
        const response = await api.post(`/service/order_service/v1/customer/order/${supplierId}`, orderData, {
            headers: {
                "x-idempotency-key": idempotencyKey
            }
        });
        return response.data;
    } catch (err: any) {
        console.error("Order Creation Error:", err);
        throw err;
    }
}