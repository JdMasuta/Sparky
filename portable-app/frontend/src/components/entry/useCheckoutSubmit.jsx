// ../components/entry/useCheckoutSubmit.jsx
export const useCheckoutSubmit = (formData, idMappings, setFormData) => {
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = idMappings.users.get(formData.name);
      const projectId = idMappings.projects.get(formData.project);
      const itemId = idMappings.items.get(formData.item);

      const now = new Date();
      const options = {
        timeZone: "America/Denver",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timestamp = now
        .toLocaleString("sv-SE", options)
        .replace(" ", "T")
        .replace("T", " ")
        .replace(/-/g, "-")
        .replace(/:/g, ":");

      const checkoutData = {
        user_id: userId,
        project_id: projectId,
        item_id: itemId,
        quantity: parseFloat(formData.quantity),
        timestamp: timestamp,
      };

      console.log("Submitting checkout:", JSON.stringify(checkoutData));
      const response = await fetch("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit checkout");
      }

      return true; // Return true on successful submission
    } catch (error) {
      console.error("Error submitting checkout:", error);
      alert("Failed to submit checkout. Please try again.");
      return false;
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      project: "",
      item: "",
      quantity: "",
    });
    alert("Checkout successful!");
  };

  return { handleSubmit, resetForm };
};
