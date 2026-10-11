import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    finalTotal,
    totalItems,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-800" />
              <h2 className="font-heading font-black text-lg text-stone-900">Your Food Basket</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 tabular-nums">
                {totalItems}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-stone-800 text-lg">Your cart is empty</h3>
                <p className="text-sm text-stone-500 max-w-xs mt-1">
                  Explore our oven-hot pizzas, zinger burgers, and special deals to get started.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-red-800 hover:bg-red-900 text-white font-semibold text-sm transition-colors"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-stone-50/70 border border-stone-200/80 rounded-2xl items-start"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-18 h-18 rounded-xl object-cover bg-stone-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-heading font-bold text-sm text-stone-900 truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-stone-500 mt-0.5">
                      Rs. {item.price.toLocaleString()} each
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:bg-stone-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-stone-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-stone-600 hover:bg-stone-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="font-heading font-black text-sm text-stone-950 tabular-nums">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50/80 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee (Sialkot City)</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    Rs. {deliveryFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm">
                  <span className="font-bold text-stone-900">Total (Cash on Delivery)</span>
                  <span className="font-heading font-black text-lg text-red-900 tabular-nums">
                    Rs. {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-center justify-between">
                <span>Payment Method</span>
                <span className="font-bold">Cash on Delivery only</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-red-800 hover:bg-red-900 active:scale-98 text-white font-bold rounded-xl shadow-md transition-all text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-stone-500 hover:text-stone-800 transition-colors py-1"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
