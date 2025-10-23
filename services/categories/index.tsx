import { api } from "@/lib/AxiosInstants"

export const fetchCategory = async (signal: any,) => {
    const response = await api.get("/service/catalogue_service/v1/web/category", { signal })
    return response.data
}