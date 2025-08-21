// Wishlist Page Functionality
class WishlistPage {
  constructor() {
    this.currentUser = null;
    this.wishlist = [];
    this.init();
  }

  init() {
    this.checkAuth();
    this.loadWishlist();
    this.setupEventListeners();
    this.updateUserInterface();
  }

  checkAuth() {
    // Use the utility function
    this.currentUser = AuthUtils.requireAuth();
  }

  async loadWishlist() {
    const res = await fetch(
      `http://easicartapp.ademuyiwaadewoye.com/index.php?action=wishlist&user_id=${this.currentUser.id}`
    );
    const data = await res.json();
    this.wishlist = data.data.map((w) => ({
      ...w,
      price: Number(w.price),
      discount: Number(w.discount) * 100,
      currentPrice: Number(w.price) * (1 - Number(w.discount)),
    }));
    this.renderWishlist();
    this.updateSummary();
  }

  setupEventListeners() {
    // Add all to cart button
    const addAllToCartBtn = document.getElementById("addAllToCartBtn");
    if (addAllToCartBtn) {
      addAllToCartBtn.addEventListener("click", () => this.addAllToCart());
    }

    // Clear wishlist button
    const clearWishlistBtn = document.getElementById("clearWishlistBtn");
    if (clearWishlistBtn) {
      clearWishlistBtn.addEventListener("click", () => this.clearWishlist());
    }

    // Search functionality
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        this.handleSearch(e.target.value)
      );
    }
  }

  renderWishlist() {
    const wishlistItems = document.getElementById("wishlistItems");
    const emptyWishlist = document.getElementById("emptyWishlist");
    const wishlistCount = document.getElementById("wishlistCount");

    if (!wishlistItems || !emptyWishlist || !wishlistCount) return;

    if (this.wishlist.length === 0) {
      wishlistItems.innerHTML = "";
      emptyWishlist.classList.remove("d-none");
      wishlistCount.textContent = "0 items";
      return;
    }

    emptyWishlist.classList.add("d-none");
    wishlistCount.textContent = `${this.wishlist.length} item${
      this.wishlist.length !== 1 ? "s" : ""
    }`;

    const wishlistHTML = this.wishlist
      .map((item) => this.createWishlistItemHTML(item))
      .join("");
    wishlistItems.innerHTML = wishlistHTML;

    // Setup event listeners for each item
    this.setupWishlistItemListeners();
  }

  createWishlistItemHTML(item) {
    const discount = item.originalPrice
      ? Math.round(
          ((item.originalPrice - item.currentPrice) / item.originalPrice) * 100
        )
      : 0;

    return `
            <div class="wishlist-item" data-product-id="${item.id}">
                <div class="wishlist-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    ${
                      discount > 0
                        ? `<div class="wishlist-item-badge">-${discount}%</div>`
                        : ""
                    }
                </div>
                
                <div class="wishlist-item-details">
                    <h4 class="wishlist-item-title">${item.name}</h4>
                    <p class="wishlist-item-category">${this.capitalizeFirst(
                      item.category
                    )}</p>
                    
                    <div class="wishlist-item-rating">
                        <div class="rating-stars">
                            ${this.generateStarRating(item.rating)}
                        </div>
                        <span class="rating-count">(${
                          item.number_of_ratings || 0
                        })</span>
                    </div>
                    
                    <div class="wishlist-item-price">
                        <span class="current-price">$${
                          item.currentPrice || item.price
                        }</span>
                        ${
                          item.price && item.price > item.currentPrice
                            ? `<span class="original-price">$${item.price}</span>`
                            : ""
                        }
                        ${
                          discount > 0
                            ? `<span class="discount">-${discount}%</span>`
                            : ""
                        }
                    </div>
                </div>
                
                <div class="wishlist-item-actions">
                    <div class="action-buttons">
                        <button class="add-to-cart-btn" onclick="wishlistPage.addToCart('${
                          item.id
                        }')">
                            <i class="bx bx-cart"></i> Add to Cart
                        </button>
                        <button class="remove-from-wishlist-btn" onclick="wishlistPage.removeFromWishlist('${
                          item.id
                        }')">
                            <i class="bx bx-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = "";

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="bx bxs-star"></i>';
    }

    // Half star
    if (hasHalfStar) {
      stars += '<i class="bx bxs-star-half"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="bx bx-star"></i>';
    }

    return stars;
  }

  setupWishlistItemListeners() {
    // Add any additional event listeners for wishlist items if needed
    const wishlistItems = document.querySelectorAll(".wishlist-item");
    wishlistItems.forEach((item) => {
      // Add hover effects or other interactions
      item.addEventListener("mouseenter", () => {
        item.style.transform = "translateY(-2px)";
      });

      item.addEventListener("mouseleave", () => {
        item.style.transform = "translateY(0)";
      });
    });
  }

  addToCart(productId) {
    const product = this.wishlist.find((item) => item.id === productId);
    if (!product) return;

    // Get current cart
    const cartKey = `cart_${this.currentUser.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

    // Check if product already in cart
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    // Save cart
    localStorage.setItem(cartKey, JSON.stringify(cart));

    // Update cart count in header
    this.updateCartCount();

    // Show success message
    this.showNotification(`${product.title} added to cart!`, "success");

    // Remove from wishlist
    this.removeFromWishlist(productId);
  }

  removeFromWishlist(productId) {
    this.wishlist = this.wishlist.filter((item) => item.id !== productId);
    this.renderWishlist();
    this.updateSummary();

    // Show notification
    this.showNotification("Product removed from wishlist", "info");
  }

  addAllToCart() {
    if (this.wishlist.length === 0) return;

    // Get current cart
    const cartKey = `cart_${this.currentUser.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

    // Add all wishlist items to cart
    this.wishlist.forEach((product) => {
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          ...product,
          quantity: 1,
        });
      }
    });

    // Save cart
    localStorage.setItem(cartKey, JSON.stringify(cart));

    // Clear wishlist
    this.clearWishlist();

    // Update cart count
    this.updateCartCount();

    // Show success message
    this.showNotification(
      `All ${this.wishlist.length} products added to cart!`,
      "success"
    );
  }

  clearWishlist() {
    if (this.wishlist.length === 0) return;

    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      this.wishlist = [];
      this.renderWishlist();
      this.updateSummary();

      this.showNotification("Wishlist cleared", "info");
    }
  }

  updateSummary() {
    const summaryTotalItems = document.getElementById("summaryTotalItems");
    const summaryTotalValue = document.getElementById("summaryTotalValue");
    const addAllToCartBtn = document.getElementById("addAllToCartBtn");
    const clearWishlistBtn = document.getElementById("clearWishlistBtn");

    if (summaryTotalItems) {
      summaryTotalItems.textContent = this.wishlist.length;
    }

    if (summaryTotalValue) {
      const totalValue = this.wishlist.reduce((total, item) => {
        return total + (item.currentPrice || item.price);
      }, 0);
      summaryTotalValue.textContent = `$${totalValue.toFixed(2)}`;
    }

    // Enable/disable buttons based on wishlist state
    const hasItems = this.wishlist.length > 0;
    if (addAllToCartBtn) addAllToCartBtn.disabled = !hasItems;
    if (clearWishlistBtn) clearWishlistBtn.disabled = !hasItems;
  }

  handleSearch(query) {
    if (!query.trim()) {
      this.renderWishlist();
      return;
    }

    const filteredWishlist = this.wishlist.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );

    this.renderFilteredWishlist(filteredWishlist);
  }

  renderFilteredWishlist(filteredWishlist) {
    const wishlistItems = document.getElementById("wishlistItems");
    const emptyWishlist = document.getElementById("emptyWishlist");
    const wishlistCount = document.getElementById("wishlistCount");

    if (!wishlistItems || !emptyWishlist || !wishlistCount) return;

    if (filteredWishlist.length === 0) {
      wishlistItems.innerHTML = `
                <div class="text-center py-4">
                    <i class="bx bx-search text-muted" style="font-size: 3rem;"></i>
                    <h4 class="mt-3">No products found</h4>
                    <p class="text-muted">Try adjusting your search terms</p>
                </div>
            `;
      emptyWishlist.classList.add("d-none");
      wishlistCount.textContent = "0 items found";
      return;
    }

    emptyWishlist.classList.add("d-none");
    wishlistCount.textContent = `${filteredWishlist.length} item${
      filteredWishlist.length !== 1 ? "s" : ""
    } found`;

    const wishlistHTML = filteredWishlist
      .map((item) => this.createWishlistItemHTML(item))
      .join("");
    wishlistItems.innerHTML = wishlistHTML;

    this.setupWishlistItemListeners();
  }

  updateCartCount() {
    const cartKey = `cart_${this.currentUser.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Update cart count in header
    const cartCountElement = document.getElementById("cartCount");
    if (cartCountElement) {
      cartCountElement.textContent = cartCount;
    }
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
                <li><button class="dropdown-item" onclick="wishlistPage.logout()" style="border: none; background: none; width: 100%; text-align: left; padding: 0.5rem 1rem;"><i class="bx bx-log-out"></i> Logout</button></li>
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

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  showNotification(message, type = "info") {
    // Use the utility function
    AuthUtils.showNotification(message, type);
  }
}

// Initialize wishlist page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.wishlistPage = new WishlistPage();
});
