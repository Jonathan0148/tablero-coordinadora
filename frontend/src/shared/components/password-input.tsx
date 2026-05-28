"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { cn } from "@/shared/utils/cn";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, wrapperClassName, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className={cn("relative", wrapperClassName)}>
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "h-11 w-full rounded-app bg-app-input py-2 pl-3 pr-11 text-sm text-app-fg",
            "outline-none transition duration-200",
            "placeholder:text-app-muted/70",
            "focus:bg-app-surface focus:ring-2 focus:ring-app-accent/25",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setVisible((v) => !v)}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5",
            "text-app-muted transition hover:bg-app-hover hover:text-app-fg",
          )}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
