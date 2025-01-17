// ../components/entry/useCheckoutForm.jsx
import { useState, useRef } from "react";

export const useCheckoutForm = (options) => {
  const [formData, setFormData] = useState({
    name: "",
    project: "",
    item: "",
    quantity: "",
  });

  // Create refs for each field
  const projectInputRef = useRef(null);
  const itemInputRef = useRef(null);
  const quantityInputRef = useRef(null);

  const isValidSelection = (value, optionsArray) => {
    return optionsArray.includes(value);
  };

  const shouldShowField = (fieldName) => {
    switch (fieldName) {
      case "name":
        return true;
      case "project":
        return isValidSelection(formData.name, options.users);
      case "item":
        return (
          isValidSelection(formData.project, options.projects) &&
          shouldShowField("project")
        );
      case "quantity":
        return (
          isValidSelection(formData.item, options.items) &&
          shouldShowField("item")
        );
      default:
        return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      // Clear subsequent fields when a previous field changes
      ...(name === "name" && { project: "", item: "", quantity: "" }),
      ...(name === "project" && { item: "", quantity: "" }),
      ...(name === "item" && { quantity: "" }),
    }));

    // Auto-focus next field if the current selection is valid
    if (value) {
      switch (name) {
        case "name":
          if (
            isValidSelection(value, options.users) &&
            projectInputRef.current
          ) {
            projectInputRef.current.focus();
          }
          break;
        case "project":
          if (
            isValidSelection(value, options.projects) &&
            itemInputRef.current
          ) {
            itemInputRef.current.focus();
          }
          break;
        case "item":
          if (
            isValidSelection(value, options.items) &&
            quantityInputRef.current
          ) {
            quantityInputRef.current.focus();
          }
          break;
      }
    }
  };

  return {
    formData,
    setFormData,
    shouldShowField,
    handleInputChange,
    isValidSelection,
    refs: {
      projectInputRef,
      itemInputRef,
      quantityInputRef,
    },
  };
};
