"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axiosClient from "@/lib/axiosClient";
import { setAccessToken } from "@/utils/tokenManager";
import { toast } from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";


type User = {
  userID: string;
  name: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 🔹 Saat pertama kali load, cek apakah masih ada access token
  useEffect(() => {
    const initAuth = async () => {            


        if (pathname === "/signin") {
            setLoading(false);
            return;
        }
        

      try {                     
        const res = await axiosClient.get("/me");
        setUser({
            userID: res.data?.data?.userID ?? "",
            name: res.data?.data?.name ?? "",
            role: res.data?.data?.role ?? "",
        });

      } catch (err) {
        console.warn("Session expired or invalid:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);


  // 🔹 Login (save token & user)
  const login = async (email: string, password: string) => {
    try {
      const res = await axiosClient.post("/login", { email, password }, { withCredentials: true });
      const token = res.data?.data?.access_token;
      if (token) setAccessToken(token);
      setUser({
        userID: res.data?.data?.userID ?? "",
        name: res.data?.data?.name ?? "",
        role: res.data?.data?.role ?? "",
      });

      toast.success("Login successful!");
          
        setTimeout(() => {
            router.replace("/");
        }, 1000);
      
    } catch (err: any) {
        const msg =
        err.response?.status === 401
            ? "Invalid email or password"
            : "Login failed. Please try again later.";
        toast.error(msg);
        setUser(null);
        throw err; // biar SignInForm tetap bisa tahu kalau gagal            
    }
  };

  // 🔹 Logout (hapus token & reset user)
  const logout = async () => {
    try {
      await axiosClient.post("/logout", {}, { withCredentials: true });
    } catch {
      // tetap hapus token walau API gagal
    } finally {
      setAccessToken(null);
      setUser(null);
      toast.success("Logged out successfully!");
       setTimeout(() => {
            router.replace("/signin");
        }, 1000);
    }
  };

    

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
        <AnimatePresence mode="sync">
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative z-10"
        >
          {children}
        </motion.div>       
        </AnimatePresence>

        {/* Overlay di atas dashboard saat belum login / loading */}
        {((loading || !user) && pathname !== "/signin") && (
            <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-row items-center">                  
                    <Image
                        width={65}
                        height={65}
                        src="/images/widia-kencana/logo-widia.png"
                        alt="Logo Icon"
                        className="drop-shadow-lg mb-7"
                        priority
                        />
                        <Image
                        width={240}
                        height={80}
                        src="/images/widia-kencana/text-widia-kencana.png"
                        alt="Logo Text"
                        className="drop-shadow-md mb-7"
                        priority
                        />                                                 
                </div>
                <div className="flex gap-2">
                    <div className="h-3 w-3 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-3 w-3 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-3 w-3 bg-gray-600 rounded-full animate-bounce" />
                </div>
            </div>
            
        )}
    </AuthContext.Provider>
  );
};

// 🔹 Hook helper
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};