import * as React from "react";
import { cn } from "../../utils"

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-opacity-100 transition-all cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
