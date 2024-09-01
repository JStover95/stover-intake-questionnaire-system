"use client";

import React from "react";
import { UserResponse } from "../lib/definitions";

interface ICheckboxProps {
  id?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  userId: number;
  responses: UserResponse[];
  questionId: number;
}


const CheckBox = ({
  id, name, value, checked, userId, responses, questionId
}: ICheckboxProps) => {
  const handleCheckboxChange = (questionId: number, response: string, checked: boolean) => {
    const existingResponse = responses.find(response => response.questionId == questionId);
    if (existingResponse) {
      if (checked) {
        existingResponse.responses.push(response);
      } else {
        const index = existingResponse.responses.findIndex(res => res == response);
        existingResponse.responses.splice(index, 1);
      }
    } else {
      responses.push({
        userId,
        questionId,
        responses: [response]
      });
    }
  };

  return (
    <React.Fragment>
      <input
        type="checkbox"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => value && handleCheckboxChange(questionId, value, e.target.checked)}
      />
      <label htmlFor={id}>{value}</label>
    </React.Fragment>
  );
};


export default CheckBox;