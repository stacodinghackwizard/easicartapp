class ProductsPage {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentPage = 1;
    this.productsPerPage = 12;
    this.currentUser = null;
    this.currentCategory = null;
    this.currentFilters = {
      priceRange: { min: 0, max: 1000 },
      rating: 4,
      search: "",
    };

    this.init();
  }

  async init() {
    // Check authentication
    this.checkAuth();

    await this.loadProducts();
    this.setupEventListeners();
    this.updateUserInterface();
    this.renderProducts();
    this.renderCategories();
    this.setupFilters();
    this.updateResultsCount();
  }

  checkAuth() {
    // Use the utility function
    this.currentUser = AuthUtils.requireAuth();
  }

  async loadProducts() {
    try {
      this.showLoading(true);

      const res = await fetch(
        `http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=products&user_id=${this.currentUser.id}`
      );
      const data = await res.json();
      this.products = data.data;

      // Enhance products with additional data for demo
      this.products = this.products.map((product) => ({
        ...product,
        discount: Number(product.discount) * 100,
        price: Number(product.price),
        currentPrice: Number(product.price) * (1 - Number(product.discount)),
        rating: product.rating,
        ratingCount: product.number_of_ratings,
        badge: Math.random() > 0.8 ? "Sale" : null,
      }));

      this.filteredProducts = [...this.products];
    } catch (error) {
      this.showError(
        error.message || "Failed to load products. Please try again."
      );
    } finally {
      this.showLoading(false);
    }
  }

  setupEventListeners() {
    // Search form
    const searchForm = document.getElementById("searchForm");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => this.handleSearch(e));
    }

    // Sort select
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) =>
        this.handleSort(e.target.value)
      );
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById("clearFilters");
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => this.clearFilters());
    }

    // Price range inputs
    const minPriceInput = document.getElementById("minPrice");
    const maxPriceInput = document.getElementById("maxPrice");
    if (minPriceInput && maxPriceInput) {
      minPriceInput.addEventListener("input", (e) =>
        this.handlePriceFilter(e.target.value, "min")
      );
      maxPriceInput.addEventListener("input", (e) =>
        this.handlePriceFilter(e.target.value, "max")
      );
    }

    // Rating filters
    const ratingInputs = document.querySelectorAll(".rating-filter input");
    ratingInputs.forEach((input) => {
      input.addEventListener("change", (e) =>
        this.handleRatingFilter(e.target.value)
      );
    });
  }

  setupFilters() {
    // Price range slider
    const priceRange = document.getElementById("priceRange");
    if (priceRange) {
      priceRange.addEventListener("input", (e) => {
        this.currentFilters.priceRange.max = parseInt(e.target.value);
        this.updatePriceInputs();
        this.applyFilters();
      });
    }

    // Initialize price inputs
    this.updatePriceInputs();
  }

  updatePriceInputs() {
    const minPriceInput = document.getElementById("minPrice");
    const maxPriceInput = document.getElementById("maxPrice");

    if (minPriceInput && maxPriceInput) {
      minPriceInput.value = this.currentFilters.priceRange.min;
      maxPriceInput.value = this.currentFilters.priceRange.max;
    }
  }

  handleSearch(e) {
    e.preventDefault();
    const searchInput = document.getElementById("searchInput");
    this.currentFilters.search = searchInput.value.toLowerCase();
    this.currentPage = 1;
    this.applyFilters();
  }

  handleSort(sortBy) {
    this.sortProducts(sortBy);
    this.renderProducts();
  }

  handlePriceFilter(value, type) {
    const numValue = parseInt(value) || 0;
    if (type === "min") {
      this.currentFilters.priceRange.min = numValue;
    } else {
      this.currentFilters.priceRange.max = numValue;
    }
    this.applyFilters();
  }

  handleRatingFilter(rating) {
    this.currentFilters.rating = parseInt(rating);
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter((product) => {
      // Search filter
      if (this.currentFilters.search) {
        const searchMatch =
          product.name.toLowerCase().includes(this.currentFilters.search) ||
          product.category.toLowerCase().includes(this.currentFilters.search);
        if (!searchMatch) return false;
      }

      // Category filter
      if (
        this.currentCategory &&
        product.category.toLowerCase() !== this.currentCategory
      ) {
        return false;
      }

      // Price filter
      const price = product.currentPrice;
      if (
        price < this.currentFilters.priceRange.min ||
        price > this.currentFilters.priceRange.max
      ) {
        return false;
      }

      // Rating filter
      if (product.rating < this.currentFilters.rating) {
        return false;
      }

      return true;
    });

    this.currentPage = 1;
    this.renderProducts();
    this.updateResultsCount();
  }

  sortProducts(sortBy) {
    switch (sortBy) {
      case "price-low":
        this.filteredProducts.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case "price-high":
        this.filteredProducts.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case "rating":
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        this.filteredProducts.sort(
          (a, b) =>
            new Date(b.createdAt || Date.now()) -
            new Date(a.createdAt || Date.now())
        );
        break;
      default:
        // Relevance - keep original order
        break;
    }
  }

  clearFilters() {
    this.currentFilters = {
      priceRange: { min: 0, max: 1000 },
      rating: 4,
      search: "",
    };
    this.currentCategory = null;

    // Reset form inputs
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";

    const minPriceInput = document.getElementById("minPrice");
    const maxPriceInput = document.getElementById("maxPrice");
    if (minPriceInput) minPriceInput.value = "";
    if (maxPriceInput) maxPriceInput.value = "";

    const priceRange = document.getElementById("priceRange");
    if (priceRange) priceRange.value = 1000;

    // Reset rating checkboxes
    const ratingInputs = document.querySelectorAll(".rating-filter input");
    ratingInputs.forEach((input, index) => {
      input.checked = index === 0; // Only first one checked
    });

    // Reset category
    const categoryLinks = document.querySelectorAll(".category-list a");
    categoryLinks.forEach((link) => link.classList.remove("active"));

    this.applyFilters();
  }

  renderCategories() {
    const categoryList = document.getElementById("categoryList");
    if (!categoryList) return;

    // Get unique categories
    const categories = [...new Set(this.products.map((p) => p.category))];

    const categoryHTML = categories
      .map(
        (category) => `
            <li>
                <a href="#" data-category="${category}" class="category-link">
                    ${this.capitalizeFirst(category)}
                </a>
            </li>
        `
      )
      .join("");

    categoryList.innerHTML = categoryHTML;

    // Add event listeners
    const categoryLinks = document.querySelectorAll(".category-link");
    categoryLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleCategoryFilter(e.target.dataset.category);
      });
    });
  }

  handleCategoryFilter(category) {
    // Toggle category selection
    if (this.currentCategory === category.toLowerCase()) {
      this.currentCategory = null;
      document.querySelectorAll(".category-list a").forEach((link) => {
        link.classList.remove("active");
      });
    } else {
      this.currentCategory = category.toLowerCase();
      document.querySelectorAll(".category-list a").forEach((link) => {
        link.classList.remove("active");
        if (link.dataset.category === category) {
          link.classList.add("active");
        }
      });
    }

    this.applyFilters();
  }

  renderProducts() {
    const productsGrid = document.getElementById("productsGrid");
    if (!productsGrid) return;

    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

    if (productsToShow.length === 0) {
      productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="bx bx-search-alt"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            `;
      return;
    }

    const productsHTML = productsToShow
      .map((product) => this.createProductCard(product))
      .join("");
    productsGrid.innerHTML = productsHTML;

    // Add event listeners to product cards
    this.setupProductCardListeners();

    // Render pagination
    this.renderPagination();
  }

  createProductCard(product) {
    const discountHTML =
      product.discount > 0
        ? `
            <div class="product-badge">${product.discount}% OFF</div>
        `
        : "";

    const badgeHTML = product.badge
      ? `
            <div class="product-badge">${product.badge}</div>
        `
      : "";

    const originalPriceHTML =
      product.discount > 0
        ? `
            <span class="original-price">$${product.price.toFixed(2)}</span>
            <span class="discount">-${product.discount}%</span>
        `
        : "";

    const ratingStars =
      "★".repeat(product.rating) + "☆".repeat(5 - product.rating);

    return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${
      product.name
    }" loading="lazy">
                    ${discountHTML}
                    ${badgeHTML}
                    <button class="product-wishlist ${
                      product.in_wishlist ? "active" : ""
                    }" data-product-id="${product.id}">
                        <i class="bx ${
                          product.in_wishlist ? "bxs-heart" : "bx-heart"
                        }"></i>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-info-content">
                      <h3 class="product-title">${product.name}</h3>
                        <p class="product-category">${this.capitalizeFirst(
                          product.category
                        )}</p>
                        <div class="product-rating">
                            <span class="rating-stars">${ratingStars}</span>
                            <span class="rating-count">(${
                              product.ratingCount
                            })</span>
                        </div>
                        <div class="product-price">
                            <span class="current-price">$${Number(
                              product.currentPrice
                            ).toFixed(2)}</span>
                            ${originalPriceHTML}
                        </div> 
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-product-id="${
                          product.id
                        }">
                            Add to Cart
                        </button>
                        <button class="quick-view-btn" data-product-id="${
                          product.id
                        }">
                            Quick View
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  setupProductCardListeners() {
    // Add to cart buttons
    const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
    addToCartBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId = e.target.dataset.productId;
        this.addToCart(productId);
      });
    });

    // Wishlist buttons
    const wishlistBtns = document.querySelectorAll(".product-wishlist");
    wishlistBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId =
          e.target.closest(".product-wishlist").dataset.productId;
        this.toggleWishlist(productId);
      });
    });

    // Quick view buttons
    const quickViewBtns = document.querySelectorAll(".quick-view-btn");
    quickViewBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const productId = e.target.dataset.productId;
        await this.showQuickView(productId);
      });
    });
  }

  async addToCart(productId) {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser")
    );

    if (!currentUser) {
      window.location.href = "./auth/login.html";
      return;
    }

    const res = await fetch(
      `http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=cart&user_id=${currentUser.id}&product_id=${productId}`
    );
    const data = await res.json();
    const existingItem = data.data;

    if (existingItem) {
      existingItem.quantity += 1;
      await fetch(
        `http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=cart&user_id=${currentUser.id}&product_id=${productId}`,
        {
          method: "PUT",
          body: JSON.stringify(existingItem),
        }
      );
    } else {
      await fetch(
        `http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=cart&user_id=${currentUser.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            user_id: currentUser.id,
            product_id: productId,
            quantity: 1,
          }),
        }
      );
    }

    // Update cart count
    this.updateCartCount();

    // Show success message
    this.showNotification("Product added to cart!", "success");
  }

  async toggleWishlist(productId) {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser")
    );

    if (!currentUser) {
      window.location.href = "./auth/login.html";
      return;
    }

    const exists = await this.checkWishlistStatus(productId);
    if (exists) {
      const res = await fetch(
        `http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=wishlist`,
        {
          method: "DELETE",
          body: JSON.stringify({
            user_id: currentUser.id,
            product_id: productId,
          }),
        }
      );

      const data = await res.json();
      if (data.status == "error") {
        this.showNotification(
          data.message || "Error removing product from wishlist",
          "error"
        );
        return;
      }
      this.showNotification("Removed from wishlist", "info");
    } else {
      await fetch(`http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=wishlist`, {
        method: "POST",
        body: JSON.stringify({
          user_id: currentUser.id,
          product_id: productId,
        }),
      });

      this.showNotification("Added to wishlist", "success");
    }

    // Update wishlist button appearance
    await this.updateWishlistButton(productId);
  }

  async checkWishlistStatus(productId) {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser")
    );
    if (!currentUser) return false;

    const res = await fetch(
      `http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=products&user_id=${currentUser.id}&product_id=${productId}`
    );
    const data = await res.json();
    const product = data.data;
    return product.in_wishlist;
  }

  async updateWishlistButton(productId) {
    const wishlistBtn = document.querySelector(
      `[data-product-id="${productId}"]`
    );
    if (!wishlistBtn) return;

    const isInWishlist = await this.checkWishlistStatus(productId);
    const icon = wishlistBtn.querySelector("i");

    if (isInWishlist) {
      wishlistBtn.classList.add("active");
      icon.className = "bx bxs-heart";
    } else {
      wishlistBtn.classList.remove("active");
      icon.className = "bx bx-heart";
    }
  }

  async showQuickView(productId) {
    const res = await fetch(
      `http://easicartapp.ademuyiwaadewoye.com/index.php?action=products&product_id=${productId}&user_id=${this.currentUser.id}`
    );
    const data = await res.json();

    if (!data.status == "error") return;
    const prod = data.data;
    const product = {
      ...prod,
      discount: Number(prod.discount),
      price: Number(prod.price),
      currentPrice: prod.price * (1 - prod.discount),
      rating: Math.round(prod.rating),
      ratingCount: prod.number_of_ratings,
      badge: Math.random() > 0.8 ? "Sale" : null,
    };

    // Create quick view modal
    const modalHTML = `
            <div class="modal fade" id="quickViewModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${product.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <img src="${product.image}" alt="${
      product.name
    }" class="img-fluid">
                                </div>
                                <div class="col-md-6">
                                    <h4>${product.name}</h4>
                                    <p class="text-muted">${this.capitalizeFirst(
                                      product.category
                                    )}</p>
                                    <p>${product.description}</p>
                                    <div class="price-section mb-3">
                                        <span class="h3 text-warning">$${product.currentPrice.toFixed(
                                          2
                                        )}</span>
                                        ${
                                          product.discount > 0
                                            ? `<span class="text-muted text-decoration-line-through ms-2">$${product.price.toFixed(
                                                2
                                              )}</span>`
                                            : ""
                                        }
                                    </div>
                                    <button class="btn btn-warning btn-lg w-100 mb-2" onclick="productsPage.addToCart(${
                                      product.id
                                    })">
                                        Add to Cart
                                    </button>
                                    <button class="btn btn-outline-warning w-100" onclick="productsPage.toggleWishlist(${
                                      product.id
                                    })">
                                        Add to Wishlist
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Remove existing modal if any
    const existingModal = document.getElementById("quickViewModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(
      document.getElementById("quickViewModal")
    );
    modal.show();
  }

  renderPagination() {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    const totalPages = Math.ceil(
      this.filteredProducts.length / this.productsPerPage
    );

    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    let paginationHTML = "";

    // Previous button
    paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" data-page="${
                  this.currentPage - 1
                }">Previous</a>
            </li>
        `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= this.currentPage - 2 && i <= this.currentPage + 2)
      ) {
        paginationHTML += `
                    <li class="page-item ${
                      i === this.currentPage ? "active" : ""
                    }">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        paginationHTML +=
          '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
    }

    // Next button
    paginationHTML += `
            <li class="page-item ${
              this.currentPage === totalPages ? "disabled" : ""
            }">
                <a class="page-link" href="#" data-page="${
                  this.currentPage + 1
                }">Next</a>
            </li>
        `;

    pagination.innerHTML = paginationHTML;

    // Add event listeners
    const pageLinks = pagination.querySelectorAll(".page-link");
    pageLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = parseInt(e.target.dataset.page);
        if (page && page !== this.currentPage) {
          this.goToPage(page);
        }
      });
    });
  }

  goToPage(page) {
    this.currentPage = page;
    this.renderProducts();

    // Scroll to top of products section
    const productsSection = document.querySelector(".products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  updateResultsCount() {
    const resultsCount = document.getElementById("resultsCount");
    if (resultsCount) {
      resultsCount.textContent = this.filteredProducts.length;
    }
  }

  async updateCartCount() {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser")
    );
    if (!currentUser) return;

    const res = await fetch(
      `http://easicartapp.ademuyiwaadewoye.com/public/index.php?action=cart&user_id=${currentUser.id}`
    );
    const data = await res.json();
    const cart = data.data;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  updateUserInterface() {
    // Use the utility function
    AuthUtils.updateUserInterface(this.currentUser);
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

  showLoading(show) {
    const loadingSpinner = document.getElementById("loadingSpinner");
    if (loadingSpinner) {
      loadingSpinner.style.display = show ? "block" : "none";
    }
  }

  showError(message) {
    this.showNotification(message, "error");
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

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize products page when DOM is loaded
let productsPage;
document.addEventListener("DOMContentLoaded", () => {
  productsPage = new ProductsPage();
});

// Make it globally accessible for quick view functions
window.productsPage = productsPage;
