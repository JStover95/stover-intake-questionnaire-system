"use client";

import React from "react";

interface ITextAreaProps {
  id?: string;
  name?: string;
  value?: string;
}


const TextArea = ({
  id, name, value
}: ITextAreaProps) => {
  return (
    <input
      type="TextArea"
      id={id}
      name={name}
      defaultValue={value}
      placeholder="Type your response here..."
    />
  );
};


export default TextArea;
