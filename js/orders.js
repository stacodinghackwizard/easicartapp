// Orders Page Functionality
class OrdersPage {
  constructor() {
    this.currentUser = null;
    this.orders = [];
    this.filteredOrders = [];
    this.init();
  }

  init() {
    this.checkAuth();
    this.loadOrders();
    this.setupEventListeners();
    this.updateUserInterface();
  }

  checkAuth() {
    // Use the utility function
    this.currentUser = AuthUtils.requireAuth();
  }

  loadOrders() {
    // Load orders from localStorage
    const ordersKey = `orders_${this.currentUser.id}`;
    this.orders = JSON.parse(localStorage.getItem(ordersKey) || "[]");

    // If no orders exist, create some demo orders
    if (this.orders.length === 0) {
      this.createDemoOrders();
    }

    this.filteredOrders = [...this.orders];
    this.renderOrders();
  }

  createDemoOrders() {
    // Create sample orders for demonstration
    const demoOrders = [
      {
        id: "ORD-001",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        status: "delivered",
        items: [
          {
            id: 1,
            title: "Sample Product 1",
            price: 29.99,
            currentPrice: 29.99,
            image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
            quantity: 2,
          },
          {
            id: 2,
            title: "Sample Product 2",
            price: 49.99,
            currentPrice: 44.99,
            image:
              "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
            quantity: 1,
          },
        ],
        subtotal: 104.97,
        shippingCost: 5.99,
        tax: 8.4,
        total: 119.36,
        payment: { method: "creditCard" },
        shipping: {
          firstName: "John",
          lastName: "Doe",
          address: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "US",
        },
        estimatedDelivery: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "ORD-002",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        status: "shipped",
        items: [
          {
            id: 3,
            title: "Sample Product 3",
            price: 79.99,
            currentPrice: 79.99,
            image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
            quantity: 1,
          },
        ],
        subtotal: 79.99,
        shippingCost: 0.0,
        tax: 6.4,
        total: 86.39,
        payment: { method: "paypal" },
        shipping: {
          firstName: "John",
          lastName: "Doe",
          address: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "US",
        },
        estimatedDelivery: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    this.orders = demoOrders;
    this.saveOrders();
  }

  setupEventListeners() {
    // Search functionality
    const orderSearch = document.getElementById("orderSearch");
    if (orderSearch) {
      orderSearch.addEventListener("input", (e) =>
        this.handleSearch(e.target.value)
      );
    }

    // Status filter
    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) =>
        this.handleStatusFilter(e.target.value)
      );
    }
  }

  handleSearch(query) {
    if (!query.trim()) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(
        (order) =>
          order.id.toLowerCase().includes(query.toLowerCase()) ||
          order.items.some((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          )
      );
    }
    this.renderOrders();
  }

  handleStatusFilter(status) {
    if (!status) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(
        (order) => order.status === status
      );
    }
    this.renderOrders();
  }

  renderOrders() {
    const ordersList = document.getElementById("ordersList");
    const emptyOrders = document.getElementById("emptyOrders");
    const loadingOrders = document.getElementById("loadingOrders");

    if (!ordersList || !emptyOrders || !loadingOrders) return;

    // Hide loading state
    loadingOrders.classList.add("d-none");

    if (this.filteredOrders.length === 0) {
      ordersList.innerHTML = "";
      emptyOrders.classList.remove("d-none");
      return;
    }

    emptyOrders.classList.add("d-none");

    const ordersHTML = this.filteredOrders
      .map((order) => this.createOrderCardHTML(order))
      .join("");
    ordersList.innerHTML = ordersHTML;

    // Setup event listeners for order actions
    this.setupOrderActionListeners();
  }

  createOrderCardHTML(order) {
    const orderItemsHTML = order.items
      .map(
        (item) => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="order-item-details">
                    <h4 class="order-item-title">${item.title}</h4>
                    <p class="order-item-price">$${(
                      item.currentPrice || item.price
                    ).toFixed(2)}</p>
                </div>
                <div class="order-item-quantity">
                    ${item.quantity}
                </div>
            </div>
        `
      )
      .join("");

    const orderSummaryHTML = `
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${order.sub_total.toFixed(2)}</span>
            </div>
                                    <div class="summary-row">
                            <span>Shipping:</span>
                            <span>$${order.shippingCost.toFixed(2)}</span>
                        </div>
            <div class="summary-row">
                <span>Tax:</span>
                <span>$${order.tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span>$${order.total.toFixed(2)}</span>
            </div>
        `;

    const orderActionsHTML = this.getOrderActionsHTML(order);

    return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-number">Order #${order.id}</div>
                        <div class="order-date">${this.formatDate(
                          order.createdAt
                        )}</div>
                    </div>
                    <div class="order-status ${order.status}">${
      order.status
    }</div>
                </div>
                
                <div class="order-items">
                    ${orderItemsHTML}
                </div>
                
                <div class="order-summary">
                    ${orderSummaryHTML}
                </div>
                
                <div class="order-actions">
                    ${orderActionsHTML}
                </div>
            </div>
        `;
  }

  getOrderActionsHTML(order) {
    let actions = "";

    // View Details button (always available)
    actions += `<button class="btn btn-outline-primary" onclick="ordersPage.viewOrderDetails('${order.id}')">
            <i class="bx bx-show"></i> View Details
        </button>`;

    // Track Order button (for shipped/delivered orders)
    if (["shipped", "delivered"].includes(order.status)) {
      actions += `<button class="btn btn-outline-info" onclick="ordersPage.trackOrder('${order.id}')">
                <i class="bx bx-map"></i> Track Order
            </button>`;
    }

    // Cancel Order button (for pending/confirmed orders)
    if (["pending", "confirmed"].includes(order.status)) {
      actions += `<button class="btn btn-outline-danger" onclick="ordersPage.cancelOrder('${order.id}')">
                <i class="bx bx-x"></i> Cancel Order
            </button>`;
    }

    // Return Order button (for delivered orders)
    if (order.status === "delivered") {
      actions += `<button class="btn btn-outline-warning" onclick="ordersPage.returnOrder('${order.id}')">
                <i class="bx bx-undo"></i> Return Order
            </button>`;
    }

    // Download Receipt button (always available)
    actions += `<button class="btn btn-outline-secondary" onclick="ordersPage.downloadReceipt('${order.id}')">
            <i class="bx bx-download"></i> Receipt
        </button>`;

    return actions;
  }

  setupOrderActionListeners() {
    // Add any additional event listeners for order actions if needed
    const orderCards = document.querySelectorAll(".order-card");
    orderCards.forEach((card) => {
      // Add hover effects or other interactions
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-2px)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
      });
    });
  }

  viewOrderDetails(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    // Create and show order details modal
    const modalHTML = `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Order Details - #${
                              order.id
                            }</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Order Information</h6>
                                    <p><strong>Order ID:</strong> ${
                                      order.id
                                    }</p>
                                    <p><strong>Date:</strong> ${this.formatDate(
                                      order.createdAt
                                    )}</p>
                                    <p><strong>Status:</strong> <span class="order-status ${
                                      order.status
                                    }">${order.status}</span></p>
                                    <p><strong>Payment Method:</strong> ${this.formatPaymentMethod(
                                      order.payment.method
                                    )}</p>
                                    <p><strong>Estimated Delivery:</strong> ${this.formatDate(
                                      order.estimatedDelivery
                                    )}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Shipping Address</h6>
                                    <p>${order.shipping.firstName} ${
      order.shipping.lastName
    }</p>
                                    <p>${order.shipping.address}</p>
                                    <p>${order.shipping.city}, ${
      order.shipping.state
    } ${order.shipping.zip}</p>
                                    <p>${order.shipping.country}</p>
                                </div>
                            </div>
                            <hr>
                            <h6>Order Items</h6>
                            <div class="order-items">
                                ${order.items
                                  .map(
                                    (item) => `
                                    <div class="order-item">
                                        <div class="order-item-image">
                                            <img src="${item.image}" alt="${
                                      item.title
                                    }" style="width: 50px; height: 50px;">
                                        </div>
                                        <div class="order-item-details">
                                            <h6 class="order-item-title">${
                                              item.title
                                            }</h6>
                                            <p class="order-item-price">$${(
                                              item.currentPrice || item.price
                                            ).toFixed(2)}</p>
                                        </div>
                                        <div class="order-item-quantity">
                                            ${item.quantity}
                                        </div>
                                    </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Remove existing modal if any
    const existingModal = document.getElementById("orderDetailsModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(
      document.getElementById("orderDetailsModal")
    );
    modal.show();
  }

  trackOrder(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    // Show tracking information
    this.showNotification(
      `Tracking information for order #${order.id} would be displayed here.`,
      "info"
    );
  }

  cancelOrder(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    if (confirm(`Are you sure you want to cancel order #${order.id}?`)) {
      // Update order status
      order.status = "cancelled";
      this.saveOrders();
      this.renderOrders();

      this.showNotification(
        `Order #${order.id} has been cancelled.`,
        "success"
      );
    }
  }

  returnOrder(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    // Show return form or redirect to return page
    this.showNotification(
      `Return form for order #${order.id} would be displayed here.`,
      "info"
    );
  }

  downloadReceipt(orderId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    // Generate and download receipt
    const receiptContent = this.generateReceiptContent(order);
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.showNotification(
      `Receipt for order #${order.id} downloaded.`,
      "success"
    );
  }

  generateReceiptContent(order) {
    const items = order.items;

    let receipt = `EASICART - ORDER RECEIPT
===========================================

Order ID: ${order.id}
Date: ${this.formatDate(order.createdAt)}
Status: ${order.status}
Payment Method: ${this.formatPaymentMethod(order.payment.method)}

ITEMS:
${items
  .map(
    (item) =>
      `${item.title} x${item.quantity} - $${(
        item.currentPrice || item.price
      ).toFixed(2)}`
  )
  .join("\n")}

===========================================
Subtotal: $${order.sub_total.toFixed(2)}
Shipping: $${order.shipping.toFixed(2)}
Tax: $${order.tax.toFixed(2)}
===========================================
TOTAL: $${order.total.toFixed(2)}

SHIPPING ADDRESS:
${order.shipping.firstName} ${order.shipping.lastName}
${order.shipping.address}
${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip}
${order.shipping.country}

Estimated Delivery: ${this.formatDate(order.estimatedDelivery)}

Thank you for shopping with EasiCart!
===========================================
Generated on: ${new Date().toLocaleString()}`;

    return receipt;
  }

  saveOrders() {
    const ordersKey = `orders_${this.currentUser.id}`;
    localStorage.setItem(ordersKey, JSON.stringify(this.orders));
  }

  updateUserInterface() {
    // Use the utility function
    AuthUtils.updateUserInterface(this.currentUser);
  }

  updateUserDropdown() {
    const userDropdown = document.getElementById("userDropdown");
    if (!userDropdown) return;

    if (this.currentUser) {
      userDropdown.innerHTML = `
                <li><a class="dropdown-item" href="./auth/change_password.html"><i class="bx bx-lock"></i> Change Password</a></li>
                <li><a class="dropdown-item" href="./orders.html"><i class="bx bx-package"></i> My Orders</a></li>
                <li><a class="dropdown-item" href="./wishlist.html"><i class="bx bx-heart"></i> Wishlist</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item" onclick="ordersPage.logout()" style="border: none; background: none; width: 100%; text-align: left; padding: 0.5rem 1rem;"><i class="bx bx-log-out"></i> Logout</button></li>
            `;
    } else {
      userDropdown.innerHTML = `
                <li><a class="dropdown-item" href="./auth/login.html"><i class="bx bx-log-in"></i> Sign In</a></li>
                <li><a class="dropdown-item" href="./auth/register.html"><i class="bx bx-user-plus"></i> Register</a></li>
            `;
    }
  }

  updateSidebarLinks() {
    const sidebarAccountLink = document.getElementById("sidebarAccountLink");
    const sidebarOrdersLink = document.getElementById("sidebarOrdersLink");
    const sidebarReviewsLink = document.getElementById("sidebarReviewsLink");
    const sidebarWishlistLink = document.getElementById("sidebarWishlistLink");
    const mobileUserBtn = document.getElementById("mobileUserBtn");

    if (this.currentUser) {
      if (sidebarAccountLink)
        sidebarAccountLink.href = "./auth/change_password.html";
      if (sidebarOrdersLink) sidebarOrdersLink.href = "./orders.html";
      if (sidebarReviewsLink) sidebarReviewsLink.href = "#";
      if (sidebarWishlistLink) sidebarWishlistLink.href = "./wishlist.html";
      if (mobileUserBtn) mobileUserBtn.href = "./auth/change_password.html";
    } else {
      if (sidebarAccountLink) sidebarAccountLink.href = "./auth/login.html";
      if (sidebarOrdersLink) sidebarOrdersLink.href = "./auth/login.html";
      if (sidebarReviewsLink) sidebarReviewsLink.href = "./auth/login.html";
      if (sidebarWishlistLink) sidebarWishlistLink.href = "./auth/login.html";
      if (mobileUserBtn) mobileUserBtn.href = "./auth/login.html";
    }
  }

  logout() {
    // Use the utility function
    AuthUtils.logout();
  }

  updateCartCount() {
    const cartKey = `cart_${this.currentUser.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Update cart count in header
    const cartCountElement = document.getElementById("cartCount");
    const mobileCartCount = document.getElementById("mobileCartCount");

    if (cartCountElement) {
      if (cartCount > 0) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = "inline";
      } else {
        cartCountElement.style.display = "none";
      }
    }

    if (mobileCartCount) {
      if (cartCount > 0) {
        mobileCartCount.textContent = cartCount;
        mobileCartCount.style.display = "inline";
      } else {
        mobileCartCount.style.display = "none";
      }
    }
  }

  formatDate(dateString) {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatPaymentMethod(method) {
    const methods = {
      creditCard: "Credit/Debit Card",
      paypal: "PayPal",
      bankTransfer: "Bank Transfer",
    };
    return methods[method] || method;
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style the notification
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "1rem 1.5rem",
      borderRadius: "10px",
      color: "white",
      fontWeight: "500",
      zIndex: "9999",
      transform: "translateX(100%)",
      transition: "transform 0.3s ease",
      maxWidth: "300px",
    });

    // Set background color based on type
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      info: "#17a2b8",
      warning: "#ffc107",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize orders page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.ordersPage = new OrdersPage();
});
