import React, { useState } from 'react';
import { ShoppingBag, Menu, X, MapPin, Phone, Database, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSupabaseGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSupabaseGuide,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout, setIsAuthModalOpen, setAuthModalMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'deals', label: 'Deals' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'orders', label: 'My Orders' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Utility Bar with Real Location & Phone Notice */}
      <div className="bg-stone-900 text-stone-200 text-xs px-4 py-1.5 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Khadim Ali Road, Opp. Classic School System, Sialkot</span>
            </span>
            <span className="hidden md:inline text-stone-600">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-stone-300">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>0329-2000505 / 0311-0777181</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-400 font-medium">Delivery: Rs. 100 &bull; Cash on Delivery</span>
            <button
              onClick={() => setCurrentTab('admin')}
              className="text-stone-300 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors bg-stone-800/80 hover:bg-stone-800 px-2.5 py-1 rounded-md text-[11px] border border-stone-700"
              title="Open Owner Admin Panel"
            >
              <span>Admin Panel</span>
            </button>
            <button
              onClick={onOpenSupabaseGuide}
              className="text-stone-400 hover:text-white flex items-center gap-1 transition-colors"
              title="Supabase Database Configuration"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px]">Database Setup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Navigation (Three-Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 text-left shrink-0 group focus:outline-none"
          >
            <img
              src="/src/assets/images/bfc_brand_logo_1791725023706.jpg"
              alt="Best Food Cottage Logo"
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="font-heading font-black text-xl tracking-tight text-red-900 group-hover:text-red-700 transition-colors whitespace-nowrap">
                BEST FOOD COTTAGE
              </div>
              <div className="text-[11px] font-medium text-stone-500 tracking-wider uppercase -mt-1">
                Sialkot Fresh Kitchen
              </div>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-700">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  currentTab === link.id
                    ? 'text-red-800'
                    : 'text-stone-600 hover:text-red-800'
                }`}
              >
                {link.label}
                {currentTab === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action & User Account */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Customer Account Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-red-800 text-white flex items-center justify-center text-[10px] uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-24 truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 text-xs text-stone-700">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <div className="font-bold text-stone-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-stone-500 truncate">{user.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentTab('orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-50 transition-colors font-medium"
                    >
                      My Order History
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTab('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-50 transition-colors font-medium text-amber-800"
                    >
                      Admin Dashboard
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-700 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-700 hover:text-red-900 hover:bg-stone-100 font-semibold text-xs transition-colors whitespace-nowrap"
              >
                <UserIcon className="w-4 h-4 text-stone-500" />
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-xs transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-red-500 whitespace-nowrap"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline font-semibold">Cart</span>
              {totalItems > 0 && (
                <span className="bg-amber-400 text-red-950 text-xs font-black px-2 py-0.5 rounded-full tabular-nums">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {user ? (
            <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between mb-2">
              <div>
                <div className="font-bold text-xs text-stone-900">{user.name}</div>
                <div className="text-[11px] text-stone-500">{user.email}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-700 font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="w-full text-left px-4 py-2 rounded-lg bg-red-50 text-red-800 font-bold text-xs mb-2 flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In or Register</span>
            </button>
          )}

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${
                currentTab === link.id
                  ? 'bg-red-50 text-red-800'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>{link.label}</span>
              {currentTab === link.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-700" />
              )}
            </button>
          ))}

          <button
            onClick={() => {
              setCurrentTab('admin');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-50"
          >
            Owner Admin Portal Preview (/admin)
          </button>
        </div>
      )}
    </header>
  );
};
