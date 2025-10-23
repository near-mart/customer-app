import { api } from "@/lib/AxiosInstants";

export const fetchSupplier = async (signal: any, params: { page?: number, page_size?: number, search?: string, supplier?: string, location?: any }) => {
    try {
        const response = await api.get("/service/customer_service/v1/web/suppliers", { signal, params: { ...params } })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}