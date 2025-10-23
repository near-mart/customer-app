// api.js
import { notify } from '@/functions/notify';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


const api = axios.create({
    baseURL: process.env.BASE_URL,
    withCredentials: true,
});

// Add request interceptor
api.interceptors.request.use(
    async (config: any) => {
        let token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const { exp }: { exp: number } = jwtDecode(token);
                if (exp < Date.now() / 1000 && config.url !== 'auth/refresh-token') {
                    // 
                }
            } catch (err) {
                console.log(err);
            }
            console.log('Final Request Config:', config.url);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => {
        const statusCode = error?.response?.status;
        // console.error("Axios request error:", error?.response);
        // const currentPath = window.location.pathname.replace(/\/$/, "");
        // if (statusCode === 503 && currentPath !== "/maintenance") {
        //     window.location.replace("/maintenance");
        // }
        if (statusCode === 401) {
            // localStorage.clear()
            // window.location.replace("/login");
            // notify("Un Authorized Request")
        }

        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            localStorage.clear()
            notify("Un Authorized Request")
            window.location.replace("/login");
        }
        return Promise.reject(error);
    }
);
export { api };