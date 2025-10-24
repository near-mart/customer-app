import { api } from "@/lib/AxiosInstants"

export const fetchCategory = async (signal: any,) => {
    const response = await api.get("/service/catalogue_service/v1/no-auth/web/category", { signal })
    return response.data
}
export const fetchNestedCategory = async (signal: any, params: { supplier: string }) => {
    const response = await api.get("/service/catalogue_service/v1/no-auth/web/nested-category", { signal, params })
    return response.data
}