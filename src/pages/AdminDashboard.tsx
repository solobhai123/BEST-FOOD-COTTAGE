import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShoppingBag,
  Check,
  X,
  Clock,
  Star,
  RefreshCw,
  Database,
  Truck,
  ChefHat,
  PackageCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Save,
  MapPin,
  Plus,
  Trash2,
  Lock,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Order, Review, DeliveryZone } from '../types/index.ts';
import { MenuItem } from '../data/menuData.ts';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onOpenSupabaseGuide: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onOpenSupabaseGuide,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('bfc_admin_token'));
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'zones' | 'reviews' | 'menu'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle Admin Login submission
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      localStorage.setItem('bfc_admin_token', data.token);
      setIsAuthenticated(true);
      setLoginPassword('');
      fetchAdminData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check username and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('bfc_admin_token');
    setIsAuthenticated(false);
    setLoginUsername('');
    setLoginPassword('');
  };

  // Menu price editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);

  // New Zone Form
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDesc, setNewZoneDesc] = useState('');
  const [newZoneFee, setNewZoneFee] = useState(100);
  const [newZoneMinOrder, setNewZoneMinOrder] = useState(300);
  const [newZoneTime, setNewZoneTime] = useState('30-45 mins');
  const [newZoneKeywords, setNewZoneKeywords] = useState('');
  const [newZonePostcodes, setNewZonePostcodes] = useState('');
  const [showAddZoneForm, setShowAddZoneForm] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('bfc_admin_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [ordRes, revRes, menuRes, zoneRes] = await Promise.all([
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/reviews'),
        fetch('/api/menu'),
        fetch('/api/delivery-zones'),
      ]);

      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.orders || []);
      }
      if (revRes.ok) {
        const d = await revRes.json();
        setReviews(d.reviews || []);
      }
      if (menuRes.ok) {
        const d = await menuRes.json();
        setMenuItems(d.items || []);
      }
      if (zoneRes.ok) {
        const d = await zoneRes.json();
        setZones(d.zones || []);
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: Order['order_status'],
    paymentStatus?: Order['payment_status']
  ) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, paymentStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === orderId || ord.order_number === orderId
              ? {
                  ...ord,
                  order_status: newStatus,
                  payment_status: paymentStatus || ord.payment_status,
                }
              : ord
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleModerateReview = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Zone Management Handlers
  const handleToggleZone = async (zoneId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/delivery-zones/${zoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setZones((prev) =>
          prev.map((z) => (z.id === zoneId ? { ...z, isActive: !currentActive } : z))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateZoneFee = async (zoneId: string, newFee: number) => {
    try {
      const res = await fetch(`/api/admin/delivery-zones/${zoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryFee: newFee }),
      });
      if (res.ok) {
        setZones((prev) =>
          prev.map((z) => (z.id === zoneId ? { ...z, deliveryFee: newFee } : z))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this delivery zone?')) return;
    try {
      const res = await fetch(`/api/admin/delivery-zones/${zoneId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setZones((prev) => prev.filter((z) => z.id !== zoneId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;

    try {
      const res = await fetch('/api/admin/delivery-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newZoneName,
          description: newZoneDesc,
          deliveryFee: newZoneFee,
          minOrderAmount: newZoneMinOrder,
          estimatedMinutes: newZoneTime,
          keywords: newZoneKeywords.split(',').map((k) => k.trim()).filter(Boolean),
          postcodes: newZonePostcodes.split(',').map((p) => p.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setZones((prev) => [...prev, d.zone]);
        setShowAddZoneForm(false);
        setNewZoneName('');
        setNewZoneDesc('');
        setNewZoneKeywords('');
        setNewZonePostcodes('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const saveNewPrice = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              price: editPriceVal,
              priceStatus: 'confirmed',
              notes: 'Price confirmed by owner via dashboard.',
            }
          : item
      )
    );
    setEditingPriceId(null);
  };

  // If unauthenticated, show protected Admin Login Card (No credentials displayed publicly)
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
          {/* Header */}
          <div className="bg-stone-900 p-8 text-center text-white relative">
            <div className="w-16 h-16 rounded-2xl bg-red-800 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-md">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-black text-2xl text-white">Owner Portal Login</h2>
            <p className="text-xs text-stone-400 mt-1">
              Best Food Cottage &bull; Khadim Ali Road, Sialkot
            </p>
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-[11px] font-mono border border-stone-700">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Restricted Management Access</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="p-8 space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Admin Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-sm font-medium text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-sm font-medium text-stone-900 placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-red-800 hover:bg-red-700 disabled:bg-stone-300 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onBackToStore}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors"
              >
                &larr; Return to Customer Website
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-800 flex items-center justify-center text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl text-white">
                Best Food Cottage — Owner Portal
              </h1>
              <span className="bg-stone-800 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-md border border-stone-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Authenticated
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Live orders, configurable Sialkot delivery zones, menu calibration & review approvals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSupabaseGuide}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>Supabase Schema</span>
          </button>
          <button
            onClick={onBackToStore}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
          >
            Back to Website
          </button>
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-200 text-xs font-semibold border border-red-800/60 transition-colors"
            title="Sign out of Owner Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-red-800 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'zones'
              ? 'bg-red-800 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Delivery Zones ({zones.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'bg-red-800 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Review Moderation ({reviews.filter((r) => r.status === 'pending').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'menu'
              ? 'bg-red-800 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Menu & Pricing ({menuItems.length} items)
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-stone-900">Live Customer Orders</h2>
            <span className="text-xs text-stone-500">
              Update status in real time to reflect in customer tracking
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center text-stone-500 text-xs">
              No orders placed yet. Test by placing an order from the cart!
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base text-stone-900">
                          {ord.order_number}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            ord.order_status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.order_status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.order_status}
                        </span>
                        {ord.user_id && (
                          <span className="bg-stone-100 text-stone-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                            Registered Customer
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-1">
                        <strong>Customer:</strong> {ord.customer_name} ({ord.phone}) &bull;{' '}
                        <span>{ord.address}</span>
                      </div>
                      {ord.delivery_zone_name && (
                        <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                          <strong>Zone:</strong> {ord.delivery_zone_name} (Delivery: Rs. {ord.delivery_fee})
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="font-heading font-black text-lg text-red-900 tabular-nums">
                        Rs. {ord.total.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-stone-500">{ord.payment_status}</div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200/60 flex flex-wrap gap-4">
                    {ord.items.map((it, idx) => (
                      <span key={idx}>
                        <strong>{it.quantity}x</strong> {it.item_name} (Rs. {it.item_subtotal})
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                    <span className="text-stone-500 text-[11px] font-medium mr-1">
                      Change Status:
                    </span>
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'Accepted')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        ord.order_status === 'Accepted'
                          ? 'bg-blue-800 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'Preparing')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        ord.order_status === 'Preparing'
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      Preparing
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'Out for delivery')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        ord.order_status === 'Out for delivery'
                          ? 'bg-purple-800 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      Out for Delivery
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(ord.id, 'Delivered', 'Paid on Delivery')
                      }
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        ord.order_status === 'Delivered'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      Delivered (Mark Paid)
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'Rejected', 'Cancelled')}
                      className="px-3 py-1.5 rounded-lg font-medium bg-red-50 hover:bg-red-100 text-red-700 transition-colors ml-auto"
                    >
                      Reject Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Delivery Zones Management */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-stone-900">
                Configurable Sialkot Delivery Zones
              </h2>
              <p className="text-xs text-stone-500">
                Set up multiple areas by radius, landmarks or postcodes. Customers outside these zones are prompted to call the store directly.
              </p>
            </div>
            <button
              onClick={() => setShowAddZoneForm(!showAddZoneForm)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddZoneForm ? 'Cancel' : 'Add New Delivery Zone'}</span>
            </button>
          </div>

          {/* New Zone Form */}
          {showAddZoneForm && (
            <form
              onSubmit={handleCreateZone}
              className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-sm"
            >
              <h3 className="font-heading font-bold text-sm text-stone-900">
                Create New Delivery Area / Zone
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="e.g. Zone 4: Sambrial Suburbs (10-15 km)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Delivery Fee (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newZoneFee}
                    onChange={(e) => setNewZoneFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Min Order Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={newZoneMinOrder}
                    onChange={(e) => setNewZoneMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Estimated Delivery Time
                  </label>
                  <input
                    type="text"
                    value={newZoneTime}
                    onChange={(e) => setNewZoneTime(e.target.value)}
                    placeholder="e.g. 40-50 mins"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Postcodes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newZonePostcodes}
                    onChange={(e) => setNewZonePostcodes(e.target.value)}
                    placeholder="e.g. 51310, 51320"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Address Keywords / Areas (comma separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newZoneKeywords}
                    onChange={(e) => setNewZoneKeywords(e.target.value)}
                    placeholder="e.g. sambrial, dry port, airport road"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newZoneDesc}
                  onChange={(e) => setNewZoneDesc(e.target.value)}
                  placeholder="e.g. Extended zone across Sambrial corridor"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddZoneForm(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold"
                >
                  Save Zone
                </button>
              </div>
            </form>
          )}

          {/* Zones List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs space-y-4 flex flex-col justify-between ${
                  zone.isActive ? 'border-stone-200' : 'border-stone-300 opacity-60 bg-stone-50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-heading font-black text-base text-stone-900">
                      {zone.name}
                    </span>
                    <button
                      onClick={() => handleToggleZone(zone.id, zone.isActive)}
                      className="text-stone-400 hover:text-stone-700"
                      title={zone.isActive ? 'Disable Zone' : 'Enable Zone'}
                    >
                      {zone.isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-stone-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    {zone.description}
                  </p>

                  <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/60 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-600">Delivery Fee:</span>
                      <div className="flex items-center gap-1 font-bold text-red-900">
                        <span>Rs.</span>
                        <input
                          type="number"
                          value={zone.deliveryFee}
                          onChange={(e) => handleUpdateZoneFee(zone.id, Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 rounded border border-stone-300 text-xs text-right font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Min Order:</span>
                      <span className="font-semibold">Rs. {zone.minOrderAmount}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Est. Time:</span>
                      <span className="font-semibold">{zone.estimatedMinutes}</span>
                    </div>
                  </div>

                  {/* Areas / Keywords */}
                  <div className="mt-3 text-[11px] text-stone-500 space-y-1">
                    <span className="font-semibold text-stone-700 block">Matched Areas:</span>
                    <div className="flex flex-wrap gap-1">
                      {zone.keywords.slice(0, 6).map((kw, idx) => (
                        <span key={idx} className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                      {zone.keywords.length > 6 && (
                        <span className="text-stone-400">+{zone.keywords.length - 6} more</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      zone.isActive ? 'text-emerald-700' : 'text-stone-400'
                    }`}
                  >
                    {zone.isActive ? 'Active Zone' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleDeleteZone(zone.id)}
                    className="text-stone-400 hover:text-red-700 transition-colors p-1"
                    title="Delete Zone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-stone-900">
              Customer Reviews Moderation Queue
            </h2>
            <span className="text-xs text-stone-500">
              Only 'Approved' reviews appear on the customer facing page
            </span>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900 text-sm">{rev.reviewer_name}</span>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        rev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rev.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-stone-700 text-xs sm:text-sm italic">"{rev.comment}"</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => handleModerateReview(rev.id, 'approved')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}
                  {rev.status !== 'rejected' && (
                    <button
                      onClick={() => handleModerateReview(rev.id, 'rejected')}
                      className="px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Menu & Pricing */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-stone-900">
                Menu Items & Price Calibration
              </h2>
              <p className="text-xs text-stone-500">
                Modify prices or toggle availability. Confirmed prices are marked in green.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 uppercase font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price Status</th>
                    <th className="p-3.5">Price (PKR)</th>
                    <th className="p-3.5">Availability</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/50">
                      <td className="p-3.5 font-bold text-stone-900">
                        {item.name}
                        {item.size && (
                          <span className="text-[10px] text-stone-500 block font-normal">
                            {item.size}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-stone-600">{item.category}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.priceStatus === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.priceStatus === 'confirmed' ? 'Confirmed' : 'Pending Review'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-stone-900">
                        {editingPriceId === item.id ? (
                          <div className="flex items-center gap-1.5">
                            <span>Rs.</span>
                            <input
                              type="number"
                              value={editPriceVal}
                              onChange={(e) => setEditPriceVal(Number(e.target.value))}
                              className="w-20 px-2 py-1 rounded border border-red-600 text-xs"
                            />
                            <button
                              onClick={() => saveNewPrice(item.id)}
                              className="p-1 text-emerald-700 hover:text-emerald-900"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="p-1 text-stone-400 hover:text-stone-700"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Rs. {item.price.toLocaleString()}</span>
                            <button
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setEditPriceVal(item.price);
                              }}
                              className="text-stone-400 hover:text-red-700 p-0.5"
                              title="Edit Price"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => toggleAvailability(item.id)}
                          className={`flex items-center gap-1 font-medium ${
                            item.isAvailable ? 'text-emerald-700' : 'text-stone-400'
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-emerald-600" />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-stone-400" />
                              <span>Sold Out</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 text-right text-stone-500">
                        <span className="text-[11px]">{item.notes || 'Poster Item'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
