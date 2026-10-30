import { useState, useEffect, useCallback } from 'react';
import { FIXO_PRODUCTS } from './data/fixoProducts';
import { FixoProduct } from './types/product';
import { HeartIsland3D } from './components/HeartIsland3D';
import { ProductModal } from './components/ProductModal';
import { Minimap } from './components/Minimap';
import { QuestTracker } from './components/QuestTracker';
import { QuickNav } from './components/QuickNav';
import { HeartDock } from './components/HeartDock';
import { VirtualJoystick } from './components/VirtualJoystick';
import { sound } from './utils/audio';
import { 
  Volume2, 
  VolumeX, 
  Menu, 
  HelpCircle, 
  Gamepad2, 
  Eye,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  Sparkles,
  Info
} from 'lucide-react';

const STORAGE_KEY = 'fixo_island_visited_v1';

export default function App() {
  const [visitedIds, setVisitedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  const [activeProduct, setActiveProduct] = useState<FixoProduct | null>(null);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [showJoystick, setShowJoystick] = useState(false);
  const [showWelcomeTip, setShowWelcomeTip] = useState(true);

  // Heart Island 3D Controls State
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night' | 'dawn'>('day');
  const [isBirdEye, setIsBirdEye] = useState(false);

  // Sean's 3D coordinates (Starts at Central Hub (0, 0))
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });
  const [joystickVector, setJoystickVector] = useState({ x: 0, y: 0 });
  const [teleportTarget, setTeleportTarget] = useState<{ x: number; z: number } | null>(null);

  // Auto detect touch device
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      setShowJoystick(true);
    }
  }, []);

  const handleVisited = useCallback((productId: string) => {
    setVisitedIds((prev) => {
      if (prev.has(productId)) return prev;
      const next = new Set(prev);
      next.add(productId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const handleTeleport = (product: FixoProduct) => {
    // Fly to that hex island
    setTeleportTarget({
      x: product.building.pos3D.x,
      z: product.building.pos3D.z + 2.8
    });
  };

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    sound.enabled = next;
    if (next) sound.playStep();
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#9fd8db] font-sans text-slate-800 select-none">
      {/* 1. Heart Island 3D Three.js Scene */}
      <HeartIsland3D
        products={FIXO_PRODUCTS}
        activeProduct={activeProduct}
        onOpenProduct={(p) => setActiveProduct(p)}
        playerPos={playerPos}
        setPlayerPos={setPlayerPos}
        joystickVector={joystickVector}
        teleportTarget={teleportTarget}
        clearTeleport={() => setTeleportTarget(null)}
        timeOfDay={timeOfDay}
        isBirdEye={isBirdEye}
      />

      {/* 2. Top Header Navigation Bar (Heart Island Warm Cream & Coral Styling) */}
      <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between gap-3 pointer-events-none z-30">
        {/* Brand Logo & Version */}
        <div className="flex items-center gap-3 bg-[#fff8f4]/90 backdrop-blur-md border border-[#c5b5a7]/60 px-4 py-2 rounded-full shadow-lg pointer-events-auto">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#db6a41] bg-white flex items-center justify-center shadow-sm">
            <img src="./sean.png" alt="Sean" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-[#211d1d]">
                FiXo 政策島
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#db6a41] text-white">
                HEART 3D
              </span>
            </div>
            <div className="text-[10px] text-[#78716c] font-medium hidden sm:block">
              Sean's Cloud Architecture Island
            </div>
          </div>
        </div>

        {/* Center: Quest Progress Tracker */}
        <div className="pointer-events-auto hidden md:block">
          <QuestTracker
            visitedCount={visitedIds.size}
            totalCount={FIXO_PRODUCTS.length}
          />
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Time of Day Buttons */}
          <div className="hidden lg:flex items-center bg-[#fff8f4]/90 backdrop-blur-md border border-[#c5b5a7]/60 rounded-full p-1 shadow-md gap-0.5">
            <button
              type="button"
              onClick={() => setTimeOfDay('dawn')}
              title="早晨"
              className={`p-1.5 rounded-full transition-all cursor-pointer ${timeOfDay === 'dawn' ? 'bg-[#db6a41] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Sunrise className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTimeOfDay('day')}
              title="白天"
              className={`p-1.5 rounded-full transition-all cursor-pointer ${timeOfDay === 'day' ? 'bg-[#db6a41] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTimeOfDay('sunset')}
              title="黃昏"
              className={`p-1.5 rounded-full transition-all cursor-pointer ${timeOfDay === 'sunset' ? 'bg-[#db6a41] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTimeOfDay('night')}
              title="夜晚"
              className={`p-1.5 rounded-full transition-all cursor-pointer ${timeOfDay === 'night' ? 'bg-[#db6a41] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bird's Eye View Toggle */}
          <button
            type="button"
            onClick={() => setIsBirdEye((prev) => !prev)}
            title={isBirdEye ? '返回 45° 視角' : '切換鳥瞰視角'}
            className={`flex items-center gap-1 px-3 py-2 rounded-full border shadow-md font-medium text-xs transition-colors cursor-pointer ${
              isBirdEye 
                ? 'bg-[#db6a41] text-white border-[#db6a41]' 
                : 'bg-[#fff8f4]/90 text-slate-700 border-[#c5b5a7]/60 hover:text-[#db6a41]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBirdEye ? '傾斜視角' : '鳥瞰'}</span>
          </button>

          {/* Quick Nav Button */}
          <button
            type="button"
            onClick={() => setIsQuickNavOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#db6a41] hover:bg-[#c55932] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">產品目錄</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isSoundOn ? '靜音' : '開啟音效'}
            className="p-2 rounded-full bg-[#fff8f4]/90 backdrop-blur-md border border-[#c5b5a7]/60 text-slate-700 hover:text-[#db6a41] transition-colors cursor-pointer shadow-md"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4 text-[#db6a41]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Joystick Toggle */}
          <button
            type="button"
            onClick={() => setShowJoystick((prev) => !prev)}
            aria-label="虛擬搖桿開關"
            className={`p-2 rounded-full backdrop-blur-md border transition-colors cursor-pointer shadow-md ${
              showJoystick
                ? 'bg-[#db6a41] text-white border-[#db6a41]'
                : 'bg-[#fff8f4]/90 border-[#c5b5a7]/60 text-slate-700 hover:text-[#db6a41]'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            aria-label="操作指引"
            className="p-2 rounded-full bg-[#fff8f4]/90 backdrop-blur-md border border-[#c5b5a7]/60 text-slate-700 hover:text-[#db6a41] transition-colors cursor-pointer shadow-md"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Quest Tracker */}
      <div className="absolute top-16 left-3 right-3 md:hidden pointer-events-auto z-20">
        <QuestTracker
          visitedCount={visitedIds.size}
          totalCount={FIXO_PRODUCTS.length}
        />
      </div>

      {/* 3. Mascot Pill (Heart Island signature mascot: •ᴗ• Sean · 點一格，開始探索) */}
      <div className="absolute bottom-20 left-4 z-20 pointer-events-auto hidden sm:flex items-center gap-2 bg-[#fff8f4]/90 backdrop-blur-md border border-[#c5b5a7]/60 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-medium text-slate-700">
        <span className="text-[#db6a41] font-bold text-sm">•ᴗ•</span>
        <span>Sean · 點擊六角島嶼或按 WASD 漫步</span>
      </div>

      {/* 4. Welcome / Gameplay Tip Banner */}
      {showWelcomeTip && (
        <aside aria-label="操作引導" className="absolute top-20 left-4 z-20 max-w-sm pointer-events-auto">
          <div className="bg-[#fff8f4]/95 backdrop-blur-md border-2 border-[#db6a41]/40 p-3.5 rounded-3xl shadow-2xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#db6a41] bg-white flex items-center justify-center shadow-sm">
              <img src="./sean.png" alt="Sean" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-slate-900 mb-0.5 flex items-center gap-1">
                <span>歡迎來到 FiXo 政策島！</span>
                <Sparkles className="w-3.5 h-3.5 text-[#db6a41]" />
              </div>
              <p className="text-slate-600 leading-relaxed">
                完全復刻 <strong>Heart Island</strong> 陽光六角蜂巢群島樣式！使用滑鼠點擊任意島嶼、或按 <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[#db6a41]">WASD</kbd> 控制 Sean 漫步，點擊下方快捷島嶼塢可直接飛往展館！
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWelcomeTip(false)}
              className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </aside>
      )}

      {/* 5. Bottom Controls: Dock, Joystick, Minimap */}
      {/* Bottom Dock (Heart Island signature dock) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <HeartDock
          products={FIXO_PRODUCTS}
          visitedIds={visitedIds}
          onSelect={handleTeleport}
        />
      </div>

      {/* Virtual Joystick (Bottom Left) */}
      {showJoystick && (
        <div className="absolute bottom-20 left-6 z-30 pointer-events-auto">
          <VirtualJoystick
            onMove={(x, y) => setJoystickVector({ x, y })}
            onStop={() => setJoystickVector({ x: 0, y: 0 })}
          />
        </div>
      )}

      {/* Minimap (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <Minimap
          products={FIXO_PRODUCTS}
          playerPos={playerPos}
          visitedIds={visitedIds}
          onTeleport={handleTeleport}
        />
      </div>

      {/* 6. Product Detail Modal */}
      <ProductModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onVisited={handleVisited}
      />

      {/* 7. Quick Navigation Drawer / Modal */}
      <QuickNav
        products={FIXO_PRODUCTS}
        visitedIds={visitedIds}
        onTeleport={handleTeleport}
        onOpenProduct={(p) => setActiveProduct(p)}
        isOpen={isQuickNavOpen}
        onClose={() => setIsQuickNavOpen(false)}
      />

      {/* 8. Help & Controls Modal */}
      {isHelpOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          onClick={() => setIsHelpOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-[#fff8f4] border border-[#c5b5a7] rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e7ded5]">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#db6a41]" />
                Heart Island 政策島 探索說明
              </h2>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-white border border-[#e7ded5] flex items-center gap-3">
                <img src="./sean.png" alt="Sean" className="w-12 h-12 object-contain bg-[#fff8f4] rounded-2xl border border-[#c5b5a7] p-1" />
                <div>
                  <div className="font-bold text-slate-900 mb-0.5">主角：Sean 探索員</div>
                  <div className="text-slate-600">在 11 座陽光六角島嶼與拱橋間穿梭，探索 FiXo 雲端全方位架構。</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#e7ded5]">
                <div className="font-bold text-slate-900 mb-1">🎮 操作方式</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li><strong className="text-slate-800">點擊島嶼</strong>：滑鼠直接點擊任意六角島嶼或橋樑，Sean 自動走向目標。</li>
                  <li><strong className="text-slate-800">鍵盤控制</strong>：WASD 或 方向鍵控制走動。</li>
                  <li><strong className="text-slate-800">視角旋轉</strong>：滑鼠按住右鍵拖曳可自由環繞旋轉 3D 沙盤，滾輪可放大縮小。</li>
                  <li><strong className="text-slate-800">底部快捷島塢</strong>：點選下方任一圖標，鏡頭將平滑滑向該產品展館。</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#db6a41] hover:bg-[#c55932] text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
            >
              開始探索！
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
