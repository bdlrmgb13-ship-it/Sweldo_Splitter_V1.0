import React from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isDeviceMode: boolean;
  onToggleDeviceMode: () => void;
  currentTimeString?: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isDeviceMode,
  onToggleDeviceMode,
  currentTimeString = '9:41',
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-0 md:p-6 transition-colors font-sans antialiased">
      {/* Top utility switcher bar */}
      <header className="w-full max-w-5xl mb-3 px-4 py-2 flex items-center justify-between border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400 text-sm tracking-tight">SweldoSplitter</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 hidden sm:inline">Jetpack Compose M3 Architecture</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleDeviceMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
            title="Toggle between Android Pixel frame and Full Responsive View"
          >
            {isDeviceMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Expand View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Pixel Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col ${
          isDeviceMode
            ? 'max-w-[420px] h-[880px] max-h-[96vh] rounded-[44px] shadow-2xl ring-12 ring-slate-800 border-4 border-slate-700/80 bg-slate-950 overflow-hidden'
            : 'max-w-4xl h-[92vh] rounded-2xl shadow-xl border border-slate-800 bg-slate-950 overflow-hidden'
        }`}
      >
        {/* Android Status Bar (Edge-to-Edge Top Inset) */}
        {isDeviceMode && (
          <div className="w-full h-8 px-6 pt-1 flex items-center justify-between text-[12px] font-semibold text-slate-300 select-none z-30 shrink-0 bg-slate-950">
            {/* Clock */}
            <span>{currentTimeString}</span>

            {/* Front Camera Punch-hole */}
            <div className="w-4 h-4 rounded-full bg-black ring-1 ring-slate-800 mx-auto"></div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Content Viewport with Scaffold Inset Protection */}
        <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Android System Gesture Bar (NavigationBarsPadding / Taskbar Inset) */}
        {isDeviceMode && (
          <div className="w-full h-5 shrink-0 bg-slate-950 flex items-center justify-center pointer-events-none select-none z-30">
            <div className="w-32 h-1 bg-slate-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};
