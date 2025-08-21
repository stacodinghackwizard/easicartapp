class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuthStatus();
    this.setupPasswordToggles();

    // Redirect logged-in users away from auth pages
    this.redirectIfAuthenticated();
  }

  setupEventListeners() {
    // Tab switching
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    // Form submissions
    const loginForm = document.getElementById("loginFormElement");
    const registerForm = document.getElementById("registerFormElement");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // Update forms
    document.querySelectorAll(".auth-form").forEach((form) => {
      form.classList.remove("active");
    });
    document.getElementById(`${tabName}Form`).classList.add("active");
  }

  setupPasswordToggles() {
    const passwordToggles = document.querySelectorAll(".password-toggle");
    passwordToggles.forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        const input = e.target.previousElementSibling;
        if (input.type === "password") {
          input.type = "text";
          e.target.classList.remove("bx-show");
          e.target.classList.add("bx-hide");
        } else {
          input.type = "password";
          e.target.classList.remove("bx-hide");
          e.target.classList.add("bx-show");
        }
      });
    });
  }

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      submitBtn.textContent = "Signing In...";
      submitBtn.disabled = true;

      const credentials = { email, password };
      await this.login(credentials, rememberMe);

      this.showNotification("Login successful!", "success");
      window.location.href = "../index.html";
    } catch (error) {
      this.showNotification(
        error.message || "Login failed. Please try again.",
        "error"
      );
    } finally {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const phone = document.getElementById("registerPhone").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms").checked;

    // Validation
    if (password !== confirmPassword) {
      this.showNotification("Passwords do not match", "error");
      return;
    }

    if (!agreeTerms) {
      this.showNotification(
        "Please agree to the terms and conditions",
        "error"
      );
      return;
    }

    if (!this.validatePassword(password)) {
      this.showNotification(
        "Password must be at least 8 characters with uppercase, lowercase, and number",
        "error"
      );
      return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    try {
      submitBtn.textContent = "Creating Account...";
      submitBtn.disabled = true;

      await this.register({
        full_name: name,
        email,
        phone,
        password,
      });
      this.showNotification("Account created successfully!", "success");

      this.switchTab("login");
      e.target.reset();
    } catch (error) {
      this.showNotification(
        error.message || "Registration failed. Please try again.",
        "error"
      );
    } finally {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return (
      password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers
    );
  }

  async login(credentials, rememberMe) {
    const res = await fetch("http://easicartapp.ademuyiwaadewoye.com/index.php?action=login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (data.status == "error") {
      throw new Error(data.message);
    }

    const user = data.user;
    this.isAuthenticated = true;

    if (rememberMe) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      sessionStorage.setItem("currentUser", JSON.stringify(user));
    }
  }

  async register(user) {
    const res = await fetch("http://easicartapp.ademuyiwaadewoye.com/index.php?action=signup", {
      method: "POST",
      body: JSON.stringify(user),
    });

    const data = await res.json();
    if (data.status == "error") {
      throw new Error(data.message);
    }
  }

  logout() {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");

    this.currentUser = null;
    this.isAuthenticated = false;

    window.location.href = "../index.html";
  }

  checkAuthStatus() {
    // Check localStorage first, then sessionStorage
    let user =
      localStorage.getItem("currentUser") ||
      sessionStorage.getItem("currentUser");

    if (user) {
      try {
        this.currentUser = JSON.parse(user);
        this.isAuthenticated = true;
      } catch (error) {
        console.error("Error parsing user data:", error);
        this.logout();
      }
    }
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

  redirectIfAuthenticated() {
    // Use the utility function
    return AuthUtils.redirectIfAuthenticated();
  }
}

// Initialize authentication system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AuthSystem();
});

// Export for use in other scripts
window.AuthSystem = AuthSystem;
