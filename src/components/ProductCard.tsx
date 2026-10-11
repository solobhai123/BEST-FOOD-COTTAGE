import React, { useState } from 'react';
import { Plus, Check, ShieldCheck } from 'lucide-react';
import { MenuItem } from '../data/menuData.ts';
import { useCart } from '../context/CartContext.tsx';

interface ProductCardProps {
  item: MenuItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Size option selector if item has multiple sizes
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);

  const activePrice =
    item.sizeOptions && item.sizeOptions.length > 0
      ? item.sizeOptions[selectedSizeIndex].price
      : item.price;

  const activeSizeName =
    item.sizeOptions && item.sizeOptions.length > 0
      ? item.sizeOptions[selectedSizeIndex].size
      : item.size;

  const handleAdd = () => {
    const hasMultipleSizes = Boolean(item.sizeOptions && item.sizeOptions.length > 0);
    const cartItemId = hasMultipleSizes
      ? `${item.id}-${activeSizeName ? activeSizeName.replace(/\s+/g, '-').toLowerCase() : 'opt'}`
      : item.id;

    addToCart(
      {
        id: cartItemId,
        name: activeSizeName ? `${item.name} (${activeSizeName})` : item.name,
        price: activePrice,
        image: item.image,
        isAvailable: item.isAvailable,
        category: item.category,
        size: activeSizeName,
      },
      1
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden justify-between">
      <div>
        {/* Product Image Slot */}
        <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
          {!imageError ? (
            <img
              src={item.image}
              alt={item.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-stone-100 to-stone-200 text-stone-400">
              <span className="font-heading font-bold text-stone-700 text-center text-sm">
                {item.name}
              </span>
              <span className="text-xs text-stone-500 mt-1">{item.category}</span>
            </div>
          )}

          {/* Size or Active Tag */}
          {activeSizeName && (
            <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
              {activeSizeName}
            </div>
          )}

          {!item.isAvailable && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-red-800 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-lg tracking-wider">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-5 space-y-2">
          {/* Category & Poster Verified Badge */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-bold tracking-wide uppercase text-[11px] text-red-800">
              {item.category}
            </span>
            <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
              <Check className="w-3 h-3" /> Menu Poster Price
            </span>
          </div>

          {/* Title */}
          <h3 className="font-heading font-bold text-stone-900 text-base sm:text-lg leading-snug group-hover:text-red-800 transition-colors">
            {item.name}
          </h3>

          {/* Description from official poster */}
          {item.description && (
            <p className="text-stone-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Size Options Selector if available */}
          {item.sizeOptions && item.sizeOptions.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Select Size:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {item.sizeOptions.map((opt, i) => (
                  <button
                    key={opt.size}
                    type="button"
                    onClick={() => setSelectedSizeIndex(i)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-left flex justify-between items-center transition-all ${
                      selectedSizeIndex === i
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <span>{opt.size}</span>
                    <span className="tabular-nums font-bold">Rs. {opt.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price & Add to Cart */}
      <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 flex items-center justify-between gap-3 mt-3">
        <div>
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block">Price (COD)</span>
          <div className="font-heading font-black text-lg sm:text-xl text-stone-950 tabular-nums">
            Rs. {activePrice.toLocaleString()}
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!item.isAvailable}
          className={`flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-red-600 whitespace-nowrap ${
            !item.isAvailable
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : justAdded
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-red-800 hover:bg-red-900 text-white shadow-xs'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
