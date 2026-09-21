import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkwMjMzMzgyLCJpYXQiOjE3ODk2Mjg1ODIsImp0aSI6IjkxNmQzMzg0NTE1OTQ1MTZiZDA2MGYxMjQ0OGIzM2ZiIiwidXNlcl9pZCI6IjEifQ.sxcIaMvIGm1UdfUgTI0Lj1NFsIhWpQ514fTE-4ZWDcg";
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;