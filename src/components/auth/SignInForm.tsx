"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Schema validasi Zod
const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleLogin = async (data: FormData) => {
  setLoading(true);
  try {
    await login(data.email, data.password);
    // ✅ Tidak perlu toast atau redirect di sini
  } catch {
    // optional — kalau mau log aja tanpa toast
    console.warn("Login failed");
  } finally {
    setLoading(false);
  }
};


  
  return (
   
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Sign In
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your email and password to sign in!
              </p>
            </div>
            <div>
              
            <form onSubmit={handleSubmit(handleLogin)}>
                
                <div className="space-y-6">
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input placeholder="info@gmail.com" type="email" {...register("email")} />                     
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Password <span className="text-error-500">*</span>{" "}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Enter your password"
                      />                      
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                      )}
                  </div>                
                  <div>
                    <Button 
                      className="h-11 w-full bg-brand-widia hover:bg-brand-widia-hover disabled:bg-brand-widia" size="sm" 
                      disabled={loading}
                    >                      

                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </span>                          
                        </span>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                    

                  </div>
                </div>
              </form>            
            </div>
          </div>
        </div>
      </div>
    
  );
}
