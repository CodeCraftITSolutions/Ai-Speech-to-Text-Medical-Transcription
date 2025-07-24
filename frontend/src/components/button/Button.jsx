import React from "react";
import clsx from "clsx";

export const Button = ({
  type = "primary", // "primary" | "secondary" | "destructive" | "outline"
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const typeStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <button
      {...props}
      className={clsx(baseStyles, typeStyles[type], className)}
    >
      {children}
    </button>
  );
};
