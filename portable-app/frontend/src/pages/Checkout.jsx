import React, { useState, useEffect } from "react";
import MainNavBar from "../components/shared/MainNavBar.jsx";
import Modal from "../components/shared/Modal.jsx";
import logo from "../assets/images/BW Integrated Systems.png";
import { useCheckoutForm } from "../components/entry/useCheckoutForm";
import { useCheckoutData } from "../components/entry/useCheckoutData";
import { useCheckoutSubmit } from "../components/entry/useCheckoutSubmit";
import { useRSLinxMonitor } from "../components/entry/useRSLinxMonitor";
import { usePLCTags } from "../components/entry/usePLCTags";
import { useFieldAutomation } from "../components/entry/useFieldAutomation";
import CheckoutField from "../components/entry/CheckoutField";

function Checkout() {
  const [showPullModal, setShowPullModal] = useState(false);
  const { options, idMappings } = useCheckoutData();
  const {
    formData,
    setFormData,
    shouldShowField,
    handleInputChange,
    isValidSelection,
  } = useCheckoutForm(options);
  const { handleSubmit: submitCheckout, resetForm } = useCheckoutSubmit(
    formData,
    idMappings,
    setFormData
  );
  const { startMonitoring, stopMonitoring, isMonitoring } = useRSLinxMonitor();
  const { writeToPLC, resetStepInPLC } = usePLCTags();
  const { fieldRefs, focusNextField } = useFieldAutomation();

  const [isFirstLoad, setIsFirstLoad] = useState(true); // Track first load

  // Focus the first field only on initial page load
  useEffect(() => {
    if (isFirstLoad && fieldRefs.name) {
      fieldRefs.name.current.focus(); // Focus the first field (name)
      resetStepInPLC(); // Reset the step number in PLC
      setIsFirstLoad(false); // Set flag to prevent further focus
    }
  }, [isFirstLoad, fieldRefs]);

  const handleFieldChange = async (e) => {
    const { name, value } = e.target;
    handleInputChange(e);

    // Disable the input field while awaiting PLC write
    // Only disable input fields other than 'quantity'
    if (name !== "quantity") {
      e.target.disabled = true; // Disable the input field
    }

    // Only proceed with PLC writing if it's a valid selection for fields with options
    const fieldHasOptions = Boolean(options[name + "s"]);
    if (
      !fieldHasOptions ||
      (fieldHasOptions && isValidSelection(value, options[name + "s"]))
    ) {
      const success = await writeToPLC(name, value);
      if (success) {
        focusNextField(name);
      }
    }

    // Re-enable the input field after the PLC write
    e.target.disabled = false; // Re-enable the input field
  };

  const handlePullClick = () => {
    setShowPullModal(true);
    startMonitoring(async (quantity) => {
      setFormData((prev) => ({
        ...prev,
        quantity: quantity.toString(),
      }));
      const success = await submitCheckout(new Event("submit"));
      if (success) {
        await resetStepInPLC();
        setShowPullModal(false);
        resetForm();
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitCheckout(e);
    if (success) {
      await resetStepInPLC();
    }
  };

  const handleManualEntry = async () => {
    try {
      await stopMonitoring(); // Stop the monitoring process
      console.log("Manual entry initiated, monitoring stopped.");
    } catch (err) {
      console.error("Error while stopping monitoring:", err);
    }

    setShowPullModal(false);
    await handleSubmit(new Event("submit"));
    resetForm();
  };

  const fields = [
    {
      label: "Name",
      name: "name",
      placeholder: "Type or select name...",
      options: options.users,
      ref: fieldRefs.name,
    },
    {
      label: "Project",
      name: "project",
      placeholder: "Type or select project...",
      options: options.projects,
      ref: fieldRefs.project,
    },
    {
      label: "Item",
      name: "item",
      placeholder: "Type or select item...",
      options: options.items,
      ref: fieldRefs.item,
    },
    {
      label: "Quantity",
      name: "quantity",
      placeholder: "Enter quantity...",
      pattern: "^\\d*\\.?\\d*$",
      type: "number",
      ref: fieldRefs.quantity,
      //hidden: true,
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

          <form className="checkout-form">
            <div className="checkout-fields-horizontal">
              {fields.map((field) => (
                <CheckoutField
                  key={field.name}
                  {...field}
                  value={formData[field.name]}
                  onChange={handleFieldChange}
                  showField={shouldShowField(field.name)}
                />
              ))}
            </div>

            <div className="checkout-submit">
              {shouldShowField("item") && formData.item && (
                <button
                  type="button"
                  className="pull-button"
                  onClick={handlePullClick}
                  disabled={isMonitoring}
                >
                  Pull
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <Modal
        isOpen={showPullModal}
        onClose={() => setShowPullModal(false)}
        title="Pull Options"
      >
        <div className="flex items-center justify-between p-4">
          <span>Use HMI for automatic pull or:</span>
          <button
            onClick={handleManualEntry}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Manual Entry
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Checkout;
