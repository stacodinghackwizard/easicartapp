// Checkout Page JavaScript
class CheckoutPage {
  constructor() {
    this.currentUser = null;
    this.checkoutData = null;
    this.formData = {};
    this.isProcessing = false;

    this.init();
  }

  init() {
    this.checkAuth();
    this.loadCheckoutData();
    this.setupEventListeners();
    this.updateUserInterface();
    this.populateFormWithUserData();
    this.setupPaymentMethodHandling();
    this.setupBillingAddressHandling();
    this.setupFormValidation();
  }

  checkAuth() {
    // Use the utility function
    this.currentUser = AuthUtils.requireAuth();
  }

  loadCheckoutData() {
    const checkoutDataStr = localStorage.getItem("checkoutData");
    if (!checkoutDataStr) {
      // Redirect to cart if no checkout data
      window.location.href = "./cart.html";
      return;
    }

    try {
      this.checkoutData = JSON.parse(checkoutDataStr);
      this.renderOrderSummary();
    } catch (error) {
      console.error("Error loading checkout data:", error);
      window.location.href = "./cart.html";
    }
  }

  setupEventListeners() {
    // Place order button
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener("click", (e) => this.handlePlaceOrder(e));
    }

    // Form inputs for real-time validation
    const formInputs = document.querySelectorAll(
      "#checkoutForm input, #checkoutForm select, #checkoutForm textarea"
    );
    formInputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearFieldError(input));
    });

    // Card number formatting
    const cardNumber = document.getElementById("cardNumber");
    if (cardNumber) {
      cardNumber.addEventListener("input", (e) =>
        this.formatCardNumber(e.target)
      );
    }

    // Expiry date formatting
    const expiryDate = document.getElementById("expiryDate");
    if (expiryDate) {
      expiryDate.addEventListener("input", (e) =>
        this.formatExpiryDate(e.target)
      );
    }

    // CVV validation
    const cvv = document.getElementById("cvv");
    if (cvv) {
      cvv.addEventListener("input", (e) => this.validateCVV(e.target));
    }
  }

  setupPaymentMethodHandling() {
    const paymentMethods = document.querySelectorAll(
      'input[name="paymentMethod"]'
    );
    paymentMethods.forEach((method) => {
      method.addEventListener("change", (e) =>
        this.togglePaymentFields(e.target.value)
      );
    });
  }

  setupBillingAddressHandling() {
    const sameAsShipping = document.getElementById("sameAsShipping");
    if (sameAsShipping) {
      sameAsShipping.addEventListener("change", (e) =>
        this.toggleBillingFields(e.target.checked)
      );
    }
  }

  setupFormValidation() {
    const form = document.getElementById("checkoutForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handlePlaceOrder(e);
      });
    }
  }

  togglePaymentFields(paymentMethod) {
    // Hide all payment fields
    document.getElementById("creditCardFields").style.display = "none";
    document.getElementById("paypalFields").style.display = "none";
    document.getElementById("bankTransferFields").style.display = "none";

    // Show selected payment method fields
    switch (paymentMethod) {
      case "creditCard":
        document.getElementById("creditCardFields").style.display = "block";
        break;
      case "paypal":
        document.getElementById("paypalFields").style.display = "block";
        break;
      case "bankTransfer":
        document.getElementById("bankTransferFields").style.display = "block";
        break;
    }
  }

  toggleBillingFields(sameAsShipping) {
    const billingFields = document.getElementById("billingFields");
    if (sameAsShipping) {
      billingFields.style.display = "none";
      this.copyShippingToBilling();
    } else {
      billingFields.style.display = "block";
    }
  }

  copyShippingToBilling() {
    const shippingFields = [
      "FirstName",
      "LastName",
      "Address",
      "City",
      "State",
      "Zip",
      "Country",
    ];
    shippingFields.forEach((field) => {
      const shippingValue = document.getElementById(`shipping${field}`).value;
      const billingField = document.getElementById(`billing${field}`);
      if (billingField) {
        billingField.value = shippingValue;
      }
    });
  }

  formatCardNumber(input) {
    let value = input.value.replace(/\D/g, "");
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    input.value = value;
  }

  formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    input.value = value;
  }

  validateCVV(input) {
    let value = input.value.replace(/\D/g, "");
    input.value = value;
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.id;
    let isValid = true;
    let errorMessage = "";

    // Remove existing error state
    this.clearFieldError(field);

    // Required field validation
    if (field.hasAttribute("required") && !value) {
      isValid = false;
      errorMessage = "This field is required";
    }

    // Email validation
    if (fieldName === "shippingEmail" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = "Please enter a valid email address";
      }
    }

    // Phone validation
    if (fieldName === "shippingPhone" && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ""))) {
        isValid = false;
        errorMessage = "Please enter a valid phone number";
      }
    }

    // Card number validation
    if (fieldName === "cardNumber" && value) {
      const cardNumber = value.replace(/\s/g, "");
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        isValid = false;
        errorMessage = "Please enter a valid card number";
      }
    }

    // Expiry date validation
    if (fieldName === "expiryDate" && value) {
      const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expiryRegex.test(value)) {
        isValid = false;
        errorMessage = "Please enter a valid expiry date (MM/YY)";
      } else {
        const [month, year] = value.split("/");
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        if (
          parseInt(year) < currentYear ||
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)
        ) {
          isValid = false;
          errorMessage = "Card has expired";
        }
      }
    }

    // CVV validation
    if (fieldName === "cvv" && value) {
      if (value.length < 3 || value.length > 4) {
        isValid = false;
        errorMessage = "Please enter a valid CVV";
      }
    }

    // ZIP code validation
    if (fieldName === "shippingZip" && value) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(value)) {
        isValid = false;
        errorMessage = "Please enter a valid ZIP code";
      }
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add("error");

    // Create error message element
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;

    // Insert after the field
    field.parentNode.appendChild(errorElement);
  }

  clearFieldError(field) {
    field.classList.remove("error");

    // Remove error message
    const errorMessage = field.parentNode.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  validateForm() {
    const requiredFields = document.querySelectorAll(
      "#checkoutForm [required]"
    );
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    // Additional validation for payment method
    const selectedPaymentMethod = document.querySelector(
      'input[name="paymentMethod"]:checked'
    ).value;

    if (selectedPaymentMethod === "creditCard") {
      const cardFields = ["cardNumber", "expiryDate", "cvv", "cardholderName"];
      cardFields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field && !this.validateField(field)) {
          isValid = false;
        }
      });
    }

    return isValid;
  }

  renderOrderSummary() {
    const orderItems = document.getElementById("orderItems");
    const summarySubtotal = document.getElementById("summarySubtotal");
    const summaryShipping = document.getElementById("summaryShipping");
    const summaryTax = document.getElementById("summaryTax");
    const summaryTotal = document.getElementById("summaryTotal");

    if (!orderItems || !this.checkoutData) return;

    // Render order items
    const itemsHTML = this.checkoutData.cart
      .map(
        (item) => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="order-item-details">
                    <h5 class="order-item-title">${item.name}</h5>
                    <p class="order-item-price">$${Number(item.price).toFixed(
                      2
                    )}</p>
                </div>
                <div class="order-item-quantity">${item.quantity}</div>
            </div>
        `
      )
      .join("");

    orderItems.innerHTML = itemsHTML;

    // Update summary amounts
    if (summarySubtotal)
      summarySubtotal.textContent = `$${this.checkoutData.sub_total.toFixed(
        2
      )}`;
    if (summaryShipping)
      summaryShipping.textContent = `$${this.checkoutData.shipping.toFixed(2)}`;
    if (summaryTax)
      summaryTax.textContent = `$${this.checkoutData.tax.toFixed(2)}`;
    if (summaryTotal)
      summaryTotal.textContent = `$${this.checkoutData.total.toFixed(2)}`;
  }

  populateFormWithUserData() {
    if (!this.currentUser) return;

    // Populate shipping email with user's email
    const shippingEmail = document.getElementById("shippingEmail");
    if (shippingEmail) {
      shippingEmail.value = this.currentUser.email;
    }

    // Populate shipping phone with user's phone
    const shippingPhone = document.getElementById("shippingPhone");
    if (shippingPhone && this.currentUser.phone) {
      shippingPhone.value = this.currentUser.phone;
    }

    // Populate names with user's name
    const [firstName, ...lastNameParts] = this.currentUser.full_name.split(" ");
    const lastName = lastNameParts.join(" ");

    const shippingFirstName = document.getElementById("shippingFirstName");
    if (shippingFirstName) {
      shippingFirstName.value = firstName;
    }

    const shippingLastName = document.getElementById("shippingLastName");
    if (shippingLastName) {
      shippingLastName.value = lastName;
    }
  }

  collectFormData() {
    this.formData = {
      shipping: {
        firstName: document.getElementById("shippingFirstName").value,
        lastName: document.getElementById("shippingLastName").value,
        email: document.getElementById("shippingEmail").value,
        phone: document.getElementById("shippingPhone").value,
        address: document.getElementById("shippingAddress").value,
        city: document.getElementById("shippingCity").value,
        state: document.getElementById("shippingState").value,
        zip: document.getElementById("shippingZip").value,
        country: document.getElementById("shippingCountry").value,
      },
      billing: {
        sameAsShipping: document.getElementById("sameAsShipping").checked,
        firstName: document.getElementById("billingFirstName").value,
        lastName: document.getElementById("billingLastName").value,
        address: document.getElementById("billingAddress").value,
        city: document.getElementById("billingCity").value,
        state: document.getElementById("billingState").value,
        zip: document.getElementById("billingZip").value,
        country: document.getElementById("billingCountry").value,
      },
      payment: {
        method: document.querySelector('input[name="paymentMethod"]:checked')
          .value,
        cardNumber: document.getElementById("cardNumber").value,
        expiryDate: document.getElementById("expiryDate").value,
        cvv: document.getElementById("cvv").value,
        cardholderName: document.getElementById("cardholderName").value,
      },
      notes: document.getElementById("orderNotes").value,
    };

    // If billing same as shipping, copy shipping data
    if (this.formData.billing.sameAsShipping) {
      this.formData.billing = {
        ...this.formData.shipping,
        sameAsShipping: true,
      };
    }
  }

  async handlePlaceOrder(e) {
    e.preventDefault();

    if (this.isProcessing) return;
    if (!this.validateForm()) {
      this.showNotification("Please fix the errors in the form", "error");
      return;
    }
    // this.collectFormData(); -- I am only implementing a simple bank transfer setup.

    this.setProcessingState(true);
    try {
      const { cart, ...rest } = this.checkoutData;
      const res = await fetch("http://localhost:8000/index.php?action=orders", {
        method: "POST",
        body: JSON.stringify(rest),
      });
      const data = await res.json();
      if (data.status === "error") {
        this.showNotification("Error proceeding to checkout", "error");
        return;
      }

      if (!data.url) {
        this.showNotification("Oops!, an error occurred!", "error");
        return;
      }

      localStorage.removeItem("checkoutData");
      window.location.href = data.url;
    } catch (error) {
      console.error("Order placement failed:", error);
      this.showNotification(
        "Order placement failed. Please try again.",
        "error"
      );
    } finally {
      this.setProcessingState(false);
    }
  }

  calculateEstimatedDelivery() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 business days
    return deliveryDate.toISOString();
  }

  setProcessingState(processing) {
    this.isProcessing = processing;
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    if (placeOrderBtn) {
      if (processing) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML =
          '<i class="bx bx-loader-alt bx-spin"></i> Processing...';
      } else {
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML =
          '<i class="bx bx-lock"></i> Place Order Securely';
      }
    }
  }

  updateUserInterface() {
    // Use the utility function
    AuthUtils.updateUserInterface(this.currentUser);
  }

  updateCartCount() {
    const cartKey = `cart_${this.currentUser.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  logout() {
    // Use the utility function
    AuthUtils.logout();
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `alert alert-${
      type === "error" ? "danger" : type
    } alert-dismissible fade show`;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;

    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// Initialize checkout page when DOM is loaded
let checkoutPage;
document.addEventListener("DOMContentLoaded", () => {
  checkoutPage = new CheckoutPage();
});

// Make it globally accessible
window.checkoutPage = checkoutPage;
