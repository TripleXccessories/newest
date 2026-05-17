import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, RotateCcw } from 'lucide-react';

export default function AcademyStoreCard({ product, index, onAddToCart }) {
  const Icon = product.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 hover:border-[#1e293b]/60 transition-all group h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${product.color}20` }}>
            <Icon className="w-6 h-6" style={{ color: product.color }} />
          </div>
          <div>
            <h3 className="font-bold text-[#f1f5f9]">{product.title}</h3>
            <p className="text-xs text-[#64748b]">{product.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#94a3b8] mb-4 flex-1">{product.description}</p>

      {/* Content Details */}
      <div className="bg-[#0f172a] rounded-lg p-3 mb-4">
        <p className="text-xs text-[#64748b] mb-1">What's included:</p>
        <p className="text-sm text-[#f1f5f9]">{product.content}</p>
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black" style={{ color: product.color }}>
            ${product.price.toFixed(2)}
          </span>
          {product.billing && <span className="text-sm text-[#64748b]">{product.billing}</span>}
        </div>
        {product.renewable && (
          <div className="flex items-center gap-1 mt-2 text-xs text-[#00d4aa]">
            <RotateCcw className="w-3 h-3" />
            <span>Auto-renews {product.renewalPeriod}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onAddToCart}
        className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm text-[#070b14]"
        style={{
          background: product.color,
          boxShadow: `0 0 20px ${product.color}30`,
        }}
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>
    </motion.div>
  );
}