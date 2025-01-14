import React from "react";
import MainNavBar from "../components/shared/MainNavBar.jsx";
import logo from "../assets/images/BW Integrated Systems.png";
import { useCheckoutForm } from "../components/entry/useCheckoutForm";
import { useCheckoutData } from "../components/entry/useCheckoutData";
import { useCheckoutSubmit } from "../components/entry/useCheckoutSubmit";
import CheckoutField from "../components/entry/CheckoutField";

function Checkout() {
  const { options, idMappings } = useCheckoutData();
  const { formData, setFormData, shouldShowField, handleInputChange } =
    useCheckoutForm(options);
  const { handleSubmit } = useCheckoutSubmit(formData, idMappings, setFormData);

  const fields = [
    {
      label: "Name",
      name: "name",
      placeholder: "Type or select name...",
      options: options.users,
    },
    {
      label: "Project",
      name: "project",
      placeholder: "Type or select project...",
      options: options.projects,
    },
    {
      label: "Item",
      name: "item",
      placeholder: "Type or select item...",
      options: options.items,
    },
    {
      label: "Quantity",
      name: "quantity",
      placeholder: "Enter quantity...",
      pattern: "^\\d*\\.?\\d*$",
    },
  ];

  return (
    <div>
      <div className="logo-container">
        <img src={logo} alt="BW Integrated Systems" className="logo-image" />
      </div>
      <MainNavBar />

      <div className="container">
        <div className="checkout-form-container">
          <h1 className="checkout-title">Cable Checkout</h1>

          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-fields-horizontal">
              {fields.map((field) => (
                <CheckoutField
                  key={field.name}
                  {...field}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  showField={shouldShowField(field.name)}
                />
              ))}
            </div>

            <div className="checkout-submit">
              <button
                type="submit"
                className="checkout-button"
                disabled={!shouldShowField("quantity") || !formData.quantity}
              >
                Submit Checkout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
