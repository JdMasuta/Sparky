import React, { useState, useEffect } from "react";
import MainNavBar from "../components/shared/MainNavBar.jsx";
import { useCheckoutForm } from "../components/entry/useCheckoutForm";
import { useCheckoutData } from "../components/entry/useCheckoutData";
import { useCheckoutSubmit } from "../components/entry/useCheckoutSubmit";
import { useRSLinxMonitor } from "../components/entry/useRSLinxMonitor";
import { usePLCTags } from "../components/entry/usePLCTags";
import { useFieldAutomation } from "../components/entry/useFieldAutomation";
import CheckoutField from "../components/entry/CheckoutField";
import PullOptionsModal from "../components/entry/PullModal.jsx";

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
  const { startMonitoring, stopMonitoring, checkConnection, isMonitoring } =
    useRSLinxMonitor();
  const { writeToPLC, resetStepInPLC } = usePLCTags();
  const { fieldRefs, focusNextField } = useFieldAutomation();

  const [isFirstLoad, setIsFirstLoad] = useState(true); // Track first load
  const [DDEconnected, setDDEconnected] = useState(false); // Track DDE connection

  const optionKeyMap = {
    name: "users",
    project: "projects",
    item: "items",
    quantity: null, // No options for quantity
  };

  // Focus the first field only on initial page load
  useEffect(() => {
    const ensureDDEConnection = async () => {
      try {
        const data = await checkConnection(); // Await the checkConnection call
        console.log("Connection status:", {
          available: data.available,
          message: data.message,
        });
        setDDEconnected(data.available);
      } catch (error) {
        console.error("Error ensuring DDE connection:", error);
        setDDEconnected(false);
      }
    };

    const initializePage = async () => {
      if (isFirstLoad && fieldRefs.name) {
        await ensureDDEConnection(); // Await the ensureDDEConnection call

        fieldRefs.name.current.focus(); // Focus the first field (name)
        resetStepInPLC(); // Reset the step number in PLC

        await fetch("/api/RSLinx/batch/write", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tags: [
              "_200_GLB.StringData[0]",
              "_200_GLB.StringData[1]",
              "_200_GLB.StringData[2]",
            ],
            values: ["", "", ""],
          }),
        });

        setIsFirstLoad(false); // Set flag to prevent further focus
      }
    };

    initializePage(); // Call the async function
  }, [isFirstLoad, fieldRefs]);

  const handleFieldChange = async (e) => {
    const { name, value } = e.target;
    handleInputChange(e);

    // Retrieve the key for options based on the field name
    const optionsKey = optionKeyMap[name];

    // Check if the field has options
    const fieldHasOptions = Boolean(optionsKey && options[optionsKey]);

    let currentOptions = null;

    if (fieldHasOptions) {
      // Load the list of options dynamically
      currentOptions = options[optionsKey];

      // Validate the selection if the field has options
      if (isValidSelection(value, currentOptions)) {
        e.target.disabled = true; // Disable the input field while processing
      }
    }

    // Proceed with PLC writing for valid selections or fields without options
    if (
      name != "options" &&
      (!fieldHasOptions ||
        (fieldHasOptions && isValidSelection(value, currentOptions)))
    ) {
      const success = await writeToPLC(name, value);
      console.log(`PLC write success for ${name}: ${success}`);
      if (success) {
        focusNextField(name);
      }
    }

    // Re-enable the input field after the PLC write
    e.target.disabled = false;
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
      fieldRefs.name.current.focus(); // Focus the first field (name)
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
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handlePullClick();
      console.log("Enter");
    }
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && field.name == "quantity")
                      handlePullClick();
                  }}
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
      <div>
        <PullOptionsModal
          isOpen={showPullModal}
          onClose={() => {
            stopMonitoring();
            setShowPullModal(false);
          }}
          onManualEntry={handleManualEntry}
        />
        ;
      </div>
    </div>
  );
}

export default Checkout;
