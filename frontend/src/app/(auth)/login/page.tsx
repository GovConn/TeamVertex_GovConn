"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useAuthTranslations } from "@/hooks/useTranslations"; // Updated import

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Sri Lanka NIC: 12 digits OR 9 digits + X/V (case-insensitive)
const nicRegex = /^(?:\d{12}|\d{9}[vV])$/;

// Create schema using the auth translation hook
const createLoginSchema = (t: (key: string) => string) => {
  return z.object({
    nic: z
      .string()
      .trim()
      .min(1, t('nicRequired'))
      .regex(nicRegex, t('nicInvalid')),
    password: z
      .string()
      .min(1, t('passwordRequired'))
      .min(8, t('passwordMinLength')),
    captcha: z
      .boolean()
      .refine((v) => v === true, { message: t('captchaRequired') }),
  });
};

export default function Page() {
  const { login, isAuthenticated, isLoading } = useUser();
  const t = useAuthTranslations(); // Use namespace-specific hook
  const router = useRouter();

  // Create schema with current language translations
  const LoginSchema = createLoginSchema(t);
  type LoginValues = z.infer<typeof LoginSchema>;

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      nic: "",
      password: "",
      captcha: false,
    },
    mode: "onTouched",
  });

  const { isSubmitting } = form.formState;

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (values: LoginValues) => {
    try {
      toast.loading(t('loggingIn'), { id: "login" });
      
      const success = await login(values.nic, values.password);
      
      if (success) {
        toast.success(t('loginSuccess'), { id: "login" });
        router.push("/");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast.error(t('invalidCredentials'), { id: "login" });
      } else if (errorMessage.includes('400')) {
        toast.error(t('checkCredentials'), { id: "login" });
      } else if (errorMessage.includes('429')) {
        toast.error(t('tooManyAttempts'), { id: "login" });
      } else {
        toast.error(t('loginFailed'), { id: "login" });
      }
      
      console.error('Login error:', error);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-dvh bg-white">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">{t('loading')}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-dvh bg-white px-4 py-8">
      <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
        {/* Logo */}
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={1000}
          height={500}
          priority
          className="object-contain mb-4 max-w-48 sm:max-w-64"
        />

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center">
          {t('login')}
        </h2>

        {/* Login Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4"
            noValidate
          >
            {/* NIC */}
            <FormField
              control={form.control}
              name="nic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">{t('nicNumber')}</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder={t('nicNumber')}
                        autoComplete="username"
                        {...field}
                        className="w-full border-none rounded-none px-0 py-3 shadow-none focus-visible:ring-0 border-b border-black text-base"
                      />
                      <div className="w-full border-b border-black"></div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel className="sr-only">{t('password')}</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="password"
                        placeholder={t('password')}
                        autoComplete="current-password"
                        {...field}
                        className="w-full border-none rounded-none px-0 py-3 shadow-none focus-visible:ring-0 border-b border-black text-base"
                      />
                      <div className="w-full border-b border-black"></div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Captcha */}
            <FormField
              control={form.control}
              name="captcha"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <div className="w-full flex items-center gap-3 border rounded-lg px-4 py-3 border-input">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(Boolean(v))}
                        id="captcha"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="captcha"
                      className="text-sm cursor-pointer select-none flex-1"
                    >
                      {t('notRobot')}
                    </FormLabel>
                  </div>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-mainYellow text-textBlack font-semibold rounded-2xl hover:bg-buttonPrimaryHover disabled:bg-bgDisabled disabled:text-textGrey transition-colors duration-200 text-base mt-6"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-textGrey border-t-transparent rounded-full animate-spin"></div>
                  {t('loggingIn')}
                </div>
              ) : (
                t('login')
              )}
            </Button>

            {/* Sign up link */}
            <div className="text-center text-sm mt-4">
              <span style={{ color: "var(--color-text-grey)" }}>
                {t('noAccount')}{" "}
              </span>
              <Link href="/signup" className="underline text-blue-600 hover:text-blue-800">
                {t('signup')}
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
