"use client";

import React from "react";

interface IRadioProps {
  id?: string;
  name?: string;
  value?: string;
  checked?: boolean;
}


const Radio = ({
  id, name, value, checked
}: IRadioProps) => {
  return (
    <React.Fragment>
      <input
        type="radio"
        id={id}
        name={name}
        defaultChecked={checked}
        value={value}
      />
      <label htmlFor={id}>{value}</label>
    </React.Fragment>
  );
};


export default Radio;