"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface IButtonProps {
  onClick?: () => Promise<any>;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
  size?: string;
  navUrl?: string;
}

const Button: React.FC<IButtonProps> = ({ onClick, children, type, size, navUrl }) => {
  const router = useRouter();
  const handleNavigation = () => {
    if (navUrl) {
      router.push(navUrl);
    };
  };

  return (
    <button
      type={type}
      className={`btn btn-${size} btn-${type}`}
      onClick={navUrl ? handleNavigation : onClick}
    >
      {children}
    </button>
  );
};

export default Button;
