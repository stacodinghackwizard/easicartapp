// Cart Page JavaScript
class CartPage {
  constructor() {
    this.cart = [];
    this.currentUser = null;
    this.coupons = {
      WELCOME10: { discount: 10, type: "percentage" },
      SAVE20: { discount: 20, type: "percentage" },
      FREESHIP: { discount: 0, type: "shipping" },
      FLAT5: { discount: 5, type: "fixed" },
    };
    this.applied_coupon = null;
    this.shippingCost = 5.99;
    this.taxRate = 0.08; // 8% tax rate

    this.init();
  }

  init() {
    this.checkAuth();
    this.loadCart();
    this.setupEventListeners();
    this.updateUserInterface();
    this.loadRecentlyViewed();
  }

  checkAuth() {
    // Use the utility function
    this.currentUser = AuthUtils.requireAuth();
  }

  async loadCart() {
    const res = await fetch(
      `http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=cart&user_id=${this.currentUser.id}`
    );
    const data = await res.json();
    this.cart = data.data;
    this.renderCart();
    this.updateSummary();
  }

  setupEventListeners() {
    // Clear cart button
    const clearCartBtn = document.getElementById("clearCartBtn");
    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", () => this.clearCart());
    }

    // Apply coupon button
    const applyCouponBtn = document.getElementById("applyCouponBtn");
    if (applyCouponBtn) {
      applyCouponBtn.addEventListener("click", () => this.applyCoupon());
    }

    // Checkout button
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => this.proceedToCheckout());
    }

    // Coupon input enter key
    const couponInput = document.getElementById("couponInput");
    if (couponInput) {
      couponInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.applyCoupon();
        }
      });
    }
  }

  renderCart() {
    const cartItems = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");
    const cartItemsCount = document.getElementById("cartItemsCount");

    if (!cartItems || !emptyCart || !cartItemsCount) return;

    if (this.cart.length === 0) {
      cartItems.style.display = "none";
      emptyCart.style.display = "block";
      cartItemsCount.textContent = "0";
      return;
    }

    cartItems.style.display = "block";
    emptyCart.style.display = "none";
    cartItemsCount.textContent = this.cart.length;

    const cartHTML = this.cart
      .map((item) => this.createCartItemHTML(item))
      .join("");
    cartItems.innerHTML = cartHTML;

    // Add event listeners to cart items
    this.setupCartItemListeners();
  }

  createCartItemHTML(item) {
    const price = Number(item.price);
    const discount = Number(item.discount) * 100;
    const currentPrice = price * (1 - Number(item.discount));

    const discountHTML =
      discount > 0
        ? `
            <span class="text-muted text-decoration-line-through me-2">$${currentPrice.toFixed(
              2
            )}</span>
            <span class="badge bg-danger">-${discount}%</span>
        `
        : "";

    return `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-category">${this.capitalizeFirst(
                      item.category
                    )}</p>
                    <p class="cart-item-price">
                        $${price.toFixed(2)}
                        ${discountHTML}
                    </p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-action="decrease" data-product-id="${
                          item.id
                        }" ${item.quantity <= 1 ? "disabled" : ""}>
                            <i class="bx bx-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" data-action="increase" data-product-id="${
                          item.id
                        }">
                            <i class="bx bx-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item-btn" data-product-id="${
                      item.id
                    }">
                        <i class="bx bx-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
  }

  setupCartItemListeners() {
    // Quantity buttons
    const quantityBtns = document.querySelectorAll(".quantity-btn");
    quantityBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.closest(".quantity-btn").dataset.action;
        const productId = e.target.closest(".quantity-btn").dataset.productId;
        this.updateQuantity(productId, action);
      });
    });

    // Remove buttons
    const removeBtns = document.querySelectorAll(".remove-item-btn");
    removeBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId =
          e.target.closest(".remove-item-btn").dataset.productId;
        this.removeItem(productId);
      });
    });
  }

  async updateQuantity(productId, action) {
    const item = this.cart.find((item) => item.id === parseInt(productId));
    if (!item) return;

    if (action === "increase") {
      item.quantity += 1;
    } else if (action === "decrease" && item.quantity > 1) {
      item.quantity -= 1;
    }

    await fetch(`http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=cart`, {
      method: "PUT",
      body: JSON.stringify({
        user_id: this.currentUser.id,
        product_id: productId,
        quantity: item.quantity,
      }),
    });

    this.renderCart();
    this.updateSummary();
    this.updateCartCount();
  }

  async removeItem(productId) {
    this.cart = this.cart.filter((item) => item.id !== parseInt(productId));
    await fetch(`http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=cart`, {
      method: "DELETE",
      body: JSON.stringify({
        product_id: productId,
        user_id: this.currentUser.id,
      }),
    });

    this.renderCart();
    this.updateSummary();
    this.updateCartCount();
  }

  async clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
      this.cart = [];
      this.applied_coupon = null;
      await fetch(`http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=cart`, {
        method: "DELETE",
        body: JSON.stringify({
          user_id: this.currentUser.id,
        }),
      });

      this.renderCart();
      this.updateSummary();
      this.updateCartCount();
      this.clearCouponMessage();
    }
  }

  updateSummary() {
    const subtotal = this.calculateSubtotal();
    const shipping = this.calculateShipping();
    const tax = this.calculateTax(subtotal);
    const total = subtotal + shipping + tax;

    // Update summary display
    const subtotalEl = document.getElementById("subtotal");
    const shippingEl = document.getElementById("shipping");
    const taxEl = document.getElementById("tax");
    const totalEl = document.getElementById("total");

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    // Enable/disable checkout button
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.disabled = this.cart.length === 0;
    }
  }

  calculateSubtotal() {
    return this.cart.reduce((sum, item) => {
      const price = item.currentPrice || item.price;
      return sum + price * item.quantity;
    }, 0);
  }

  calculateShipping() {
    if (this.applied_coupon && this.applied_coupon.type === "shipping") {
      return 0;
    }
    return this.cart.length > 0 ? this.shippingCost : 0;
  }

  calculateTax(subtotal) {
    return subtotal * this.taxRate;
  }

  applyCoupon() {
    const couponInput = document.getElementById("couponInput");
    const couponCode = couponInput.value.trim().toUpperCase();
    const couponMessage = document.getElementById("couponMessage");

    if (!couponCode) {
      this.showCouponMessage("Please enter a coupon code", "error");
      return;
    }

    if (this.coupons[couponCode]) {
      this.applied_coupon = {
        code: couponCode,
        ...this.coupons[couponCode],
      };
      this.showCouponMessage(
        `Coupon "${couponCode}" applied successfully!`,
        "success"
      );
      couponInput.value = "";
      this.updateSummary();
    } else {
      this.showCouponMessage("Invalid coupon code", "error");
    }
  }

  showCouponMessage(message, type) {
    const couponMessage = document.getElementById("couponMessage");
    if (couponMessage) {
      couponMessage.textContent = message;
      couponMessage.className = `coupon-${type}`;

      // Auto clear message after 3 seconds
      setTimeout(() => {
        this.clearCouponMessage();
      }, 3000);
    }
  }

  clearCouponMessage() {
    const couponMessage = document.getElementById("couponMessage");
    if (couponMessage) {
      couponMessage.textContent = "";
      couponMessage.className = "";
    }
  }

  updateCartCount() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  updateUserInterface() {
    // Use the utility function
    AuthUtils.updateUserInterface(this.currentUser);
  }

  async loadRecentlyViewed() {
    const wishlist = document.getElementById("wishlist");
    if (!wishlist) return;

    const res = await fetch(
      `http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=wishlist&user_id=${this.currentUser.id}`
    );
    const data = await res.json();
    const wishes = data.data.map((w) => ({
      ...w,
      price: Number(w.price),
      currentPrice: Number(w.price) * (1 - Number(w.discount)),
    }));

    if (wishes.length === 0) {
      wishlist.innerHTML =
        '<p class="text-muted">No product in your wishlist yet.</p>';
      return;
    }

    const recentHTML = wishes
      .map(
        (product) => `
            <div class="recent-product-card">
                <div class="recent-product-image">
                    <img src="${product.image}" alt="${
          product.name
        }" loading="lazy">
                </div>
                <div class="recent-product-info">
                    <h5 class="recent-product-title">${product.name}</h5>
                    <p class="recent-product-price">$${(
                      product.currentPrice || product.price
                    ).toFixed(2)}</p>
                </div>
            </div>
        `
      )
      .join("");

    wishlist.innerHTML = recentHTML;
  }

  async proceedToCheckout() {
    if (this.cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const checkoutData = {
      cart: this.cart,
      applied_coupon: this.applied_coupon,
      sub_total: this.calculateSubtotal(),
      shipping: this.calculateShipping(),
      tax: this.calculateTax(this.calculateSubtotal()),
      total:
        this.calculateSubtotal() +
        this.calculateShipping() +
        this.calculateTax(this.calculateSubtotal()),
      user_id: this.currentUser.id,
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    window.location.href = "./checkout.html";
  }

  logout() {
    // Use the utility function
    AuthUtils.logout();
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize cart page when DOM is loaded
let cartPage;
document.addEventListener("DOMContentLoaded", () => {
  cartPage = new CartPage();
});

// Make it globally accessible
window.cartPage = cartPage;
