import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Monitor, Smartphone } from 'lucide-react';

/**
 * ScreenshotGallery — Business page hero gallery with download options
 * Displays Academy and Trading platform screenshots without BETA branding
 */

const GALLERY_ITEMS = [
  {
    id: 'academy',
    title: 'IINT Academy',
    subtitle: 'Interactive learning from Kindergarten to University',
    description: 'Structured curriculum with bot mentors, collectible notes, and gamified progression.',
    desktopImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&h=800&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=1200&fit=crop',
    features: ['Interactive Lessons', 'Bot Mentors', 'Achievement Badges', 'Progress Tracking'],
  },
  {
    id: 'trading',
    title: 'Trading Signals Platform',
    subtitle: 'AI-powered market intelligence and risk monitoring',
    description: 'Real-time signals, advanced analytics, and automated kill switches for risk management.',
    desktopImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=800&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=1200&fit=crop',
    features: ['Live Signals', 'Risk Analysis', 'Kill Switch', 'Market Data'],
  },
];

export default function ScreenshotGallery() {
  const [selectedView, setSelectedView] = useState('desktop');
  const [selectedItem, setSelectedItem] = useState(GALLERY_ITEMS[0].id);

  const currentItem = GALLERY_ITEMS.find(item => item.id === selectedItem);
  const currentImage = selectedView === 'desktop' ? currentItem.desktopImage : currentItem.mobileImage;

  const handleDownload = (id, view) => {
    const link = document.createElement('a');
    const imageSrc = GALLERY_ITEMS.find(item => item.id === id)[view === 'desktop' ? 'desktopImage' : 'mobileImage'];
    link.href = imageSrc;
    link.download = `iint-${id}-${view}.jpg`;
    link.click();
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-6 py-16">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-4xl font-black text-[#f1f5f9] mb-3">Platform Showcase</h2>
        <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
          Explore the full IINT experience across all devices. Download high-resolution screenshots for your marketing materials.
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-center gap-3">
        {[
          { id: 'desktop', label: 'Desktop', icon: Monitor },
          { id: 'mobile', label: 'Mobile', icon: Smartphone },
        ].map(view => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                selectedView === view.id
                  ? 'bg-[#00d4aa] text-[#070b14]'
                  : 'bg-[#111827] text-[#64748b] hover:text-[#f1f5f9]'
              }`}
            >
              <Icon size={16} /> {view.label}
            </button>
          );
        })}
      </div>

      {/* Main Gallery */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-3">
          {GALLERY_ITEMS.map(item => (
            <motion.button
              key={item.id}
              onClick={() => setSelectedItem(item.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedItem === item.id
                  ? 'border-[#00d4aa] bg-[#00d4aa]/5'
                  : 'border-[#1e293b] bg-[#111827] hover:border-[#1e293b]/60'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="font-bold text-[#f1f5f9]">{item.title}</p>
              <p className="text-xs text-[#64748b] mt-1">{item.subtitle}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {item.features.slice(0, 2).map((feature, idx) => (
                  <span key={idx} className="text-[9px] px-2 py-0.5 rounded bg-[#1e293b] text-[#94a3b8]">
                    {feature}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Main Preview + Download */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#1e293b] bg-[#111827]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedItem}-${selectedView}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={currentImage}
                  alt={currentItem.title}
                  className={selectedView === 'desktop' ? 'w-full h-auto' : 'w-full max-w-xs mx-auto h-auto'}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Description + Features + Download */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-[#f1f5f9] mb-2">{currentItem.title}</h3>
              <p className="text-sm text-[#94a3b8]">{currentItem.description}</p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-2">
              {currentItem.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
                  <span className="text-[#94a3b8]">{feature}</span>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleDownload(selectedItem, selectedView)}
                className="flex items-center gap-2 flex-1 py-3 rounded-lg bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-[#070b14] font-bold transition-colors active:scale-95"
              >
                <Download size={16} /> Download {selectedView === 'desktop' ? 'Desktop' : 'Mobile'}
              </button>
              <button
                onClick={() => handleDownload(selectedItem, selectedView === 'desktop' ? 'mobile' : 'desktop')}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[#1e293b] text-[#64748b] hover:text-[#f1f5f9] font-semibold transition-colors"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Callout */}
      <div className="grid md:grid-cols-3 gap-4 pt-8 border-t border-[#1e293b]">
        {[
          { label: 'High Resolution', desc: '1400x800px Desktop • 600x1200px Mobile' },
          { label: 'Brand Ready', desc: 'No watermarks • Clean branding • Professional styling' },
          { label: 'Multiple Formats', desc: 'JPG • PNG • Download instantly for any use' },
        ].map((item, idx) => (
          <div key={idx} className="text-center">
            <p className="font-bold text-[#f1f5f9] text-sm">{item.label}</p>
            <p className="text-xs text-[#64748b] mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}