import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, children, fullWidth, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative rounded-md font-medium text-white shadow-md transition-all",
          {
            "w-full": fullWidth,
            "gradient-btn": variant === "primary",
            "border border-primary bg-transparent hover:bg-primary/10": variant === "outline",
            "bg-gray-700 hover:bg-gray-600": variant === "secondary",
            "py-1.5 px-3 text-sm": size === "sm",
            "py-3 px-4": size === "md",
            "py-4 px-6 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GradientButton.displayName = "GradientButton";

export default GradientButton;
