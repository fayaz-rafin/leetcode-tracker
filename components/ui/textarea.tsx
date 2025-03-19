// components/ui/textarea.tsx
import * as React from "react";

import { cn } from "@/lib/utils";

// If the cn function is not defined in "@/lib/utils", you can define it here
// function cn(...classes: string[]) {
//   return classes.filter(Boolean).join(' ');
// }

/**
 * Props for the Textarea component.
 * 
 * This interface extends the standard HTML attributes for a textarea element.
 * 
 * @extends React.TextareaHTMLAttributes<HTMLTextAreaElement>
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  customProp?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
