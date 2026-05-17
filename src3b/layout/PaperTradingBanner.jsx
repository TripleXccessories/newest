import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function PaperTradingBanner() {
  return (
    <div className="bg-[#f59e0b]/10 border-b border-[#f59e0b]/30 px-4 py-2 flex items-center justify-center gap-2">
      <AlertTriangle size={14} className="text-[#f59e0b] flex-shrink-0" />
      <p className="text-xs font-medium text-[#f59e0b] text-center">
        <span className="font-bold">PAPER TRADING MODE</span>
        {' '}— No real money is at risk. Trade with your{' '}
        <span className="font-bold">$100,000 virtual balance.</span>
      </p>
    </div>
  );
}