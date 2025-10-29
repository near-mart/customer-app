import { api } from "@/lib/AxiosInstants";

export const fetchProducts = async (signal: any, params: { page?: number, page_size?: number, search?: string, supplier?: string, location?: any, categories?: any, category?: string, longitude?: number, latitude?: number, features?: boolean }) => {
    try {
        const response = await api.get("/service/catalogue_service/v1/no-auth/web/products", { signal, params: { ...params } })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}
export const addToCart = async (data) => {
    try {
        const response = await api.put("/service/order_service/v1/add-to-cart", data)
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}
export const getCart = async (signal) => {
    try {
        const response = await api.get("/service/order_service/v1/cart", { signal })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}