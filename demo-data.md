# Demo Data for Testing

## Sample User Accounts

### Test User 1
- **Email**: demo@example.com
- **Password**: demo123
- **Name**: Demo User
- **Phone**: +1234567890

### Test User 2
- **Email**: test@example.com
- **Password**: test123
- **Name**: Test User
- **Phone**: +0987654321

## Demo Coupon Codes

### Valid Coupons
- **SAVE10**: 10% off (minimum $50 purchase)
- **FREESHIP**: Free shipping on orders over $100
- **WELCOME20**: 20% off for new users (minimum $30 purchase)

### Invalid Coupons (for testing error handling)
- **EXPIRED**: Expired coupon
- **INVALID**: Invalid coupon code
- **MINIMUM**: Requires minimum purchase amount

## Sample Product Categories

### Electronics
- Phones & Tablets
- Computers & Laptops
- Audio & Video
- Gaming

### Fashion
- Men's Clothing
- Women's Clothing
- Shoes & Accessories
- Jewelry

### Home & Office
- Furniture
- Kitchen & Dining
- Home Decor
- Office Supplies

### Beauty & Health
- Skincare
- Makeup
- Hair Care
- Health & Wellness

## Testing Scenarios

### 1. User Registration
1. Go to `/auth/register.html`
2. Fill out the registration form
3. Verify account creation
4. Check localStorage for user data

### 2. User Login
1. Go to `/auth/login.html`
2. Use demo credentials: demo@example.com / demo123
3. Test "Remember Me" functionality
4. Verify session persistence

### 3. Product Browsing
1. Go to `/product.html`
2. Test category filtering
3. Test price range filtering
4. Test search functionality
5. Test sorting options
6. Test pagination

### 4. Shopping Cart
1. Add products to cart
2. Test quantity adjustments
3. Test item removal
4. Apply demo coupon codes
5. Verify price calculations

### 5. Checkout Process
1. Proceed to checkout from cart
2. Fill out shipping information
3. Test billing address options
4. Select payment method
5. Complete order placement

### 6. Order Confirmation
1. Verify order details
2. Test receipt download
3. Check order history
4. Verify cart clearing

### 7. Mobile Responsiveness
1. Test on different screen sizes
2. Verify touch interactions
3. Check mobile navigation
4. Test form inputs on mobile

## Browser Console Commands

### Check Current User
```javascript
JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null')
```

### Check User Cart
```javascript
const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
if (user) {
  JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
}
```

### Check User Orders
```javascript
const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
if (user) {
  JSON.parse(localStorage.getItem(`orders_${user.id}`) || '[]')
}
```

### Clear All Data
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Simulate User Login
```javascript
const demoUser = {
  id: 'demo123',
  name: 'Demo User',
  email: 'demo@example.com',
  phone: '+1234567890'
};
localStorage.setItem('currentUser', JSON.stringify(demoUser));
location.reload();
```

## Common Issues & Solutions

### 1. Products Not Loading
- Check browser console for API errors
- Verify FakeStoreAPI is accessible
- Check network connectivity

### 2. Authentication Issues
- Clear browser storage and try again
- Verify email/password format
- Check for JavaScript errors

### 3. Cart Not Updating
- Verify user is logged in
- Check localStorage for cart data
- Refresh page to trigger updates

### 4. Mobile Layout Issues
- Verify mobile.css is loaded
- Check viewport meta tag
- Test on actual mobile devices

### 5. Form Validation Errors
- Check required field completion
- Verify email format
- Ensure password strength requirements

## Performance Tips

### 1. Development
- Use browser dev tools for debugging
- Monitor network requests
- Check console for errors

### 2. Testing
- Test on multiple browsers
- Verify mobile responsiveness
- Check accessibility features

### 3. Deployment
- Minify CSS and JavaScript
- Optimize images
- Enable browser caching

---

**Use this demo data to thoroughly test all application features before deployment.**
