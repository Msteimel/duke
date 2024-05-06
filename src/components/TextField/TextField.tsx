import React, { ChangeEvent, useState } from "react";
import cx from "classnames";
import "./textField.css";
import { Label, LabelProps } from "components/Label/Label";
import { TextInput, TextInputProps } from "components/TextInput/TextInput";

export interface TextFieldProps extends TextInputProps, LabelProps {
  /**
   * Label for input
   */
  label?: string;
  /**
   * Label of displayed value
   */
  displayValueLabel?: string;
}

export const TextField = ({
  className,
  label,
  id,
  disabled = false,
  required = false,
  error = false,
  placeholder,
  defaultValue,
  displayValueLabel,
  onChange,
}: TextFieldProps) => {
  // Initialize state for the input value
  const [inputValue, setInputValue] = useState(defaultValue || "");

  // Custom onChange handler to update state
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value); // Update the state with new input value

    if (onChange) {
      onChange(event); // Call external onChange handler if provided
    }
  };

  const componentClassName = cx("text-field", className, {
    "text-field--error": error,
  });

  return (
    <div className={componentClassName}>
      <Label
        className="text-field__label"
        htmlFor={id}
        text={label}
        required={required}
      />
      <TextInput
        id={id}
        name={id}
        placeholder={placeholder}
        value={inputValue} // Controlled component
        onChange={handleChange}
      />
      {/* Display the label and the current input value */}
      {displayValueLabel && (
        <span className="text-field__display-label">{`${displayValueLabel} ${inputValue}`}</span>
      )}
    </div>
  );
};
