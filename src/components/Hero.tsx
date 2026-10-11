import React from 'react';
import { ArrowRight, Sparkles, MapPin, ShieldCheck, Flame } from 'lucide-react';

interface HeroProps {
  onOrderNow: () => void;
  onExploreDeals: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOrderNow, onExploreDeals }) => {
  return (
    <section className="relative bg-stone-950 text-white overflow-hidden">
      {/* Background with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/bfc_hero_banner_1791725035415.jpg"
          alt="Best Food Cottage feast with pizza and zinger burgers"
          className="w-full h-full object-cover opacity-35 filter brightness-75 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-amber-300 text-xs font-semibold tracking-wide backdrop-blur-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Sialkot's Favorite Pizza & Zinger Joint</span>
            </div>

            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
              Crispy Zingers & Sizzling Loaded Pizzas
            </h1>

            <p className="text-stone-300 text-base sm:text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Freshly baked with 100% real dairy mozzarella, signature spiced chicken, and handcrafted artisan dough. Order direct to your doorstep on Khadim Ali Road and throughout Sialkot.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={onOrderNow}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-base shadow-lg shadow-red-900/30 transition-all hover:scale-102 active:scale-98 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>Order Now — Cash on Delivery</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>

              <button
                onClick={onExploreDeals}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700 font-semibold text-base transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>View Special Deals</span>
              </button>
            </div>

            {/* Trust and Location Indicators */}
            <div className="pt-6 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-300">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Khadim Ali Road (Near Mehtaab Garments)</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pay cash when your order arrives</span>
              </div>
            </div>
          </div>

          {/* Quick Highlight Feature Card */}
          <div className="lg:col-span-5">
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block">
                    Featured House Special
                  </span>
                  <h3 className="font-heading font-black text-xl text-white">Large Lasagna Pizza</h3>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 text-[11px] block">Confirmed Price</span>
                  <span className="text-xl font-heading font-black text-amber-400 tabular-nums">
                    Rs. 1,399
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4 bg-stone-800">
                <img
                  src="/src/assets/images/bfc_lasagna_pizza_1791725045735.jpg"
                  alt="Large Lasagna Pizza"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Layered with spiced chicken filling, creamy bechamel sauce, rich marinara, and melted mozzarella. Handcrafted hot on order.
              </p>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 bg-stone-800/80 rounded-xl border border-stone-700/50">
                  <span className="text-stone-400 block text-[10px]">2 Zingers + Drink</span>
                  <span className="font-bold text-white tabular-nums">Rs. 599</span>
                </div>
                <div className="p-2.5 bg-stone-800/80 rounded-xl border border-stone-700/50">
                  <span className="text-stone-400 block text-[10px]">Azadi Large Deal</span>
                  <span className="font-bold text-white tabular-nums">Rs. 1,099</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
