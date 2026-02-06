import axios from 'axios'
import { useAuth } from '@clerk/clerk-expo'
import { useEffect,useCallback } from 'react'


//const API_URL = "https://bolt-chat-backend.onrender.com/api"
const API_URL = "http://10.186.137.62:3000/api";
//const API_URL = "https://dionne-canonical-jessika.ngrok-free.dev/api"


const api = axios.create({
    baseURL:API_URL,
    headers:{
        "Content-Type":"application/json",
    },
});


export const useApi = () => {
  const { getToken } = useAuth();

  const apiWithAuth = useCallback(
    async <T>(config: Parameters<typeof api.request>[0]) => {
      const token = await getToken();
      return api.request<T>({
        ...config,
        headers: { ...config.headers, ...(token && { Authorization: `Bearer ${token}` }) },
      });
    },
    [getToken]
  );

  return { api, apiWithAuth };
};