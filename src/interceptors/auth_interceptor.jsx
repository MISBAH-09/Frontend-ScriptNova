import axios from "axios";

const AuthInterceptor = axios.create({
  baseURL: "http://localhost:8000",
});

AuthInterceptor.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("userToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default AuthInterceptor;
