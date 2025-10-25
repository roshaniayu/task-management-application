import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
