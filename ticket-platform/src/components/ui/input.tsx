"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, ...props }, ref) => {
    const isPassword = type === "password";
    const [visible, setVisible] = useState(false);

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isPassword && visible ? "text" : type}
            className={cn(
              "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
              isPassword && "pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
              tabIndex={-1}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
