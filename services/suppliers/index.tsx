import { api } from "@/lib/AxiosInstants";

export const fetchSupplier = async (signal: any, params: { page?: number, page_size?: number, search?: string, supplier?: string, categories?: any, handle?: string, longitude?: number, latitude?: number }) => {
    try {
        const response = await api.get("/service/customer_service/v1/no-auth/web/suppliers", { signal, params: { ...params } })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}
export const fetchTopSupplier = async (signal: any, params: { page?: number, page_size?: number, search?: string, supplier?: string, location?: any, categories?: any, handle?: string }) => {
    try {
        const response = await api.get("/service/order_service/v1/no-auth/top/supplier", { signal, params: { ...params } })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}
export const fetchDeliverySettings = async (signal: any, supplier: string) => {
    try {
        const response = await api.get(`/service/logistics_service/v1/no-auth/delivery/settings/${supplier}`, { signal, })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}
export const fetchRefreshToken = async (data) => {
    try {
        const response = await api.post(`/service/customer_service/v1/no-auth/refresh-token`, data)
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}