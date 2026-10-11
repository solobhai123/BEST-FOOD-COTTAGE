import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { SupabaseGuideModal } from './components/SupabaseGuideModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { DealsPage } from './pages/DealsPage.tsx';
import { ReviewsPage } from './pages/ReviewsPage.tsx';
import { MyOrdersPage } from './pages/MyOrdersPage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import {
  MenuItem,
  DealItem,
  MenuCategory,
  MENU_ITEMS,
  DEAL_ITEMS,
} from './data/menuData.ts';
import { Order, Review } from './types/index.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'All'>('All');

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSupabaseGuideOpen, setIsSupabaseGuideOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // App data state: separate pure menu items and deals
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [dealItems, setDealItems] = useState<DealItem[]>(DEAL_ITEMS);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    // 1. Fetch system status
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setIsSupabaseConfigured(Boolean(data.supabaseConfigured));
      })
      .catch((e) => console.warn('Status fetch error:', e));

    // 2. Fetch Menu items
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setMenuItems(data.items);
        }
      })
      .catch((e) => console.warn('Menu fetch error:', e));

    // 3. Fetch Deals items
    fetch('/api/deals')
      .then((res) => res.json())
      .then((data) => {
        if (data.deals && data.deals.length > 0) {
          setDealItems(data.deals);
        }
      })
      .catch((e) => console.warn('Deals fetch error:', e));

    // 4. Fetch Approved Reviews
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) {
          setReviews(data.reviews);
          setReviewCount(data.count || 0);
          setAverageRating(data.averageRating || 0);
        }
      })
      .catch((e) => console.warn('Reviews fetch error:', e));
  }, []);

  const handleNavigateTab = (tab: string, categoryFilter?: MenuCategory) => {
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    } else {
      setSelectedCategory('All');
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setIsSuccessOpen(true);
  };

  const handleTrackConfirmedOrder = (orderNum: string, phone: string) => {
    setIsSuccessOpen(false);
    setCurrentTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-stone-50 font-sans selection:bg-amber-200 selection:text-stone-900">
          {/* Navigation Bar */}
          <Navbar
            currentTab={currentTab}
            setCurrentTab={(tab) => handleNavigateTab(tab)}
            onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
          />

          {/* Main Content Pages */}
          <main className="flex-1">
            {currentTab === 'home' && (
              <HomePage
                menuItems={menuItems}
                dealItems={dealItems}
                reviews={reviews}
                averageRating={averageRating}
                reviewCount={reviewCount}
                onNavigateTab={handleNavigateTab}
              />
            )}

            {currentTab === 'menu' && (
              <MenuPage
                menuItems={menuItems}
                initialCategory={selectedCategory}
                onNavigateToDeals={() => handleNavigateTab('deals')}
              />
            )}

            {currentTab === 'deals' && <DealsPage dealItems={dealItems} />}

            {currentTab === 'reviews' && (
              <ReviewsPage
                reviews={reviews}
                averageRating={averageRating}
                reviewCount={reviewCount}
                onReviewSubmitted={() => {}}
              />
            )}

            {currentTab === 'orders' && (
              <MyOrdersPage
                initialOrderNumber={confirmedOrder ? confirmedOrder.order_number : ''}
                initialPhone={confirmedOrder ? confirmedOrder.phone : ''}
              />
            )}

            {currentTab === 'admin' && (
              <AdminDashboard
                onBackToStore={() => setCurrentTab('home')}
                onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
              />
            )}
          </main>

          {/* Global Footer */}
          <Footer
            onNav={(tab) => handleNavigateTab(tab)}
            onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
          />

          {/* Modals & Drawers */}
          <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onOrderSuccess={handleOrderSuccess}
          />

          <OrderSuccessModal
            order={confirmedOrder}
            onClose={() => setIsSuccessOpen(false)}
            onTrackOrder={handleTrackConfirmedOrder}
          />

          <SupabaseGuideModal
            isOpen={isSupabaseGuideOpen}
            onClose={() => setIsSupabaseGuideOpen(false)}
            isConfigured={isSupabaseConfigured}
          />

          <AuthModal />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
