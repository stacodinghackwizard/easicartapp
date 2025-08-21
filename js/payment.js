// Payment Page JavaScript
class PaymentPage {
  constructor() {
    this.currentUser = null;
    this.currentOrder = null;

    this.init();
  }

  init() {
    this.checkAuth();
    this.loadOrderData();
    this.setupEventListeners();
    this.updateUserInterface();
    this.renderOrderDetails();
    this.renderShippingInfo();
  }

  checkAuth() {
    // Use the utility function
    this.currentUser = AuthUtils.requireAuth();
  }

  loadOrderData() {
    const orderDataStr = localStorage.getItem("currentOrder");
    if (!orderDataStr) {
      // Redirect to home if no order data
      window.location.href = "./index.html";
      return;
    }

    try {
      this.currentOrder = JSON.parse(orderDataStr);
    } catch (error) {
      console.error("Error loading order data:", error);
      window.location.href = "./index.html";
    }
  }

  setupEventListeners() {
    // View orders button
    const viewOrdersBtn = document.getElementById("viewOrdersBtn");
    if (viewOrdersBtn) {
      viewOrdersBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.viewOrders();
      });
    }

    // Download receipt button
    const downloadReceiptBtn = document.getElementById("downloadReceiptBtn");
    if (downloadReceiptBtn) {
      downloadReceiptBtn.addEventListener("click", () =>
        this.downloadReceipt()
      );
    }
  }

  renderOrderDetails() {
    if (!this.currentOrder) return;

    // Update order info
    const orderId = document.getElementById("orderId");
    const orderDate = document.getElementById("orderDate");
    const paymentMethod = document.getElementById("paymentMethod");
    const estimatedDelivery = document.getElementById("estimatedDelivery");

    if (orderId) orderId.textContent = this.currentOrder.id;
    if (orderDate)
      orderDate.textContent = this.formatDate(this.currentOrder.createdAt);
    if (paymentMethod)
      paymentMethod.textContent = this.formatPaymentMethod(
        this.currentOrder.payment.method
      );
    if (estimatedDelivery)
      estimatedDelivery.textContent = this.formatDate(
        this.currentOrder.estimatedDelivery
      );

    // Render order items
    this.renderOrderItems();

    // Update summary amounts
    this.updateOrderSummary();
  }

  renderOrderItems() {
    const orderItemsList = document.getElementById("orderItemsList");
    if (!orderItemsList || !this.currentOrder.items) return;

    const itemsHTML = this.currentOrder.items
      .map(
        (item) => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="order-item-details">
                    <h5 class="order-item-title">${item.title}</h5>
                    <p class="order-item-price">$${(
                      item.currentPrice || item.price
                    ).toFixed(2)}</p>
                </div>
                <div class="order-item-quantity">${item.quantity}</div>
            </div>
        `
      )
      .join("");

    orderItemsList.innerHTML = itemsHTML;
  }

  updateOrderSummary() {
    if (!this.currentOrder) return;

    const summarySubtotal = document.getElementById("summarySubtotal");
    const summaryShipping = document.getElementById("summaryShipping");
    const summaryTax = document.getElementById("summaryTax");
    const summaryTotal = document.getElementById("summaryTotal");

    if (summarySubtotal)
      summarySubtotal.textContent = `$${this.currentOrder.sub_total.toFixed(
        2
      )}`;
    if (summaryShipping)
      summaryShipping.textContent = `$${this.currentOrder.shipping.toFixed(2)}`;
    if (summaryTax)
      summaryTax.textContent = `$${this.currentOrder.tax.toFixed(2)}`;
    if (summaryTotal)
      summaryTotal.textContent = `$${this.currentOrder.total.toFixed(2)}`;
  }

  renderShippingInfo() {
    const shippingDetails = document.getElementById("shippingDetails");
    if (!shippingDetails || !this.currentOrder.shipping) return;

    const shipping = this.currentOrder.shipping;

    const shippingHTML = `
            <div class="shipping-field">
                <span class="label">Full Name</span>
                <span class="value">${shipping.firstName} ${
      shipping.lastName
    }</span>
            </div>
            <div class="shipping-field">
                <span class="label">Email</span>
                <span class="value">${shipping.email}</span>
            </div>
            <div class="shipping-field">
                <span class="label">Phone</span>
                <span class="value">${shipping.phone}</span>
            </div>
            <div class="shipping-field">
                <span class="label">Address</span>
                <span class="value">${shipping.address}</span>
            </div>
            <div class="shipping-field">
                <span class="label">City</span>
                <span class="value">${shipping.city}</span>
            </div>
            <div class="shipping-field">
                <span class="label">State</span>
                <span class="value">${shipping.state}</span>
            </div>
            <div class="shipping-field">
                <span class="label">ZIP Code</span>
                <span class="value">${shipping.zip}</span>
            </div>
            <div class="shipping-field">
                <span class="label">Country</span>
                <span class="value">${this.formatCountry(
                  shipping.country
                )}</span>
            </div>
        `;

    shippingDetails.innerHTML = shippingHTML;
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

  viewOrders() {
    // For now, just show a notification
    this.showNotification("Orders page coming soon!", "info");

    // In a real application, this would redirect to an orders page
    // window.location.href = './orders.html';
  }

  downloadReceipt() {
    if (!this.currentOrder) return;

    try {
      // Create receipt content
      const receiptContent = this.generateReceiptContent();

      // Create blob and download
      const blob = new Blob([receiptContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${this.currentOrder.id}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      this.showNotification("Receipt downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading receipt:", error);
      this.showNotification("Failed to download receipt", "error");
    }
  }

  generateReceiptContent() {
    if (!this.currentOrder) return "";

    const shipping = this.currentOrder.shipping;
    const items = this.currentOrder.items;

    let receipt = `EASICART - ORDER RECEIPT
===========================================

Order ID: ${this.currentOrder.id}
Order Date: ${this.formatDate(this.currentOrder.createdAt)}
Payment Method: ${this.formatPaymentMethod(this.currentOrder.payment.method)}
Status: Confirmed

SHIPPING INFORMATION:
${shipping.firstName} ${shipping.lastName}
${shipping.address}
${shipping.city}, ${shipping.state} ${shipping.zip}
${this.formatCountry(shipping.country)}
Email: ${shipping.email}
Phone: ${shipping.phone}

ORDER ITEMS:
${items
  .map(
    (item) =>
      `${item.title} x${item.quantity} - $${(
        item.currentPrice || item.price
      ).toFixed(2)}`
  )
  .join("\n")}

ORDER SUMMARY:
Subtotal: $${this.currentOrder.sub_total.toFixed(2)}
Shipping: $${this.currentOrder.shipping.toFixed(2)}
Tax: $${this.currentOrder.tax.toFixed(2)}
TOTAL: $${this.currentOrder.total.toFixed(2)}

Estimated Delivery: ${this.formatDate(this.currentOrder.estimatedDelivery)}

Thank you for shopping with EasiCart!
===========================================
Generated on: ${new Date().toLocaleString()}
        `;

    return receipt;
  }

  formatDate(dateString) {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  }

  formatPaymentMethod(method) {
    const methods = {
      creditCard: "Credit/Debit Card",
      paypal: "PayPal",
      bankTransfer: "Bank Transfer",
    };

    return methods[method] || method;
  }

  formatCountry(countryCode) {
    const countries = {
      US: "United States",
      CA: "Canada",
      UK: "United Kingdom",
      NG: "Nigeria",
      KE: "Kenya",
      UG: "Uganda",
      GH: "Ghana",
    };

    return countries[countryCode] || countryCode;
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

  // Add some interactive features
  addConfetti() {
    // Simple confetti effect for successful payment
    const colors = ["#667eea", "#28a745", "#007bff", "#ffc107", "#dc3545"];

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div");
        confetti.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}vw;
                    width: 10px;
                    height: 10px;
                    background: ${
                      colors[Math.floor(Math.random() * colors.length)]
                    };
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    animation: confettiFall 3s linear forwards;
                `;

        document.body.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => {
          if (confetti.parentNode) {
            confetti.remove();
          }
        }, 3000);
      }, i * 100);
    }
  }

  // Initialize confetti animation
  initConfettiAnimation() {
    const style = document.createElement("style");
    style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
    document.head.appendChild(style);
  }
}

// Initialize payment page when DOM is loaded
let paymentPage;
document.addEventListener("DOMContentLoaded", () => {
  paymentPage = new PaymentPage();

  // Add confetti effect after a short delay
  setTimeout(() => {
    paymentPage.initConfettiAnimation();
    paymentPage.addConfetti();
  }, 1000);
});

// Make it globally accessible
window.paymentPage = paymentPage;
