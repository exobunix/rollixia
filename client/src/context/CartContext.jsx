import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useToast } from './ToastContext';
import { trackPixelEvent } from '../utils/metaPixel';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { addToast } = useToast();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('digitalstore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState(() => {
    return localStorage.getItem('digitalstore_coupon') || '';
  });

  const [cartTotals, setCartTotals] = useState({
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    coupon: null
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Recalculate server-side whenever items or coupon change
  useEffect(() => {
    try {
      localStorage.setItem('digitalstore_cart', JSON.stringify(items));
    } catch (e) {}

    async function recalculate() {
      if (items.length === 0) {
        setCartTotals({
          items: [],
          subtotal: 0,
          discount: 0,
          tax: 0,
          total: 0,
          coupon: null
        });
        return;
      }

      setCalculating(true);
      try {
        const payload = {
          items: items.map(i => ({ productId: i.productId, licenseId: i.licenseId })),
          couponCode: couponCode ? couponCode.trim() : null
        };
        const res = await apiRequest('/api/cart/calculate', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setCartTotals(res);
      } catch (err) {
        console.error('Cart calculation failed:', err);
      } finally {
        setCalculating(false);
      }
    }

    recalculate();
  }, [items, couponCode]);

  const addToCart = (product, license = null, openDrawer = true) => {
    const targetLicenseId = license ? license.id : (product.license_id || null);
    // Digital products: avoid redundant duplicates with the exact same license
    const existingIndex = items.findIndex(
      i => i.productId === product.id && i.licenseId === targetLicenseId
    );

    if (existingIndex > -1) {
      addToast(`"${product.title}" is already in your cart!`, 'info');
      if (openDrawer) setIsCartOpen(true);
      return;
    }

    const newItem = {
      productId: product.id,
      licenseId: targetLicenseId,
      title: product.title,
      slug: product.slug,
      price: license ? license.price : (product.price !== undefined ? product.price : (product.sale_price !== null ? product.sale_price : product.regular_price)),
      licenseName: license ? (license.license_name || license.name) : (product.license_name || 'Standard Commercial License'),
      thumbnail: product.thumbnail || product.image || (product.media && product.media[0] ? product.media[0].media_url : null)
    };

    setItems(prev => [...prev, newItem]);
    addToast(`Added "${product.title}" to your cart!`, 'success');
    if (openDrawer) setIsCartOpen(true);

    // Track Meta Pixel AddToCart event
    trackPixelEvent('AddToCart', {
      content_name: product.title,
      content_ids: [String(product.id)],
      content_type: 'product',
      value: Number(newItem.price) || 0,
      currency: 'USD'
    });
  };

  const removeFromCart = (productId, licenseId = null) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.licenseId === licenseId)));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    localStorage.removeItem('digitalstore_cart');
    localStorage.removeItem('digitalstore_coupon');
  };

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) return;
    const clean = code.trim().toUpperCase();
    setCouponCode(clean);
    localStorage.setItem('digitalstore_coupon', clean);
    addToast(`Coupon "${clean}" applied!`, 'success');
  };

  const removeCoupon = () => {
    setCouponCode('');
    localStorage.removeItem('digitalstore_coupon');
    addToast('Coupon removed', 'info');
  };

  const count = items.length;

  return (
    <CartContext.Provider value={{
      items,
      count,
      couponCode,
      cartTotals,
      isCartOpen,
      calculating,
      addToCart,
      removeFromCart,
      clearCart,
      applyCoupon,
      removeCoupon,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
