"use client";

import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { loginUser, decodeToken } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { AuthContext } from "@/lib/context/auth-context";

export function LoginForm({ dictionary }: { dictionary: any }) {
  const router = useRouter();
  const params = useParams<{ lang: Locale }>();
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema(dictionary)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      // Extract token from response
      const token = response.data?.token;
      if (token && authContext) {
        authContext.refreshUser();
      } else {
        setError("No token received from server");
      }
    },
    onError: (error: any) => {
      console.error("Login form error:", error);

      // Display a user-friendly error message
      if (
        error.message &&
        error.message.includes("Cannot connect to the server")
      ) {
        setError(
          "Cannot connect to the server. Please check your internet connection or try again later.",
        );
      } else {
        setError(error.message || dictionary.login.errors.invalidCredentials);
      }
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setError(null);
    login(data);
  };

  return (
    <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="email">{dictionary.login.email}</Label>
          <div className="mt-1">
            <Input
              id="email"
              type="email"
              placeholder={dictionary.login.emailPlaceholder}
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="password">{dictionary.login.password}</Label>
          <div className="mt-1">
            <Input
              id="password"
              type="password"
              placeholder={dictionary.login.passwordPlaceholder}
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox id="remember-me" />
            <Label htmlFor="remember-me" className="ml-2">
              {dictionary.login.rememberMe}
            </Label>
          </div>
          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {dictionary.login.forgotPassword}
            </a>
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {dictionary.login.submit}
              </span>
            ) : (
              dictionary.login.submit
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
