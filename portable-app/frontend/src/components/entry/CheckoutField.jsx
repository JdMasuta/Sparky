// ../components/entry/CheckoutField.jsx
import React from "react";

const CheckoutField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  options = [],
  pattern,
  showField = true,
  type = "text",
}) => {
  if (!showField) return null;

  const isDropdown = options.length > 0;

  return (
    <div className="checkout-field fade-in">
      <label htmlFor={name} className="checkout-label">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="checkout-input"
        placeholder={placeholder}
        pattern={pattern}
        list={isDropdown ? `${name}-list` : undefined}
        autoComplete="off"
      />
      {isDropdown && (
        <datalist id={`${name}-list`}>
          {options.map((option, index) => (
            <option key={index} value={option} />
          ))}
        </datalist>
      )}
    </div>
  );
};

export default CheckoutField;
