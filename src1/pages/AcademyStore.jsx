import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ShoppingCart, ArrowLeft, Lock, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AcademyStoreCard from '@/components/academy/AcademyStoreCard';
import { MEMBERSHIPS, BOT_RENTALS, ACADEMY_ONLY_PRODUCTS } from '@/lib/storeProducts';
import SnackBarScene from '@/components/store/SnackBarScene';
import TipJar from '@/components/store/TipJar';
import SpecialsBoard from '@/components/store/SpecialsBoard';
import StoreSearchBar from '@/components/store/StoreSearchBar';
import StoreConfigModal from '@/components/store/StoreConfigModal';
import { getTodaysShifts, getShiftLabel, getGreeting, getQuestionResponse } from '@/lib/storeShifts';

const ACADEMY_PRODUCTS = [
  ...ACADEMY_ONLY_PRODUCTS,
  ...MEMBERSHIPS,
  ...BOT_RENTALS,
];

export default function AcademyStore() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState('all');
  const [progress, setProgress] = useState(null);
  const [storeConfig, setStoreConfig] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Snack bar scene state
  const [staff] = useState(() => getTodaysShifts());
  const [shiftLabel] = useState(() => getShiftLabel());
  const [dialogue, setDialogue] = useState(null);
  const [talkingIndex, setTalkingIndex] = useState(null);

  // Search / filter
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.id) {
        base44.entities.UserProgress.filter({ user_id: u.id }).then(([p]) => { if (p) setProgress(p); });
      }
    }).catch(() => setUser(null));

    // Load store config
    base44.entities.StoreConfig.filter({ config_key: 'main' }).then(([c]) => { if (c) setStoreConfig(c); });
  }, []);

  // When store loads, show a random greeting from the staff
  useEffect(() => {
    if (staff?.length) {
      const idx = Math.random() < 0.5 ? 0 : 1;
      setTalkingIndex(idx);
      setDialogue(getGreeting(staff[idx]?.archetype));
    }
  }, []);

  const handleQuestion = (question) => {
    const idx = Math.random() < 0.5 ? 0 : 1;
    const responder = staff[idx];
    setTalkingIndex(idx);
    setDialogue(getQuestionResponse(responder, question));
  };

  const dismissDialogue = () => {
    setTalkingIndex(null);
    setDialogue(null);
  };

  const companionStoreUnlocked = !!progress?.graduation_uni_complete;
  const isAdmin = user?.role === 'admin';

  const addToCart = (product) => setCart(prev => [...prev, product]);
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const filteredProducts = ACADEMY_PRODUCTS.filter(p => {
    const matchesFilter = filter === 'all' || p.type === filter;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070b14]" onClick={dialogue ? dismissDialogue : undefined}>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#070b14]/95 backdrop-blur-sm border-b border-[#1e293b]">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#64748b] hover:text-[#f1f5f9] transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Overhead menu board style title */}
          <div className="flex-1 text-center">
            <h1 className="text-base font-black text-[#f1f5f9] tracking-wide">IINT ACADEMY STORE</h1>
            <p className="text-[9px] text-[#475569] font-mono">Open 24/7 · Staff rotates every 8 hours</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button onClick={e => { e.stopPropagation(); setShowConfigModal(true); }}
                className="w-8 h-8 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:border-[#334155]"
                title="Store Config">
                <Settings size={13} className="text-[#475569]" />
              </button>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1e293b]">
              <ShoppingCart className="w-4 h-4 text-[#00d4aa]" />
              <span className="text-sm font-bold text-[#f1f5f9]">{cart.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-6 space-y-6">

        {/* ═══════════════════════════════════════════
            SNACK BAR SCENE — staff behind counter
            ═══════════════════════════════════════════ */}
        <div className="space-y-3">

          {/* Overhead menu board — specials sign sits above the scene */}
          <div className="flex justify-center">
            <SpecialsBoard specials={storeConfig?.specials} />
          </div>

          {/* The scene itself */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <SnackBarScene
              staff={staff}
              dialogue={dialogue}
              talkingIndex={talkingIndex}
              onDismiss={dismissDialogue}
              shiftLabel={shiftLabel}
            />

            {/* Tip jar sits on the counter — right side overlay */}
            <div className="absolute bottom-6 right-8">
              <TipJar config={storeConfig} />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            SEARCH BAR — question or product search
            ═══════════════════════════════════════════ */}
        <div onClick={e => e.stopPropagation()}>
          <StoreSearchBar
            onSearch={q => { setSearchQuery(q); setFilter('all'); }}
            onQuestion={handleQuestion}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" onClick={e => e.stopPropagation()}>
          {['all', 'course', 'membership', 'rental', 'resource'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === cat ? 'bg-[#00d4aa] text-[#070b14]' : 'bg-[#111827] text-[#64748b] hover:text-[#f1f5f9]'
              }`}
            >
              {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" onClick={e => e.stopPropagation()}>
          <AnimatePresence>
            {filteredProducts.map((product, idx) => (
              <AcademyStoreCard
                key={product.id}
                product={product}
                index={idx}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </AnimatePresence>
          {filteredProducts.length === 0 && searchQuery && (
            <div className="col-span-3 text-center py-12">
              <p className="text-[#475569] text-sm">No products matching "{searchQuery}"</p>
              <p className="text-[#334155] text-xs mt-1">Try asking a staff member a question instead — just type it in the search bar</p>
            </div>
          )}
        </div>

        {/* Companion Creator Store — blurred until University unlock */}
        <div className="relative rounded-3xl border border-[#1e293b] overflow-hidden" style={{ minHeight: 180 }}
          onClick={e => e.stopPropagation()}>
          <div className={`p-6 transition-all duration-500 ${companionStoreUnlocked ? '' : 'blur-sm select-none pointer-events-none'}`}
            style={{ opacity: companionStoreUnlocked ? 1 : 0.4 }}>
            <p className="text-xs font-bold text-[#00d4aa] mb-4 uppercase tracking-widest">🎨 Companion Creator — Save Packs & Slots</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '5 Saves + 1 Slot', price: '$4.99', badge: '' },
                { label: '15 Saves + 1 Slot', price: '$12.99', badge: '' },
                { label: '30 Saves + Bonus Slot', price: '$24.99', badge: 'BEST VALUE' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl border border-[#1e293b] bg-[#0a0f1e] text-center">
                  {item.badge && <span className="text-[8px] font-black px-2 py-0.5 rounded bg-[#00d4aa]/15 text-[#00d4aa] mb-2 block">{item.badge}</span>}
                  <p className="text-xs font-bold text-[#f1f5f9]">{item.label}</p>
                  <p className="text-lg font-black text-[#00d4aa] mt-1">{item.price}</p>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-[#334155] mt-3 text-center">Max 20 slots · Non-refundable · IINT faculty slots are permanent and separate</p>
          </div>
          {!companionStoreUnlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030508]/60 backdrop-blur-[2px] z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#1e293b] flex items-center justify-center mb-3">
                <Lock size={20} className="text-[#475569]" />
              </div>
              <p className="text-sm font-black text-[#f1f5f9]">Unlocks at University</p>
              <p className="text-[10px] text-[#475569] mt-1 text-center max-w-xs">Complete the University curriculum and your first free companion build to access Companion Creator pricing.</p>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-[#1e293b] p-5 z-50"
            onClick={e => e.stopPropagation()}>
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-xs text-[#64748b] mb-0.5">Cart Summary</p>
                <p className="text-xl font-black text-[#f1f5f9]">${cartTotal.toFixed(2)}</p>
              </div>
              <button
                className="px-6 py-2.5 bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-[#070b14] rounded-xl font-bold text-sm transition-colors"
                onClick={() => alert('Stripe checkout integration coming soon!')}
              >
                Proceed to Checkout →
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Admin Config Modal */}
      <StoreConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSaved={() => {
          base44.entities.StoreConfig.filter({ config_key: 'main' }).then(([c]) => { if (c) setStoreConfig(c); });
        }}
      />
    </div>
  );
}