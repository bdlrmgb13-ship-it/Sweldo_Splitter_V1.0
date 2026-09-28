import React from 'react';
import { LayoutDashboard, CalendarDays, ReceiptText, Code2 } from 'lucide-react';

export type TabId = 'dashboard' | 'daily' | 'sublegends' | 'code';

interface M3NavigationBarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  unreadBillsCount?: number;
}

export const M3NavigationBar: React.FC<M3NavigationBarProps> = ({
  activeTab,
  onSelectTab,
  unreadBillsCount = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabId,
      label: 'Budget',
      icon: LayoutDashboard,
    },
    {
      id: 'daily' as TabId,
      label: 'Daily Grid',
      icon: CalendarDays,
    },
    {
      id: 'sublegends' as TabId,
      label: 'Sub-Legends',
      icon: ReceiptText,
      badge: unreadBillsCount > 0 ? unreadBillsCount : undefined,
    },
    {
      id: 'code' as TabId,
      label: 'Compose Code',
      icon: Code2,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation Bar"
      className="w-full shrink-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 z-30 transition-all select-none"
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center h-full group focus:outline-none transition-colors relative cursor-pointer"
            >
              {/* M3 Active Pill Indicator */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />

                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
