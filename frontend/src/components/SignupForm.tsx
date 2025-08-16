"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

/** Sri Lanka NIC: 12 digits OR 9 digits + v/V */
const nicRegex = /^(?:\d{12}|\d{9}[vV])$/;

/** Reusable image file schema (<= 5MB, image/*) */
const imageFileSchema = z
  .any()
  .refine((f) => f instanceof File, "Image is required.")
  .refine((f) => f instanceof File && f.size <= 5 * 1024 * 1024, "Max size 5MB.")
  .refine(
    (f) => f instanceof File && f.type.startsWith("image/"),
    "Must be an image (JPEG/PNG/WebP)."
  );

const SignupSchema = z.object({
  nic: z
    .string()
    .trim()
    .min(1, "NIC is required.")
    .regex(nicRegex, "Enter a valid NIC (12 digits or 9 digits + v)."),
  nicFront: imageFileSchema,
  nicBack: imageFileSchema,
});

type SignupValues = z.infer<typeof SignupSchema>;

export default function Page() {
    const router = useRouter();

  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      nic: "",
      nicFront: undefined as unknown as File, // RHF expects something; we'll set via onChange
      nicBack: undefined as unknown as File,
    },
    mode: "onTouched",
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: SignupValues) => {
    // Replace with your API call / formdata upload
    const { nic, nicFront, nicBack } = values;
    const payload = {
      nic,
      nicFront: nicFront?.name,
      nicBack: nicBack?.name,
    };

    toast("Submitted", {
      description: (
        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
          <code className="text-white">{JSON.stringify(payload, null, 2)}</code>
        </pre>
      ),
      position: "top-center",
    });
    router.push("/signup/verify/email");
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
              name="nic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">NIC Number</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="NIC Number"
                        autoComplete="username"
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

            {/* NIC Front */}
            <FormField
              control={form.control}
              name="nicFront"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">NIC Front</FormLabel>
                  <FormControl>
                    <label className="w-full flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer border-input">
                      <Upload className="size-6" aria-hidden />
                      <span className="text-sm">
                        Clear image of NIC – Front (JPEG/PNG, max 5MB)
                      </span>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          field.onChange(f);
                        }}
                      />
                    </label>
                  </FormControl>
                  {field.value instanceof File ? (
                    <div className="flex items-center gap-2 text-xs text-foreground/80 mt-1">
                      <CheckCircle2 className="size-3.5" />
                      <span className="truncate">{field.value.name}</span>
                    </div>
                  ) : null}
                  <FormMessage className="text-xs text-strokeError" />
                </FormItem>
              )}
            />

            {/* NIC Back */}
            <FormField
              control={form.control}
              name="nicBack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">NIC Back</FormLabel>
                  <FormControl>
                    <label className="w-full flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer border-input">
                      <Upload className="size-6" aria-hidden />
                      <span className="text-sm">
                        Clear image of NIC – Back (JPEG/PNG, max 5MB)
                      </span>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          field.onChange(f);
                        }}
                      />
                    </label>
                  </FormControl>
                  {field.value instanceof File ? (
                    <div className="flex items-center gap-2 text-xs text-foreground/80 mt-1">
                      <CheckCircle2 className="size-3.5" />
                      <span className="truncate">{field.value.name}</span>
                    </div>
                  ) : null}
                  <FormMessage className="text-xs text-strokeError" />
                </FormItem>
              )}
            />

            {/* Info text */}
            <div className="text-center text-base mt-2 mb-2">
              You will need to visit your nearest <b>Municipal council</b> to validate
              and receive the password.
            </div>

  

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
                              "Next"
                            )}
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
