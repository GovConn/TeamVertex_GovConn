import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-poppins rounded-[var(--radius)] cursor-pointer text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-strokeFocused)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-buttonPrimaryDefault)] text-[var(--color-buttonPrimaryTextDefault)] hover:bg-buttonPrimaryDefault/80 hover:text-[var(--color-buttonPrimaryTextHover)] disabled:bg-[var(--color-buttonPrimaryDisabled)] focus-visible:ring-[var(--color-buttonPrimaryStrokeFocused)]",
        secondary:
          "bg-buttonSecondaryDefault text-[var(--color-buttonSecondaryTextDefault)] hover:bg-buttonSecondaryDefault/80 hover:text-[var(--color-buttonSecondaryTextHover)] disabled:bg-[var(--color-buttonSecondaryDefault)] focus-visible:ring-[var(--color-buttonSecondaryStrokeFocused)]",
        outline:
          "border border-[var(--color-strokeGrey)] bg-[var(--color-bgWhite)] text-[var(--color-textBlack)] hover:bg-[var(--color-bgDisabled)]",
        destructive:
          "bg-[var(--color-strokeError)] text-[var(--color-textWhite)] hover:bg-[var(--color-strokeError)]/90",
        ghost:
          "bg-transparent text-[var(--color-textBlack)] hover:bg-[var(--color-bgDisabled)]",
        link: "underline-offset-4 hover:underline text-[var(--color-buttonPrimaryDefault)]",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-40",
        sm: "h-9 rounded-[calc(var(--radius)-0.25rem)] px-3",
        lg: "h-11 rounded-[calc(var(--radius)+0.25rem)] px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
