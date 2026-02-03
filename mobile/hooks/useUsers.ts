import { useApi } from "@/lib/axios";
import { User } from "@/types";
import { useQuery } from "@tanstack/react-query";



export const useUsers = () => {

    const {apiWithAuth} = useApi();

    return useQuery({
        queryKey:["users"],
        queryFn: async ():Promise<User[]> => {
            const {data} = await apiWithAuth<User[]>({method:"GET",url:"/users"});
            return data;
        }
    })

}