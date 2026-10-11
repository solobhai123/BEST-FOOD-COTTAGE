import React, { useState, useMemo } from 'react';
import { Sparkles, Gift, Check, Plus, ShieldCheck, Users, GraduationCap, Baby, Pizza } from 'lucide-react';
import { DealItem, DealCategory, DEAL_CATEGORIES } from '../data/menuData.ts';
import { useCart } from '../context/CartContext.tsx';

interface DealsPageProps {
  dealItems: DealItem[];
}

export const DealsPage: React.FC<DealsPageProps> = ({ dealItems }) => {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<DealCategory | 'All'>('All');

  const filteredDeals = useMemo(() => {
    if (selectedCategory === 'All') return dealItems;
    return dealItems.filter((d) => d.dealCategory === selectedCategory);
  }, [dealItems, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Best Food Cottage Deals & Bundles</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            Special Deals & Family Combos
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            All promotional meal deals from our printed menu: Delicious Pizza Deals 1–6, Mega Family Deal (Rs. 2,999), Student Deals (Rs. 400), Kids Corner (Rs. 350), and Chef Platters. Delivered fresh with Cash on Delivery.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
            selectedCategory === 'All'
              ? 'bg-red-800 text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          All Deals ({dealItems.length})
        </button>
        {DEAL_CATEGORIES.map((cat) => {
          const count = dealItems.filter((d) => d.dealCategory === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Notice on Traditional Pizza in Deals */}
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2">
        <Pizza className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Menu Policy:</strong> Pizza Deals include your choice of Traditional Pizza flavors (Chicken Tikka, Chicken Fajita, BBQ, Supreme, etc.). Signature and Donner pizzas are not available in discount deals.
        </span>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDeals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Image banner */}
              <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 bg-amber-500 text-stone-950 text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-xs">
                  {deal.dealCategory}
                </div>
              </div>

              {/* Deal Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-heading font-black text-xl text-stone-900 leading-snug group-hover:text-red-800 transition-colors">
                    {deal.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                    {deal.description}
                  </p>
                </div>

                {/* Package Inclusions List */}
                {deal.dealIncludes && deal.dealIncludes.length > 0 && (
                  <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/70 space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                      Includes:
                    </span>
                    {deal.dealIncludes.map((inc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pt-0 border-t border-stone-100 flex items-center justify-between gap-4 mt-2">
              <div>
                <span className="text-[11px] text-stone-400 uppercase tracking-wider block">
                  Poster Price (COD)
                </span>
                <span className="font-heading font-black text-2xl text-red-900 tabular-nums">
                  Rs. {deal.price.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() =>
                  addToCart(
                    {
                      id: deal.id,
                      name: deal.name,
                      price: deal.price,
                      image: deal.image,
                      isAvailable: deal.isAvailable,
                      dealCategory: deal.dealCategory,
                    },
                    1
                  )
                }
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Deal</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
