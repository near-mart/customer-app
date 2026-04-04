import { fetchCustomer } from '@/services/suppliers';
import { useQuery } from '@tanstack/react-query';

export function useFetchUser() {

    const { data, refetch } = useQuery({
        queryKey: ["fetchCustomer"],
        queryFn: ({ signal }) => fetchCustomer(signal)
    })

    return { data: data?._payload[0], refetch }
}
