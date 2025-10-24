import { api } from "@/lib/AxiosInstants";

export const fetchProducts = async (signal: any, params: { page?: number, page_size?: number, search?: string, supplier?: string, location?: any, categories?: any, category?: string }) => {
    try {
        const response = await api.get("/service/catalogue_service/v1/no-auth/web/products", { signal, params: { ...params } })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}