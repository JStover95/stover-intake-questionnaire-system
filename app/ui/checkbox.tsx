"use client";

import React from "react";

interface ICheckboxProps {
  id?: string;
  name?: string;
  value?: string;
  checked?: boolean;
}


const CheckBox = ({
  id, name, value, checked
}: ICheckboxProps) => {
  return (
    <React.Fragment>
      <input
        type="checkbox"
        id={id}
        name={name}
        defaultChecked={checked}
        value={value}
      />
      <label htmlFor={id}>{value}</label>
    </React.Fragment>
  );
};


export default CheckBox;