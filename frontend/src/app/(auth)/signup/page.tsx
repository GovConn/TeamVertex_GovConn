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
import { useUser } from "@/contexts/UserContext";
import { useAuthTranslations } from "@/hooks/useTranslations";
import { uploadBlob, registerCitizen } from "@/lib/api";

/** Sri Lanka NIC: 12 digits OR 9 digits + v/V */
const nicRegex = /^(?:\d{12}|\d{9}[vV])$/;

/** Sri Lankan phone number regex */
const phoneRegex = /^(?:\+94|94|0)?(?:7[0-9]{8}|[1-9][0-9]{8})$/;

/** Create reusable file schema with translations */
const createFileSchema = (t: (key: string) => string) => {
  return z
    .any()
    .refine((f) => f instanceof File, t('fileRequired'))
    .refine(
      (f) => f instanceof File && f.size <= 5 * 1024 * 1024,
      t('fileSizeLimit')
    )
    .refine(
      (f) => f instanceof File && (f.type.startsWith("image/") || f.type === "application/pdf"),
      t('fileTypeInvalid')
    );
};

/** Create schema with translations */
const createSignupSchema = (t: (key: string) => string) => {
  const fileSchema = createFileSchema(t);
  
  return z.object({
    nic: z
      .string()
      .trim()
      .min(1, t('nicRequired'))
      .regex(nicRegex, t('nicInvalid')),
    firstName: z
      .string()
      .trim()
      .min(1, t('firstNameRequired'))
      .min(2, t('firstNameMinLength'))
      .max(50, t('firstNameMaxLength')),
    lastName: z
      .string()
      .trim()
      .min(1, t('lastNameRequired'))
      .min(2, t('lastNameMinLength'))
      .max(50, t('lastNameMaxLength')),
    email: z
      .string()
      .trim()
      .min(1, t('emailRequired'))
      .email(t('emailInvalid')),
    phone: z
      .string()
      .trim()
      .min(1, t('phoneRequired'))
      .regex(phoneRegex, t('phoneInvalid')),
    nicFront: fileSchema,
    nicBack: fileSchema,
  });
};

export default function Page() {
  const router = useRouter();
  const { setUser, setReferenceId } = useUser();
  const t = useAuthTranslations();
  const [isUploading, setIsUploading] = React.useState(false);

  // Create schema with current language translations
  const SignupSchema = createSignupSchema(t);
  type SignupValues = z.infer<typeof SignupSchema>;

  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      nic: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nicFront: undefined as unknown as File,
      nicBack: undefined as unknown as File,
    },
    mode: "onTouched",
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: SignupValues) => {
    if (isUploading) return;

    setIsUploading(true);
    try {
      const { nic, firstName, lastName, email, phone, nicFront, nicBack } = values;
      const cleanNic = nic.trim().replace(/\s+/g, '');

      toast.loading(t('uploading'), { id: "upload" });
      
      const frontUpload = await uploadBlob(nicFront, `${cleanNic}_nicFront`);
      console.log('Front upload completed:', frontUpload.filename);

      const backUpload = await uploadBlob(nicBack, `${cleanNic}_nicBack`);
      console.log('Back upload completed:', backUpload.filename);

      toast.success("Documents uploaded successfully", { id: "upload" });

      // Register citizen
      toast.loading(t('submitting'), { id: "register" });

      const now = new Date().toISOString();
      const registerData = {
        active: true,
        document_links: [
          { title: "NIC Front", url: frontUpload.url},
          { title: "NIC Back", url: backUpload.url },
        ],
        email,
        first_name: firstName,
        last_name: lastName,
        nic,
        phone,
      };

      const registerResponse = await registerCitizen(registerData);
      
      // Store user data and reference ID
      setUser(registerResponse);
      
      // Format reference ID (pad with zeros if needed and add spaces every 4 digits)
      const formattedReferenceId = registerResponse.reference_id
        .toString()
        .padStart(16, '0')
        .replace(/(.{4})/g, '$1 ')
        .trim();
      
      setReferenceId(formattedReferenceId);

      toast.success("Account created successfully!", { id: "register" });
      
      // Redirect to success page instead of email verification
      router.push("/signup/success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      
      if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
        toast.error("Server is busy. Please wait a moment and try again.", { 
          duration: 5000 
        });
      } else if (errorMessage.includes('Upload failed')) {
        toast.error("File upload failed. Please check your files and try again.");
      } else if (errorMessage.includes('Registration failed')) {
        toast.error("Registration failed. Please check your information and try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      
      console.error('Signup error:', error);
    } finally {
      setIsUploading(false);
    }
  };

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
        <h2 className="text-3xl sm:text-4xl font-bold text-center">{t('signup')}</h2>

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
              render={({ field ,fieldState }) => (
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
 
{fieldState.error && (
  <FormMessage className="text-xs text-strokeError mt-1">
    {fieldState.error.message}
  </FormMessage>
)}
                </FormItem>
              )}
            />

            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field ,fieldState }) => (
                <FormItem>
                  <FormLabel className="sr-only">{t('firstName')}</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="text"
                        placeholder={t('firstName')}
                        autoComplete="given-name"
                        {...field}
                        className="w-full border-none rounded-none px-0 py-3 shadow-none focus-visible:ring-0 border-b border-black text-base"
                      />
                      <div className="w-full border-b border-black"></div>
                    </div>
                  </FormControl>
                
{fieldState.error && (
  <FormMessage className="text-xs text-strokeError mt-1">
    {fieldState.error.message}
  </FormMessage>
)}
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field ,fieldState }) => (
                <FormItem>
                  <FormLabel className="sr-only">{t('lastName')}</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="text"
                        placeholder={t('lastName')}
                        autoComplete="family-name"
                        {...field}
                        className="w-full border-none rounded-none px-0 py-3 shadow-none focus-visible:ring-0 border-b border-black text-base"
                      />
                      <div className="w-full border-b border-black"></div>
                    </div>
                  </FormControl>
        
{fieldState.error && (
  <FormMessage className="text-xs text-strokeError mt-1">
    {fieldState.error.message}
  </FormMessage>
)}
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">{t('email')}</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="email"
                        inputMode="email"
                        placeholder={t('email')}
                        autoComplete="email"
                        {...field}
                        className="w-full border-none rounded-none px-0 py-3 shadow-none focus-visible:ring-0 border-b border-black text-base"
                      />
                      <div className="w-full border-b border-black"></div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-strokeError" />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field ,fieldState }) => (
                <FormItem>
                  <FormLabel className="sr-only">{t('phone')}</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="tel"
                        inputMode="tel"
                        placeholder={t('phone')}
                        autoComplete="tel"
                        {...field}
                        className="w-full border-none rounded-none px-0 py-3 shadow-none focus-visible:ring-0 border-b border-black text-base"
                      />
                      <div className="w-full border-b border-black"></div>
                    </div>
                  </FormControl>
          {fieldState.error && (
  <FormMessage className="text-xs text-strokeError mt-1">
    {fieldState.error.message}
  </FormMessage>
)}
                </FormItem>
              )}
            />

            {/* NIC Front */}
            <FormField
              control={form.control}
              name="nicFront"
              render={({ field ,fieldState }) => (
                <FormItem>
                  <FormLabel className="sr-only">{t('nicFrontUpload')}</FormLabel>
                  <FormControl>
                    <label className="w-full flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer border-input hover:bg-gray-50 transition-colors">
                      <Upload className="size-5 sm:size-6 flex-shrink-0" aria-hidden />
                      <span className="text-sm sm:text-base flex-1">
                        {t('nicFrontUpload')}
                      </span>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          field.onChange(f);
                        }}
                      />
                    </label>
                  </FormControl>
                  {field.value instanceof File ? (
                    <div className="flex items-center gap-2 text-xs text-foreground/80 mt-2">
                      <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                      <span className="truncate">{field.value.name}</span>
                    </div>
                  ) : null}
          {fieldState.error && (
  <FormMessage className="text-xs text-strokeError mt-1">
    {fieldState.error.message}
  </FormMessage>
)}
                </FormItem>
              )}
            />

            {/* NIC Back */}
            <FormField
              control={form.control}
              name="nicBack"
              render={({ field  ,fieldState }) => (
                <FormItem>
                  <FormLabel className="sr-only">{t('nicBackUpload')}</FormLabel>
                  <FormControl>
                    <label className="w-full flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer border-input hover:bg-gray-50 transition-colors">
                      <Upload className="size-5 sm:size-6 flex-shrink-0" aria-hidden />
                      <span className="text-sm sm:text-base flex-1">
                        {t('nicBackUpload')}
                      </span>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          field.onChange(f);
                        }}
                      />
                    </label>
                  </FormControl>
                  {field.value instanceof File ? (
                    <div className="flex items-center gap-2 text-xs text-foreground/80 mt-2">
                      <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                      <span className="truncate">{field.value.name}</span>
                    </div>
                  ) : null}
  
{fieldState.error && (
  <FormMessage className="text-xs text-strokeError mt-1">
    {fieldState.error.message}
  </FormMessage>
)}
                </FormItem>
              )}
            />

            {/* Info text */}
            <div className="text-center text-sm sm:text-base mt-4 mb-4 px-2">
              {t('municipalInfo')}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full py-4 px-6 bg-mainYellow text-textBlack font-semibold rounded-2xl hover:bg-buttonPrimaryHover disabled:bg-bgDisabled disabled:text-textGrey transition-colors duration-200 text-base"
            >
              {isSubmitting || isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-textGrey border-t-transparent rounded-full animate-spin"></div>
                  {isUploading ? t('uploading') : t('submitting')}
                </div>
              ) : (
                t('createAccount')
              )}
            </Button>

            {/* Login link */}
            <div className="text-center text-sm mb-2">
              <span style={{ color: "var(--color-text-grey)" }}>
                {t('haveAccount')}{" "}
              </span>
              <Link href="/login" className="underline">
                {t('login')}
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
