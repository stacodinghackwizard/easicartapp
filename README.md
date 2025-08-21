# EasiCart E-Commerce Application

A complete, responsive e-commerce web application built with HTML5, CSS3, and JavaScript (ES6+). This application provides a full shopping experience from user authentication to order completion.

## 🚀 Features

### 🔐 Authentication System

- **User Registration**: Create new accounts with email, password, and personal details
- **User Login**: Secure authentication with remember me functionality
- **Password Management**: Forgot password and change password capabilities
- **Session Management**: Persistent login sessions using localStorage/sessionStorage
- **Social Login**: Google and Facebook login options (UI only)

### 🛍️ Product Management

- **Product Catalog**: Browse products from FakeStoreAPI
- **Advanced Filtering**: Filter by category, price range, and rating
- **Search Functionality**: Search products by name and description
- **Sorting Options**: Sort by relevance, price, rating, and newest
- **Pagination**: Navigate through large product catalogs
- **Quick View**: Modal popup for quick product details
- **Wishlist**: Save products for later viewing

### 🛒 Shopping Cart

- **Add/Remove Items**: Add products to cart and remove them
- **Quantity Management**: Increase/decrease product quantities
- **Real-time Updates**: Cart updates automatically
- **Coupon System**: Apply discount codes
- **Price Calculation**: Automatic subtotal, shipping, and tax calculation
- **Recently Viewed**: Track and display recently viewed products

### 💳 Checkout Process

- **Multi-step Form**: Shipping, billing, and payment information
- **Address Management**: Separate shipping and billing addresses
- **Payment Methods**: Credit/Debit Card, PayPal, and Bank Transfer
- **Form Validation**: Client-side validation for all fields
- **Order Summary**: Review items and totals before checkout

### 📦 Order Management

- **Order Confirmation**: Success page with order details
- **Order History**: Track all placed orders
- **Receipt Download**: Generate and download order receipts
- **Shipping Information**: Complete delivery details
- **Status Tracking**: Order status and estimated delivery

### 📱 Mobile Responsiveness

- **Responsive Design**: Optimized for all screen sizes
- **Touch-friendly**: Mobile-optimized interactions
- **Mobile Navigation**: Collapsible sidebar menu
- **Adaptive Layouts**: Flexible grid systems
- **Mobile-specific CSS**: Dedicated mobile stylesheet

## 🛠️ Technologies Used

### Frontend

- **HTML5**: Semantic markup and modern structure
- **CSS3**: Advanced styling with Flexbox and Grid
- **JavaScript ES6+**: Modern JavaScript with classes and modules
- **Bootstrap 5.3.0**: UI framework for responsive design
- **Boxicons**: Icon library for consistent UI elements

### Libraries & APIs

- **Swiper.js**: Touch-enabled slider for product showcases
- **FakeStoreAPI**: Product data source for demonstration
- **localStorage/sessionStorage**: Client-side data persistence

### Development Tools

- **SCSS**: CSS preprocessor for maintainable styles
- **Git**: Version control system
- **Responsive Design**: Mobile-first approach

## 📁 Project Structure

```
EasiCartApp/
├── assets/                 # Images, icons, and media files
│   ├── home-slides/       # Homepage slider images
│   └── icons/             # Application icons
├── auth/                  # Authentication pages
│   ├── login.html         # Login/Register combined page
│   ├── register.html      # Standalone registration
│   ├── forgot_password.html # Password recovery
│   └── change_password.html # Password change
├── css/                   # Stylesheets
│   ├── main.css          # Global styles and layout
│   ├── auth.css          # Authentication page styles
│   ├── products.css      # Product listing styles
│   ├── cart.css          # Shopping cart styles
│   ├── checkout.css      # Checkout form styles
│   ├── payment.css       # Payment confirmation styles
│   └── mobile.css        # Mobile responsiveness
├── js/                    # JavaScript files
│   ├── app.js            # Main application logic
│   ├── auth.js           # Authentication system
│   ├── products.js       # Product management
│   ├── cart.js           # Shopping cart functionality
│   ├── checkout.js       # Checkout process
│   └── payment.js        # Payment confirmation
├── index.html             # Homepage
├── product.html           # Product listing page
├── cart.html              # Shopping cart page
├── checkout.html          # Checkout page
├── payment.html           # Payment confirmation page
├── main.scss              # SCSS source file
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)

### Installation

1. Clone or download the project files
2. Place all files in your web server directory
3. Open `index.html` in your browser
4. Start exploring the application!

### Development Setup

1. Use a local web server (e.g., Live Server in VS Code)
2. Ensure all file paths are correct
3. Check browser console for any errors
4. Test on different devices and screen sizes

## 💻 Usage

### For Users

1. **Browse Products**: Visit the homepage and explore categories
2. **Create Account**: Register for a new account or login
3. **Add to Cart**: Add products to your shopping cart
4. **Checkout**: Complete the checkout process
5. **Track Orders**: View order history and status

### For Developers

1. **Customize Styles**: Modify CSS files for branding
2. **Add Features**: Extend JavaScript classes for new functionality
3. **API Integration**: Replace FakeStoreAPI with your own backend
4. **Database**: Implement server-side data persistence

## 🔧 Customization

### Styling

- Modify `css/main.css` for global changes
- Update individual page CSS files for specific styling
- Use `css/mobile.css` for mobile-specific adjustments

### Functionality

- Extend JavaScript classes in the `js/` directory
- Add new pages following the existing structure
- Implement additional authentication methods

### Data Sources

- Replace FakeStoreAPI calls with your own API
- Implement server-side authentication
- Add database integration for user data

## 📱 Mobile Features

### Responsive Design

- **Breakpoints**: 768px (tablet) and 480px (mobile)
- **Flexible Grids**: CSS Grid and Flexbox layouts
- **Touch Optimization**: 44px minimum touch targets
- **Mobile Navigation**: Collapsible sidebar menu

### Mobile-Specific Enhancements

- **Sticky Elements**: Important sections stick to top on mobile
- **Optimized Forms**: Mobile-friendly form layouts
- **Touch Gestures**: Swipe support for sliders
- **Performance**: Optimized loading for mobile devices

## 🔒 Security Features

### Client-Side Security

- **Password Hashing**: Basic password encryption (demo purposes)
- **Input Validation**: Comprehensive form validation
- **XSS Prevention**: Safe HTML rendering
- **Session Management**: Secure session handling

### Data Protection

- **Local Storage**: Secure client-side data persistence
- **Input Sanitization**: Clean user inputs
- **Form Validation**: Prevent malicious submissions

## 🧪 Testing

### Browser Compatibility

- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅

### Device Testing

- **Desktop**: Full functionality ✅
- **Tablet**: Responsive layout ✅
- **Mobile**: Touch-optimized ✅

## 🚧 Known Limitations

### Current Implementation

- **Client-side Only**: No server-side persistence
- **Demo Data**: Uses FakeStoreAPI for products
- **Basic Security**: Simple password hashing for demo
- **No Real Payments**: Simulated payment processing

### Future Enhancements

- **Backend Integration**: Real database and API
- **Payment Gateway**: Actual payment processing
- **User Reviews**: Product rating and review system
- **Inventory Management**: Real-time stock tracking

## 🤝 Contributing

### Development Guidelines

1. Follow existing code structure and naming conventions
2. Ensure mobile responsiveness for all new features
3. Test across different browsers and devices
4. Maintain consistent styling and user experience

### Code Standards

- **HTML**: Semantic markup and accessibility
- **CSS**: BEM methodology and responsive design
- **JavaScript**: ES6+ classes and modern patterns
- **Performance**: Optimize for mobile devices

## 📄 License

This project is for educational and demonstration purposes. Feel free to use, modify, and distribute as needed.

## 🙏 Acknowledgments

- **FakeStoreAPI**: Product data source
- **Bootstrap**: UI framework
- **Boxicons**: Icon library
- **Swiper.js**: Touch slider functionality

## 📞 Support

For questions or support:

1. Check the code comments for implementation details
2. Review the browser console for error messages
3. Test on different devices to identify issues
4. Refer to the documentation for feature explanations

---

**Built with ❤️ for modern e-commerce experiences**
