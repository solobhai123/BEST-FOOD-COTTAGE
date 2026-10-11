import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNav: (tab: string) => void;
  onOpenSupabaseGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNav, onOpenSupabaseGuide }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/bfc_brand_logo_1791725023706.jpg"
                alt="Best Food Cottage"
                className="w-10 h-10 rounded-full object-cover border border-amber-400"
                referrerPolicy="no-referrer"
              />
              <span className="font-heading font-black text-white text-lg tracking-tight">
                BEST FOOD COTTAGE
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Serving Sialkot delicious handcrafted pizzas, crunchy zinger burgers, and authentic fast food combo deals since 2023.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cash on Delivery across Sialkot</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onNav('home')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('menu')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Full Menu & Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('deals')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Discounted Deals & Combos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('orders')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Track My Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNav('reviews')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Customer Reviews
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Location & Hours */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider">
              Location & Timings
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Khadim Ali Road, Opp. Classic School System, Sialkot, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Open Daily: 12:00 PM – 2:00 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>052-3574900 / 0311-0777181 | WA: 0329-2000505</span>
              </div>
            </div>
          </div>

          {/* Col 4: Supabase & Owner Portal */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider">
              Platform & Database
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Order processing verified server-side with atomic transactions and cash-on-delivery tracking.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenSupabaseGuide}
                className="w-full text-left px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors flex items-center justify-between"
              >
                <span>Supabase Configuration</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Ready</span>
              </button>
              <button
                onClick={() => onNav('admin')}
                className="w-full text-left px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors flex items-center justify-between"
              >
                <span>Owner Admin Portal Preview</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase">/admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            &copy; {new Date().getFullYear()} Best Food Cottage Sialkot. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Handcrafted with pride in Sialkot, Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
