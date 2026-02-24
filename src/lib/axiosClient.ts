import axios from "axios";
import { getAccessToken, setAccessToken } from "@/utils/tokenManager";
import { toast } from "react-hot-toast";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WIDIA_KENCANA_BASE_API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 🧩 Tambahkan Authorization header sebelum request
axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🔄 Tangani token expired
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // ✅ Skip interceptor untuk endpoint tertentu
    const excludedUrls = ["/login", "/refresh-token", "/logout"];
    if (excludedUrls.some((url) => originalRequest.url?.includes(url))) {
      return Promise.reject(error);
    }


    // Kalau bukan 401 atau sudah dicoba ulang → langsung lempar error
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // ⚙️ Kalau belum refresh, buat promise baru
      if (!isRefreshing) {
        isRefreshing = true;
        console.log("🔄 Refreshing token...");

        refreshPromise = axios
          .post(
            `${process.env.NEXT_PUBLIC_WIDIA_KENCANA_BASE_API}/refresh-token`,
            {},
            { withCredentials: true }
          )
          .then((res) => {
            const newToken = res.data?.data?.access_token || res.data?.access_token;
            if (!newToken) throw new Error("No new token received");
            setAccessToken(newToken);
            return newToken;
          })
          .catch((err) => {
            console.log("❌ Token refresh failed:", err.response?.status);
            setAccessToken(null);
            toast.error("Your session has expired. Please log in again.");                                       
            setTimeout(() => {
                window.location.replace("/signin");
            }, 1500);            
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      // 🕓 Tunggu refreshPromise (baik baru dibuat atau sudah ada)
      const newToken = await refreshPromise;
      if (!newToken) {
        console.log("⚠️ Refresh token invalid or missing. No retry.");
        return Promise.reject(error);
      }

      // ✅ Retry request lama pakai token baru
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosClient(originalRequest);

    } catch (err) {
      console.log("🔁 Request retry failed:", err);
      return Promise.reject(error);
    }
  }
);

export default axiosClient;