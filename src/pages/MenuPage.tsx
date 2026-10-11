import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, CheckCircle, Sparkles, ArrowRight, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard.tsx';
import { MenuItem, MenuCategory, MENU_CATEGORIES } from '../data/menuData.ts';

interface MenuPageProps {
  menuItems: MenuItem[];
  initialCategory?: MenuCategory | 'All';
  onNavigateToDeals?: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  menuItems,
  initialCategory = 'All',
  onNavigateToDeals,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'All'>(
    initialCategory
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(query);
          const matchDesc = item.description?.toLowerCase().includes(query);
          const matchCat = item.category.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'featured') {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
        }
        return 0;
      });
  }, [menuItems, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-stone-200 pb-6">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-stone-900 tracking-tight">
          Official Menu — Best Food Cottage
        </h1>
        <p className="text-sm text-stone-600 mt-2 max-w-3xl">
          Crafted fresh on order at Khadim Ali Road, Sialkot. All single items, pizzas, burgers, shawarmas, wraps, and sides from the official menu poster.
        </p>

        {/* Banner routing user to Deals */}
        <div className="mt-4 p-4 bg-gradient-to-r from-red-900 to-stone-900 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-300 block">Looking for Value Combos & Pizza Deals?</span>
              <span className="text-stone-300">
                All combos, Student Deals (Rs. 400), Kids Corner, and Family Deals (Rs. 2,999) are located in our dedicated Deals section.
              </span>
            </div>
          </div>
          {onNavigateToDeals && (
            <button
              onClick={onNavigateToDeals}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <span>Explore Deals Section</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pizza, zinger, shawarma..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Tabs (Segmented control) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
            selectedCategory === 'All'
              ? 'bg-red-800 text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          All Items ({menuItems.length})
        </button>
        {MENU_CATEGORIES.map((cat) => {
          const count = menuItems.filter((i) => i.category === cat).length;
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

      {/* Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <p className="font-heading font-bold text-stone-800 text-lg">
            No menu items found
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search query or switching to another category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
