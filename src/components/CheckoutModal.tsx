import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  FileText,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Banknote,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Order } from '../types/index.ts';
import { supabase } from '../supabase.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, clearCart } = useCart();
  const { user, token } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Standard flat delivery fee of 100 Rs as specified
  const deliveryFee = 100;
  const finalTotal = subtotal + deliveryFee;

  // Pre-fill user profile info if logged in
  useEffect(() => {
    if (user && isOpen) {
      if (!customerName) setCustomerName(user.name);
      if (!phone) setPhone(user.phone);
      if (user.default_address && !address) setAddress(user.default_address);
      if (user.default_landmark && !landmark) setLandmark(user.default_landmark);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items from the menu before checking out.');
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 letters).');
      return;
    }

    const cleanPhone = phone.trim();
    if (cleanPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g. 0300 1234567).');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage('Please provide your complete delivery address in Sialkot.');
      return;
    }

    setIsSubmitting(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // If Supabase client is directly configured in browser, we can also insert directly or sync via server API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: cleanPhone,
          address: address.trim(),
          landmark: landmark.trim(),
          notes: notes.trim(),
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          idempotencyKey: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to place order.');
      }

      // If client-side Supabase client is available, also ensure direct Supabase insert matches
      if (supabase && data.order) {
        try {
          const { error: sbOrderErr } = await supabase
            .from('orders')
            .upsert({
              id: data.order.id,
              order_number: data.order.order_number,
              customer_name: customerName.trim(),
              phone: cleanPhone,
              address: address.trim(),
              landmark: landmark.trim() || null,
              notes: notes.trim() || '',
              total: data.order.total || finalTotal,
              subtotal: data.order.subtotal || subtotal,
              delivery_fee: data.order.delivery_fee || deliveryFee,
              payment_method: 'Cash on Delivery',
              payment_status: 'Unpaid (COD)',
              order_status: 'Pending',
              user_id: user?.id || null,
            });

          if (!sbOrderErr) {
            const orderItemsPayload = items.map((item) => ({
              order_id: data.order.id,
              item_name: item.name,
              quantity: item.quantity,
              unit_price: item.price,
              item_subtotal: item.price * item.quantity,
            }));
            await supabase.from('order_items').insert(orderItemsPayload);
          }
        } catch (sbErr) {
          console.warn('[Supabase Client Sync] Notice:', sbErr);
        }
      }

      clearCart();
      onClose();
      onOrderSuccess(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to place order. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-red-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Banknote className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-heading font-black text-lg">Cash on Delivery Checkout</h2>
              <p className="text-xs text-red-200">
                Standard delivery fee: Rs. 100 &bull; Pay cash at your doorstep
              </p>
            </div>
          </div>
          <button
            onClick={() => !isSubmitting && onClose()}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-red-200 hover:text-white hover:bg-red-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {user && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Ordering as <strong>{user.name}</strong> ({user.phone})
              </span>
            </div>
          )}

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Muhammad Usman"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Mobile Number *</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Complete Delivery Address (Sialkot) *</span>
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Shop #, Street name, Mohallah or Sector, Sialkot"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none"
            />
          </div>

          {/* Optional Landmark & Optional Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nearby Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Mehtaab Garments / School"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>Special Instructions (Optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extra spicy, call before reaching"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {/* Order Summary Breakdown */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-stone-500 font-normal">({items.length} items)</span>
            </div>

            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-xs text-stone-600">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="truncate pr-2">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-semibold tabular-nums shrink-0">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-800 tabular-nums">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-stone-400" />
                  <span>Standard Delivery Fee</span>
                </span>
                <span className="font-semibold text-stone-800 tabular-nums">
                  Rs. {deliveryFee}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-stone-200 text-stone-900">
                <span>Total Payable on Delivery</span>
                <span className="font-heading font-black text-red-900 tabular-nums text-base">
                  Rs. {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* COD Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Payment Method: Cash on Delivery (COD)</span>
              <span className="text-amber-800">
                Pay Rs. {finalTotal.toLocaleString()} cash when your food arrives.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Confirm Order (Rs. {finalTotal.toLocaleString()})</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
