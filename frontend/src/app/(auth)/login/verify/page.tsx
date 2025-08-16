"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { REGEXP_ONLY_DIGITS } from "input-otp";

// Sri Lanka NIC: 12 digits OR 9 digits + X/V (case-insensitive)


const FormSchema = z.object({
  pinEmail: z.string()
    .regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits." }),
  pinPhone: z.string()
    .regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits." }),
    captcha: z
    .boolean()
    .refine((v) => v === true, { message: "Please verify the captcha." }),
})

type LoginValues = z.infer<typeof FormSchema>;

export default function Page() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pinEmail: "",
      pinPhone: "",
    },
  })

  const onSubmit = async (values: LoginValues) => {
    // TODO: replace with your auth call
    toast("Submitted", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
      position: "top-center",
    });
  };

  const { isSubmitting } = form.formState;

  return (
    <section className="flex flex-col items-center justify-center min-h-dvh bg-white">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-8 text-center">
        {/* Logo */}
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={1000}
          height={500}
          priority
          className="object-contain mb-8"
        />

        {/* Title */}
        <h2 className="text-4xl font-bold">Login</h2>

        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-4/5 space-y-6 flex flex-col items-center justify-center"  >
        <FormField
          control={form.control}
          name="pinEmail"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col items-center">
              <FormLabel>OTP from email</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field} className="w-full" pattern={REGEXP_ONLY_DIGITS}>
                  <InputOTPGroup className="grid grid-cols-6 rounded-none">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription className="text-xs">
                Please enter the one-time password sent to your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
            
          )}
        />

        <FormField
          control={form.control}
          name="pinPhone"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col items-center">
              <FormLabel>OTP from phone</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field} className="w-full" pattern={REGEXP_ONLY_DIGITS}>
                  <InputOTPGroup className="grid grid-cols-6 rounded-none">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription className="text-xs">
                Please enter the one-time password sent to your phone.
              </FormDescription>
              <FormMessage />
            </FormItem>
            
          )}
        />
        <FormField
            control={form.control}
            name="captcha"
            render={({ field }) => (
                <FormItem className="">
                <div className="w-full flex items-center just gap-2 border rounded-40 px-3 py-2 border-input">
                    <FormControl>
                    <Checkbox
                        checked={field.value}
                        // shadcn Checkbox uses boolean | "indeterminate"
                        onCheckedChange={(v) => field.onChange(Boolean(v))}
                        id="captcha"
                    />
                    </FormControl>
                    <FormLabel
                    htmlFor="captcha"
                    className="text-sm cursor-pointer select-none"
                    >
                    Login without OTP next time
                    </FormLabel>
                </div>
                <FormMessage className="text-xs" />
                </FormItem>
            )}
            />

            {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-mainYellow text-textBlack font-semibold rounded-2xl hover:bg-buttonPrimaryHover disabled:bg-bgDisabled disabled:text-textGrey transition-colors duration-200 text-base"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-textGrey border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </Button>
            {/* Sign up link */}
            <div className="text-center text-sm">
              <span style={{ color: "var(--color-text-grey)" }}>
                Don&apos;t have an account?{" "}
              </span>
              <Link href="/signup" className="underline">
                sign up
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}

