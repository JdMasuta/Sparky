// ../components/entry/useCheckoutForm.jsx
import { useState } from "react";

export const useCheckoutForm = (options) => {
  const [formData, setFormData] = useState({
    name: "",
    project: "",
    item: "",
    quantity: "",
  });

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
  };

  return {
    formData,
    setFormData,
    shouldShowField,
    handleInputChange,
    isValidSelection,
  };
};
