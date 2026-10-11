import React from 'react';
import { CheckCircle2, Banknote, MapPin, Phone, ArrowRight, X } from 'lucide-react';
import { Order } from '../types/index.ts';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string, phone: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity" />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Celebration Banner */}
        <div className="bg-emerald-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
            <CheckCircle2 className="w-8 h-8 text-amber-300" />
          </div>

          <h2 className="font-heading font-black text-2xl tracking-tight">Order Confirmed!</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Best Food Cottage kitchen has received your order.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-5">
          {/* Order ID & COD Callout */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/90 text-center space-y-1">
            <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider block">
              Your Order Number
            </span>
            <div className="font-heading font-black text-2xl text-stone-950 tracking-wider">
              {order.order_number}
            </div>
            <div className="text-xs text-amber-900 font-bold flex items-center justify-center gap-1.5 pt-1">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Pay cash when your order arrives.</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-2 text-xs text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
            <div className="flex items-center gap-2 text-stone-800 font-semibold">
              <MapPin className="w-4 h-4 text-red-700 shrink-0" />
              <span>Delivery To: {order.customer_name}</span>
            </div>
            <div className="pl-6 text-stone-600">{order.address}</div>
            {order.landmark && (
              <div className="pl-6 text-stone-500 italic">Landmark: {order.landmark}</div>
            )}
            <div className="flex items-center gap-2 text-stone-600 pl-6 pt-1">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>Contact: {order.phone}</span>
            </div>
          </div>

          {/* Itemized Snapshot */}
          <div className="space-y-1.5 text-xs">
            <div className="font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-1">
              Items Ordered
            </div>
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center text-stone-600">
                <span>
                  {it.quantity}x {it.item_name}
                </span>
                <span className="font-semibold tabular-nums">
                  Rs. {it.item_subtotal.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-stone-500 pt-1">
              <span>Delivery Fee</span>
              <span className="tabular-nums">Rs. {order.delivery_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-stone-950 font-bold pt-2 border-t border-stone-200 text-sm">
              <span>Total Payable</span>
              <span className="font-heading font-black text-red-900 tabular-nums">
                Rs. {order.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onTrackOrder(order.order_number, order.phone)}
              className="flex-1 py-3 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
            <button
              onClick={onClose}
              className="py-3 px-5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors text-center"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
