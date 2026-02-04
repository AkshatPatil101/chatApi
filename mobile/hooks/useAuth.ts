import { useApi } from "@/lib/axios";
import { User } from "@/types";
import {useMutation, useQuery} from "@tanstack/react-query"


export const useAuthCallback = () => {

    const {apiWithAuth} = useApi();

    const result = useMutation({
        mutationFn: async () => {
            const {data} = await apiWithAuth<User>({ method: "POST", url: "/auth/callback" })
            return data;
        }
    })

    return result;

}


export const useCurrentUser = () => {
    const {apiWithAuth} = useApi();

    return useQuery({
        queryKey:["currentUser"],
        queryFn: async () => {
            const {data} = await apiWithAuth<User>({method:"GET",url:"/auth/me"});
            return data;
        }
    })
}