"use client";

import React from "react";
import { UserResponse } from "../lib/definitions";

interface ITextAreaProps {
  id?: string;
  name?: string;
  value?: string;
  userId: number;
  responses: UserResponse[];
  questionId: number;
}


const TextArea = ({
  id, name, value, userId, responses, questionId
}: ITextAreaProps) => {
  const handleTextChange = (questionId: number, response: string) => {
    const existingResponse = responses.find(response => response.questionId == questionId);
    if (existingResponse) {
      existingResponse.responses[0] = response;
    } else {
      responses.push({
        userId: userId,
        questionId,
        responses: [response]
      });
    }
  };

  return (
    <input
      type="TextArea"
      id={id}
      name={name}
      value={value}
      onChange={(e) => value && handleTextChange(questionId, value)}
      placeholder="Type your response here..."
    />
  );
};


export default TextArea;
