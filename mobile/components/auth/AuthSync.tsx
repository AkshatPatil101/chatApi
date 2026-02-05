import { useAuthCallback } from "@/hooks/useAuth"
import { useEffect, useRef } from "react"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { useQueryClient } from "@tanstack/react-query";

const AuthSync = () => {

    const {isSignedIn} = useAuth();
    const {user} = useUser();
    const {mutate:syncUser} = useAuthCallback();

    const hasSynced = useRef(false); // useEffect runs only once
    const queryClient = useQueryClient();

    useEffect(()=>{
        if(isSignedIn && user && !hasSynced.current){
            hasSynced.current = true;

            syncUser(undefined,{
                onSuccess:(data)=>{
                    console.log(`User ${data.name} synced`)
                    queryClient.setQueryData(["currentUser"], data);
                },
                onError:(error)=>{
                    console.log("❌ User not synced", error);
                    hasSynced.current = false; // allow retry
                }
            })
        }

        if(!isSignedIn){
            hasSynced.current = false;
        }
    },[isSignedIn,user,syncUser,queryClient])


  return null
}

export default AuthSync