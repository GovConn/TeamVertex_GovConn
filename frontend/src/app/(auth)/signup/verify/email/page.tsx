"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";





const SignupSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required."),
  pinEmail: z.string().min(6, "PIN is required.").max(6, "PIN must be 6 digits."),
});

type SignupValues = z.infer<typeof SignupSchema>;

export default function Page() {

const router = useRouter();
  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
        email: "",
        pinEmail: "",
    },
    mode: "onTouched",
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: SignupValues) => {
    // Replace with your API call / formdata upload
    const { email, pinEmail } = values;
    const payload = {
      email,
      pinEmail
    };

    toast("Submitted", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(payload, null, 2)}</code>
        </pre>
      ),
      position: "top-center",
    });
    router.push("/signup/verify/phone");
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-dvh bg-white">
      <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-8">
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
        <h2 className="text-4xl font-bold">Signup</h2>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4"
            noValidate
          >
            {/* NIC */}
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="sr-only">Email Address</FormLabel>
                    <FormControl>
                    <div>
                        <Input
                        type="text"
                        inputMode="email"
                        placeholder="Email Address"
                        autoComplete="email"
                        {...field}
                        className="w-full border-none rounded-none px-0 py-2 shadow-none focus-visible:ring-0 border-b border-black"
                        />
                        <div className="w-full border-b border-black"></div>
                    </div>
                    </FormControl>
                    <FormMessage className="text-xs text-strokeError" />
                </FormItem>
                )}
            />

                <Button
                  type="button"
                  disabled={isSubmitting}
                  className="w-full"
                  >
                  {isSubmitting ? "Submitting..." : "Send OTP"}
                </Button>





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
                <FormDescription className="text-xs text-center">
                    Please enter the one-time password sent to your email.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="secondary"
              disabled={isSubmitting}
              className="w-full py-4 px-6  font-medium "
            >
              {isSubmitting ? "Submitting..." : "Next"}
            </Button>

            {/* Login link */}
            <div className="text-center text-sm mb-2">
              <span style={{ color: "var(--color-text-grey)" }}>
                Have a validated account?{" "}
              </span>
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
