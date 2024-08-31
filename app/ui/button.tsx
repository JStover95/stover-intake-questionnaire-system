import React, { useState } from "react";

interface IButtonProps {
  onClick?: () => Promise<any>;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset" | undefined;
  size?: string;
}

const Button: React.FC<IButtonProps> = ({ onClick, children, type, size }) => {
  return (
    <button
      type={type}
      className={`btn btn-${size} btn-${type}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
