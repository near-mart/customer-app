import { api } from "@/lib/AxiosInstants";
import { useAuthValidator } from "@/store/authValidater";

export const fetchProducts = async (signal: any, params: { page?: number, page_size?: number, search?: string, supplier?: string, location?: any, categories?: any, category?: string, longitude?: number, latitude?: number, features?: boolean, noProduct?: string }) => {
    try {
        const { isAuthenticate } = useAuthValidator.getState();
        const response = await api.get(isAuthenticate ? "/service/catalogue_service/v1/web/products" : "/service/catalogue_service/v1/no-auth/web/products", { signal, params: { ...params } })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}
export const fetchProductsById = async (signal: any, product: string, params: {}) => {
    try {
        const response = await api.get(`/service/catalogue_service/v1/no-auth/product/${product}`, { signal, params: { ...params } })
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
export const toggleWishlist = async (data) => {
    try {
        const response = await api.put("/service/catalogue_service/v1/wishlist/toggle", data)
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}
export const mergeWishlist = async (data) => {
    try {
        const response = await api.post("/service/catalogue_service/v1/wishlist/merge", data)
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}
export const mergeCart = async (data) => {
    try {
        const response = await api.post("/service/order_service/v1/merge-cart", data)
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
export const getWishList = async (signal: any, params: { page: number; }) => {
    try {
        const response = await api.get("/service/catalogue_service/v1/wishlists", { signal, params })
        return response.data
    } catch (err: any) {
        console.log(err);
    }
}