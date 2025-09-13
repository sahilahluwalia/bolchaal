import React from "react";

export type InputFieldProps = {
  id: string;
  name: string;
  label?: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
};

export function InputField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  error,
  className,
  inputClassName,
  labelClassName,
  disabled,
}: InputFieldProps) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className={`ui:block ui:text-sm ui:font-medium ui:text-gray-700 ui:mb-1 ${labelClassName ?? ""}`}>
          {label} {required ? <span className="ui:text-red-500">*</span> : null}
        </label>
      ) : null}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        className={`ui:w-full ui:px-3 ui:py-2 text-black ui:border ui:rounded-md ui:shadow-sm ui:placeholder-gray-400 focus:ui:outline-none focus:ui:ring-2 focus:ui:ring-indigo-500 focus:ui:border-indigo-500 ui:transition-colors ${
          error ? "ui:border-red-300" : "ui:border-gray-300"
        } ${disabled ? "ui:bg-gray-50 ui:cursor-not-allowed ui:opacity-70" : ""} ${inputClassName ?? ""}`}
      />
      {error ? (
        <p id={describedBy} className="ui:mt-1 ui:text-sm ui:text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
