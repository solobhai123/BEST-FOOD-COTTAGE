import React, { useState, useEffect } from 'react';
import {
  Search,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChefHat,
  XCircle,
  Banknote,
  MapPin,
  Calendar,
  Loader2,
  PackageCheck,
  User as UserIcon,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Order } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface MyOrdersPageProps {
  initialOrderNumber?: string;
  initialPhone?: string;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({
  initialOrderNumber = '',
  initialPhone = '',
}) => {
  const { user, token, setIsAuthModalOpen, setAuthModalMode } = useAuth();

  // Mode: account orders vs guest lookup
  const [activeTab, setActiveTab] = useState<'account' | 'guest'>('account');

  // Account orders state
  const [accountOrders, setAccountOrders] = useState<Order[]>([]);
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Guest lookup state
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected order for detailed modal / view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch account orders when logged in
  useEffect(() => {
    if (user && token) {
      setIsAccountLoading(true);
      setAccountError(null);
      fetch('/api/auth/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Could not fetch account orders');
          return res.json();
        })
        .then((data) => {
          setAccountOrders(data.orders || []);
          if (data.orders && data.orders.length > 0 && !selectedOrder) {
            setSelectedOrder(data.orders[0]);
          }
        })
        .catch((err) => {
          setAccountError(err.message || 'Failed to load order history');
        })
        .finally(() => {
          setIsAccountLoading(false);
        });
    }
  }, [user, token]);

  // If initial order was provided, perform guest lookup or select it
  useEffect(() => {
    if (initialOrderNumber && initialPhone) {
      handleGuestLookup(undefined, initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone]);

  const handleGuestLookup = async (
    e?: React.FormEvent,
    customNum?: string,
    customPhone?: string
  ) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const lookupNum = (customNum || orderNumber).trim();
    const lookupPhone = (customPhone || phone).trim();

    if (!lookupNum || !lookupPhone) {
      setErrorMessage('Please enter both your Order Number and Contact Phone number.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: lookupNum,
          phone: lookupPhone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Order lookup failed.');
      }

      setSearchedOrder(data.order);
      setSelectedOrder(data.order);
    } catch (err: any) {
      setSearchedOrder(null);
      setErrorMessage(err.message || 'No matching order found.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStepIndex = (status: Order['order_status']) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Accepted':
        return 1;
      case 'Preparing':
        return 2;
      case 'Out for delivery':
        return 3;
      case 'Delivered':
        return 4;
      case 'Rejected':
        return -1;
      default:
        return 0;
    }
  };

  const statusSteps = [
    { label: 'Pending', icon: Clock, desc: 'Kitchen received' },
    { label: 'Accepted', icon: PackageCheck, desc: 'Order confirmed' },
    { label: 'Preparing', icon: ChefHat, desc: 'Hot in oven' },
    { label: 'Out for delivery', icon: Truck, desc: 'Rider dispatched' },
    { label: 'Delivered', icon: CheckCircle2, desc: 'Completed at doorstep' },
  ];

  const currentOrderToDisplay = selectedOrder || searchedOrder;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Title */}
      <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-stone-900 tracking-tight">
            Order History & Tracking
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            Live status from Khadim Ali Road kitchen to your doorstep in Sialkot.
          </p>
        </div>

        {/* Tab switcher: Account vs Guest */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'account'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            My Account Orders
          </button>
          <button
            onClick={() => setActiveTab('guest')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'guest'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Guest Lookup
          </button>
        </div>
      </div>

      {/* Account Orders Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {!user ? (
            /* Logged Out Prompt */
            <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-800 flex items-center justify-center mx-auto">
                <UserIcon className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="font-heading font-black text-xl text-stone-900">
                  Sign in to view your order history
                </h3>
                <p className="text-xs sm:text-sm text-stone-500">
                  Your orders are securely linked to your account. Sign in to see all past receipts, live progress, and re-order with 1 click.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  Sign In to Account
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-6 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs uppercase tracking-wider hover:bg-stone-50 transition-colors"
                >
                  Create New Account
                </button>
              </div>
            </div>
          ) : isAccountLoading ? (
            <div className="text-center py-12 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-red-800" />
              <span className="text-xs">Loading your order history...</span>
            </div>
          ) : accountOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-heading font-bold text-base text-stone-900">
                No orders found under this account yet
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Place your first pizza or zinger burger order with Cash on Delivery to see it tracked here!
              </p>
            </div>
          ) : (
            /* Orders List & Active Timeline Split */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Order Cards List */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500 pb-1">
                  <span className="font-bold uppercase tracking-wider text-stone-700">
                    Your Orders ({accountOrders.length})
                  </span>
                  <span>Click to view details</span>
                </div>

                {accountOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-red-50/50 border-red-700 shadow-xs ring-1 ring-red-700'
                          : 'bg-white border-stone-200/90 hover:border-stone-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div>
                          <span className="font-mono font-bold text-xs text-stone-900 block">
                            {ord.order_number}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {new Date(ord.created_at).toLocaleDateString('en-PK', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ord.order_status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.order_status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.order_status}
                        </span>
                      </div>

                      <div className="w-full flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                        <span className="text-stone-600 truncate max-w-44">
                          {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'} &bull;{' '}
                          {ord.delivery_zone_name ? ord.delivery_zone_name.split(':')[0] : 'Sialkot'}
                        </span>
                        <span className="font-heading font-black text-red-900 tabular-nums">
                          Rs. {ord.total.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Order Full View */}
              <div className="lg:col-span-7">
                {selectedOrder && (
                  <OrderDetailsCard
                    order={selectedOrder}
                    statusSteps={statusSteps}
                    getStatusStepIndex={getStatusStepIndex}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guest Lookup Tab */}
      {activeTab === 'guest' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-stone-500 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200/60">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Secure Verification:</strong> For customer privacy, an order number alone cannot access customer details. Please enter both your Order Number and matching Phone Number.
              </span>
            </div>

            <form onSubmit={handleGuestLookup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. BFC-2026-1001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Customer Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Lookup Single Order</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderNumber('BFC-2026-1001');
                    setPhone('03001234567');
                    handleGuestLookup(undefined, 'BFC-2026-1001', '03001234567');
                  }}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors"
                >
                  Test Demo Order (BFC-2026-1001)
                </button>
              </div>
            </form>
          </div>

          {searchedOrder && (
            <OrderDetailsCard
              order={searchedOrder}
              statusSteps={statusSteps}
              getStatusStepIndex={getStatusStepIndex}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Reusable Order Details Card
const OrderDetailsCard: React.FC<{
  order: Order;
  statusSteps: Array<{ label: string; icon: any; desc: string }>;
  getStatusStepIndex: (st: Order['order_status']) => number;
}> = ({ order, statusSteps, getStatusStepIndex }) => {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
              Order Number
            </span>
            <span className="font-mono font-bold text-lg text-white">
              {order.order_number}
            </span>
          </div>
          <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Placed on{' '}
              {new Date(order.created_at).toLocaleString('en-PK', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              order.order_status === 'Delivered'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : order.order_status === 'Rejected'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {order.order_status}
          </span>
        </div>
      </div>

      {/* Stepper Status Progression */}
      <div className="p-6 border-b border-stone-200 bg-stone-50/50">
        {order.order_status === 'Rejected' ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <span className="font-bold text-sm block">Order Cancelled or Rejected</span>
              <span>
                This order was declined by the restaurant or cancelled. Please call 0300-8114422 for assistance.
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {statusSteps.map((step, idx) => {
              const currentIdx = getStatusStepIndex(order.order_status);
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const Icon = step.icon;

              return (
                <div
                  key={step.label}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-red-50 border border-red-200 scale-102 shadow-xs'
                      : isCompleted
                      ? 'bg-stone-50 opacity-90'
                      : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                      isCompleted ? 'bg-red-800 text-white' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold text-xs text-stone-900">
                    {step.label}
                  </span>
                  <span className="text-[10px] text-stone-500 mt-0.5">{step.desc}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delivery details and Item list */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="space-y-3">
          <span className="font-heading font-bold text-stone-900 uppercase tracking-wider block">
            Delivery Address & Contact
          </span>
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 space-y-2">
            <div className="font-bold text-stone-900 text-sm">{order.customer_name}</div>
            <div className="flex items-start gap-2 text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-red-800 shrink-0 mt-0.5" />
              <span>{order.address}</span>
            </div>
            {order.delivery_zone_name && (
              <div className="text-[11px] text-emerald-800 font-semibold pl-5">
                Zone: {order.delivery_zone_name}
              </div>
            )}
            {order.landmark && (
              <div className="text-stone-500 pl-5">
                <strong>Landmark:</strong> {order.landmark}
              </div>
            )}
            <div className="pt-2 border-t border-stone-200 flex justify-between text-stone-700">
              <span>Payment:</span>
              <span className="font-bold text-emerald-800">{order.payment_method}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <span className="font-heading font-bold text-stone-900 uppercase tracking-wider block">
            Items ({order.items.length})
          </span>
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 space-y-2">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center text-stone-700">
                <span>
                  {it.quantity}x {it.item_name}
                </span>
                <span className="font-semibold tabular-nums">
                  Rs. {it.item_subtotal.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-stone-200 space-y-1 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="tabular-nums">Rs. {order.delivery_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-stone-200 text-stone-950">
                <span>Total Amount (COD)</span>
                <span className="font-heading font-black text-red-900 tabular-nums">
                  Rs. {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
