// Authentication Utilities - Shared across all pages
class AuthUtils {
  static checkAuthStatus() {
    // Check if user is authenticated
    const currentUser =
      localStorage.getItem("currentUser") ||
      sessionStorage.getItem("currentUser");
    if (!currentUser) {
      return null;
    }

    try {
      return JSON.parse(currentUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Clear invalid data
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("currentUser");
      return null;
    }
  }

  static requireAuth(redirectPath = "./auth/login.html") {
    const user = this.checkAuthStatus();
    if (!user) {
      window.location.href = redirectPath;
      return null;
    }
    return user;
  }

  static redirectIfAuthenticated(targetPath = "../index.html") {
    const user = this.checkAuthStatus();
    if (user && user.id) {
      window.location.href = targetPath;
      return true;
    }
    return false;
  }

  static logout() {
    // Clear user data
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");

    // Redirect to login page
    window.location.href = "./auth/login.html";
  }

  static updateUserInterface(user) {
    // Update user menu text
    const userMenuText = document.getElementById("userMenuText");
    if (userMenuText && user) {
      userMenuText.textContent = user.name;
    }

    // Update cart count
    this.updateCartCount(user);

    // Update user dropdown menu
    this.updateUserDropdown(user);

    // Update sidebar links
    this.updateSidebarLinks(user);
  }

  static updateIndexPageUI(user) {
    // Specialized function for index.html page
    // Update user menu text
    const userMenuText = document.getElementById("userMenuText");
    if (userMenuText && user) {
      userMenuText.textContent = user.name;
    }

    // Update cart count
    this.updateCartCount(user);

    // Update user dropdown menu for index page
    this.updateIndexUserDropdown(user);

    // Update sidebar links for index page
    this.updateIndexSidebarLinks(user);
  }

  static updateIndexUserDropdown(user) {
    const userDropdown = document.getElementById("userDropdown");
    if (!userDropdown) return;

    if (user) {
      // For index page, we need to preserve the existing structure
      // Just update the user menu text and show/hide appropriate elements
      const authButtons = document.getElementById("authButtons");
      const userMenu = document.getElementById("userMenu");

      if (authButtons) authButtons.style.display = "none";
      if (userMenu) userMenu.style.display = "block";
    } else {
      const authButtons = document.getElementById("authButtons");
      const userMenu = document.getElementById("userMenu");

      if (authButtons) authButtons.style.display = "block";
      if (userMenu) userMenu.style.display = "none";
    }
  }

  static updateUserDropdown(user) {
    const userDropdown = document.getElementById("userDropdown");
    if (!userDropdown) return;

    if (user) {
      userDropdown.innerHTML = `
                <li><a class="dropdown-item" href="./auth/change_password.html"><i class="bx bx-lock"></i> Change Password</a></li>
                <li><a class="dropdown-item" href="./orders.html"><i class="bx bx-package"></i> My Orders</a></li>
                <li><a class="dropdown-item" href="./wishlist.html"><i class="bx bx-heart"></i> Wishlist</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item" onclick="AuthUtils.logout()" style="border: none; background: none; width: 100%; text-align: left; padding: 0.5rem 1rem;"><i class="bx bx-log-out"></i> Logout</button></li>
            `;
    } else {
      userDropdown.innerHTML = `
                <li><a class="dropdown-item" href="./auth/login.html"><i class="bx bx-log-in"></i> Sign In</a></li>
                <li><a class="dropdown-item" href="./auth/register.html"><i class="bx bx-user-plus"></i> Register</a></li>
            `;
    }
  }

  static updateSidebarLinks(user) {
    const sidebarAccountLink = document.getElementById("sidebarAccountLink");
    const sidebarOrdersLink = document.getElementById("sidebarOrdersLink");
    const sidebarReviewsLink = document.getElementById("sidebarReviewsLink");
    const sidebarWishlistLink = document.getElementById("sidebarWishlistLink");
    const mobileUserBtn = document.getElementById("mobileUserBtn");

    if (user) {
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

  static updateIndexSidebarLinks(user) {
    const sidebarAccountLink = document.getElementById("sidebarAccountLink");
    const sidebarOrdersLink = document.getElementById("sidebarOrdersLink");
    const sidebarReviewsLink = document.getElementById("sidebarReviewsLink");
    const sidebarWishlistLink = document.getElementById("sidebarWishlistLink");
    const mobileUserBtn = document.getElementById("mobileUserBtn");

    if (user) {
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

  static async updateCartCount(user) {
    if (!user) return;

    const res = await fetch(
      `http://easicartapp.ademuyiwaadewoye.com/index.php?action=cart&user_id=${user.id}`
    );
    const data = await res.json();
    const cart = data.data;
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Update cart count in header
    const cartCountElement = document.getElementById("cartCount");
    if (cartCountElement) {
      if (cartCount > 0) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = "inline";
      } else {
        cartCountElement.style.display = "none";
      }
    }

    // Update mobile cart count
    const mobileCartCount = document.getElementById("mobileCartCount");
    if (mobileCartCount) {
      if (cartCount > 0) {
        mobileCartCount.textContent = cartCount;
        mobileCartCount.style.display = "inline";
      } else {
        mobileCartCount.style.display = "none";
      }
    }

    return cartCount;
  }

  static showNotification(message, type = "info") {
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
