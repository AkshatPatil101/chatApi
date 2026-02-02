import { useAuthCallback } from "@/hooks/useAuth"
import { useEffect, useRef } from "react"
import { useAuth, useUser } from "@clerk/clerk-expo"


const AuthSync = () => {

    const {isSignedIn} = useAuth();
    const {user} = useUser();
    const {mutate:syncUser} = useAuthCallback();

    const hasSynced = useRef(false); // useEffect runs only once
    
    useEffect(()=>{
        if(isSignedIn && user && !hasSynced.current){
            hasSynced.current = true;

            syncUser(undefined,{
                onSuccess:(data)=>{
                    console.log(`User ${data.name} synced`)
                },
                onError:(data)=>{
                    console.log(`-- User ${data.name} not synced`);
                }
            })
        }

        if(!isSignedIn){
            hasSynced.current = false;
        }
    },[isSignedIn,user,syncUser])


  return null
}

export default AuthSync