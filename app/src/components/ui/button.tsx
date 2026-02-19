import * as React from "react"
// import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Note: I need to install @radix-ui/react-slot and class-variance-authority first.
// I'll add a comment to install them or I'll just skip Slot for now and use standard props if I can't install.
// But to be premium, I should use standard patterns.
// I will assume I can run `npm install class-variance-authority clsx tailwind-merge @radix-ui/react-slot` later if missing.
// Actually I already installed clsx and tailwind-merge. I missed cva and slot.
// I will implement a simpler version without Slot/CVA for now to avoid more dependency hell, 
// OR I will install them. Let's install them, it's better.

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-md",
    {
        variants: {
            variant: {
                default: "bg-primary/80 text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-primary/20",
                destructive:
                    "bg-destructive/80 text-destructive-foreground hover:bg-destructive/90 border border-destructive/20",
                outline:
                    "border border-input bg-background/20 hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent/20 hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                glass: "bg-white/5 border border-white/10 hover:bg-white/10 text-white shadow-lg backdrop-blur-lg",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
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
        const Comp = "button"
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
