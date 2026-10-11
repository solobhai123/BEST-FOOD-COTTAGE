import React from 'react';
import {
  Flame,
  UtensilsCrossed,
  Truck,
  Banknote,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Sparkles,
  Gift,
  MessageCircle,
} from 'lucide-react';
import { Hero } from '../components/Hero.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { MenuItem, DealItem, MenuCategory } from '../data/menuData.ts';
import { Review } from '../types/index.ts';

interface HomePageProps {
  menuItems: MenuItem[];
  dealItems?: DealItem[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  onNavigateTab: (tab: string, categoryFilter?: MenuCategory) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  menuItems,
  dealItems = [],
  reviews,
  averageRating,
  reviewCount,
  onNavigateTab,
}) => {
  const featuredMenu = menuItems.filter((item) => item.isPopular).slice(0, 6);
  const featuredDeals = dealItems.filter((d) => d.isPopular).slice(0, 3);

  const topCategories: Array<{ name: MenuCategory; desc: string; icon: string }> = [
    { name: 'Signature Pizza', desc: 'Cottage Special, Malai & Lazania', icon: '🍕' },
    { name: 'Traditional Pizza', desc: 'Tikka, Fajita, BBQ & Supreme', icon: '🔥' },
    { name: 'Donner & Crust Pizza', desc: 'Crown Crust & Malai Donner', icon: '👑' },
    { name: 'Burgers', desc: 'Zingers, Patty & Double Decker', icon: '🍔' },
    { name: 'Shawarma & Wraps', desc: 'Crispy Wraps & Open Platters', icon: '🌯' },
    { name: 'Fries', desc: 'Loaded, Pizza & Peri Peri Fries', icon: '🍟' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <Hero
        onOrderNow={() => onNavigateTab('menu')}
        onExploreDeals={() => onNavigateTab('deals')}
      />

      {/* 2. Highlight Deals Row (Leading directly to Deals Section) */}
      {featuredDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-red-800 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Special Meal Bundles</span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
                Hot Value Deals & Combos
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('deals')}
              className="flex items-center gap-1.5 text-sm font-bold text-red-800 hover:text-red-950 transition-colors self-start md:self-auto group"
            >
              <span>View All Deals & Combos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-stone-100">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                      {deal.dealCategory}
                    </div>
                  </div>
                  <h3 className="font-heading font-black text-lg text-stone-900">{deal.name}</h3>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">{deal.description}</p>
                </div>
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-4">
                  <span className="font-heading font-black text-xl text-red-900 tabular-nums">
                    Rs. {deal.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onNavigateTab('deals')}
                    className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    View Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Popular Menu Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-red-800 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
              Best Selling Pizzas & Burgers
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('menu')}
            className="flex items-center gap-1.5 text-sm font-bold text-red-800 hover:text-red-950 transition-colors self-start md:self-auto group"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMenu.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 4. Food Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-red-800 uppercase tracking-wider block mb-1">
            Explore By Craving
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
            Browse Menu Categories
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Authentic recipes straight from our printed kitchen menu. Handcrafted daily in Sialkot.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {topCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onNavigateTab('menu', cat.name)}
              className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs hover:border-red-600 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div>
                <h3 className="font-heading font-bold text-stone-900 text-sm group-hover:text-red-800 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 5. "How to Order" Section */}
      <section className="bg-stone-100 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider block mb-1">
              Hassle-Free & Secure
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
              How Ordering Works with Cash on Delivery
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              No credit card, bank app, or upfront payment required. Simple 3-step doorstep delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-900 flex items-center justify-center font-heading font-black text-lg">
                1
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900">
                Pick Your Items or Deals
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Choose pizzas, zingers, platters or student combos and add them directly to your cart.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-heading font-black text-lg">
                2
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900">
                Enter Your Sialkot Address
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Provide your address. The system automatically calculates your zone's delivery fee.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-heading font-black text-lg">
                3
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900">
                Pay Cash on Delivery
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Our rider brings your food piping hot. Inspect your order and pay exact cash upon arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>Customer Ratings</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
              Loved by Diners in Sialkot
            </h2>

            <div className="flex items-center gap-3 mt-4 text-sm">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(averageRating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-600'
                    }`}
                  />
                ))}
              </div>
              <span className="font-heading font-bold text-lg text-white tabular-nums">
                {averageRating > 0 ? averageRating.toFixed(1) : '5.0'} / 5.0
              </span>
              <span className="text-stone-400 text-xs">
                ({reviewCount} approved customer reviews)
              </span>
            </div>

            {reviews.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.slice(0, 2).map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700/80 space-y-2 text-xs"
                  >
                    <p className="text-stone-200 italic leading-relaxed">"{rev.comment}"</p>
                    <div className="font-semibold text-amber-300">{rev.reviewer_name}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => onNavigateTab('reviews')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Read All Reviews & Write One
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Location & Visit Us Section (Updated with Poster Phone Numbers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
                Visit & Contact Us
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
                Best Food Cottage — Sialkot
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Located on Khadim Ali Road, Opp. Classic School System (near Mehtaab Garments), Sialkot. Order online for doorstep Cash on Delivery or call our hotlines directly.
              </p>

              <div className="space-y-2.5 text-xs text-stone-700 pt-2">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-red-800 shrink-0" />
                  <span className="font-medium">
                    Khadim Ali Road, Opp. Classic School System, Sialkot, Pakistan
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-red-800 shrink-0" />
                  <span className="font-medium">Open Daily: 12:00 PM – 2:00 AM Midnight</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-red-800 shrink-0" />
                  <span className="font-medium">Phones: 052-3574900 / 0311-0777181</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">WhatsApp Orders: 0329-2000505</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-stone-50 rounded-2xl p-6 border border-stone-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-800 text-white flex items-center justify-center mx-auto">
                <Banknote className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="font-heading font-bold text-stone-900 text-base">
                Ready for Fresh Pizza & Zingers?
              </h3>
              <p className="text-xs text-stone-600">
                Place your order in under 2 minutes and pay with Cash on Delivery at your doorstep.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigateTab('menu')}
                  className="flex-1 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  Order Menu
                </button>
                <button
                  onClick={() => onNavigateTab('deals')}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  View Deals
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
