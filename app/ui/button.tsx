"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface IButtonProps {
  onClick?: () => any;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset" | undefined;
  navUrl?: string;
}

const Button: React.FC<IButtonProps> = ({ onClick, children, className, type, navUrl }) => {
  const router = useRouter();
  const handleNavigation = () => {
    if (navUrl) {
      router.push(navUrl);
    };
  };

  return (
    <button
      type={type}
      onClick={navUrl ? handleNavigation : onClick}
      className={className ? className : ""}
    >
      {children}
    </button>
  );
};

export default Button;
