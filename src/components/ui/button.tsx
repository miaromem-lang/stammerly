import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] shadow-lg hover:shadow-xl",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        navy: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:scale-[1.02] font-semibold",
        orange: "bg-accent-orange text-primary-foreground rounded-[30px] shadow-lg hover:shadow-xl hover:scale-110 font-semibold transition-transform",
        sky: "bg-accent text-primary-foreground hover:bg-accent/90 shadow-md hover:shadow-lg hover:scale-[1.02]",
        glass: "bg-card/70 backdrop-blur-xl border border-border/30 text-foreground hover:bg-card/90 shadow-lg",
        hero: "bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-[1.03] font-semibold text-base",
        heroSecondary: "bg-card/80 backdrop-blur-sm border border-border text-foreground hover:bg-card shadow-lg hover:shadow-xl font-medium",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-md hover:shadow-lg",
        kids: "bg-accent-orange text-primary-foreground rounded-[30px] shadow-[4px_4px_0px_0px] shadow-accent-orange/40 hover:shadow-[6px_6px_0px_0px] hover:shadow-accent-orange/50 hover:scale-110 font-bold transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
        kids: "h-14 px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
