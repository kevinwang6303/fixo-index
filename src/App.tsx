import { useState, useEffect, useCallback } from 'react';
import { FIXO_PRODUCTS } from './data/fixoProducts';
import { FixoProduct } from './types/product';
import { ThreeCanvas } from './components/ThreeCanvas';
import { ProductModal } from './components/ProductModal';
import { Minimap } from './components/Minimap';
import { QuestTracker } from './components/QuestTracker';
import { QuickNav } from './components/QuickNav';
import { VirtualJoystick } from './components/VirtualJoystick';
import { sound } from './utils/audio';
import { 
  Volume2, 
  VolumeX, 
  Menu, 
  HelpCircle, 
  Gamepad2, 
  Sparkles,
  Info,
  Box
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

  // 3D Player position state for minimap & HUD (Centered at origin)
  const [playerPos3D, setPlayerPos3D] = useState({ x: 0, z: 0 });
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
    // Teleport slightly in front of the 3D pavilion entrance
    setTeleportTarget({
      x: product.building.pos3D.x,
      z: product.building.pos3D.z + 4.5
    });
  };

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    sound.enabled = next;
    if (next) sound.playStep();
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 1. Main 3D WebGL Three.js Scene */}
      <ThreeCanvas
        products={FIXO_PRODUCTS}
        activeProduct={activeProduct}
        onOpenProduct={(p) => setActiveProduct(p)}
        playerPos3D={playerPos3D}
        setPlayerPos3D={setPlayerPos3D}
        joystickVector={joystickVector}
        teleportTarget={teleportTarget}
        clearTeleport={() => setTeleportTarget(null)}
      />

      {/* 2. Top Header Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between gap-3 pointer-events-none z-30">
        {/* Brand Logo & Version */}
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-xl pointer-events-auto">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-amber-400/50 bg-gradient-to-tr from-amber-500/20 to-sky-500/20 flex items-center justify-center shadow-md">
            <img src="./sean.png" alt="Sean" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-white">FiXo 雲端探索之島</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Box className="w-3 h-3" />
                3D 版
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">
              Sean's Foxconn FiXo 3D Interactive Tour
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
          {/* Quick Nav Button */}
          <button
            type="button"
            onClick={() => setIsQuickNavOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">產品目錄</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isSoundOn ? '靜音' : '開啟音效'}
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isSoundOn ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Joystick Toggle */}
          <button
            type="button"
            onClick={() => setShowJoystick((prev) => !prev)}
            aria-label="虛擬搖桿開關"
            className={`p-2 rounded-xl backdrop-blur-md border transition-colors cursor-pointer ${
              showJoystick
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                : 'bg-slate-900/80 border-slate-700/70 text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            aria-label="操作指引"
            className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Mobile Quest Tracker (Shown below header on mobile) */}
      <div className="absolute top-16 left-3 right-3 md:hidden pointer-events-auto z-20">
        <QuestTracker
          visitedCount={visitedIds.size}
          totalCount={FIXO_PRODUCTS.length}
        />
      </div>

      {/* 3. Welcome / Gameplay Tip Banner */}
      {showWelcomeTip && (
        <aside aria-label="操作引導" className="absolute bottom-4 left-4 z-20 max-w-sm pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3.5 rounded-2xl shadow-2xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-amber-400/50 bg-slate-800 flex items-center justify-center">
              <img src="./sean.png" alt="Sean" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-white mb-0.5 flex items-center gap-1.5">
                <span>Sean 的 3D 浮空島冒險！</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-slate-300 leading-relaxed">
                操控 Sean 使用 <kbd className="px-1 rounded bg-slate-800 text-sky-400 font-mono">WASD</kbd> 或方向鍵在 3D 島嶼漫遊，亦可<strong className="text-sky-300">點擊 3D 地面</strong>移動。靠近展館按 <kbd className="px-1 rounded bg-slate-800 text-sky-400 font-mono">SPACE</kbd> 查看產品！
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWelcomeTip(false)}
              className="text-slate-500 hover:text-slate-300 text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </aside>
      )}

      {/* 4. Bottom Controls */}
      {/* Virtual Joystick (Bottom Left) */}
      {showJoystick && (
        <div className="absolute bottom-6 left-6 z-30 pointer-events-auto">
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
          playerPos={playerPos3D}
          visitedIds={visitedIds}
          onTeleport={handleTeleport}
        />
      </div>

      {/* 5. Product Detail Modal */}
      <ProductModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onVisited={handleVisited}
      />

      {/* 6. Quick Navigation Drawer / Modal */}
      <QuickNav
        products={FIXO_PRODUCTS}
        visitedIds={visitedIds}
        onTeleport={handleTeleport}
        onOpenProduct={(p) => setActiveProduct(p)}
        isOpen={isQuickNavOpen}
        onClose={() => setIsQuickNavOpen(false)}
      />

      {/* 7. Help & Controls Modal */}
      {isHelpOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={() => setIsHelpOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400" />
                3D 浮空島操作指南
              </h2>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <img src="./sean.png" alt="Sean" className="w-12 h-12 object-contain bg-slate-900 rounded-xl border border-slate-700 p-1" />
                <div>
                  <div className="font-bold text-white mb-0.5">主角：Sean 探索員</div>
                  <div className="text-slate-400">穿梭於 FiXo 雲端 10 大核心產品設施，支援 3D 陰影、步態傾斜與自動朝向。</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-white mb-1">🎮 3D 移動方式</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong className="text-slate-200">鍵盤</strong>：方向鍵 或 W, A, S, D 鍵。</li>
                  <li><strong className="text-slate-200">滑鼠/點擊</strong>：點擊 3D 地面任意處，Sean 將自動走向目標點。</li>
                  <li><strong className="text-slate-200">觸控搖桿</strong>：點擊右上角搖桿按鈕開啟虛擬搖桿。</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-white mb-1">🔍 互動與查看產品</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>走近 3D 展館光圈，按 <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-sky-300">SPACE</kbd> 或 <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-sky-300">E</kbd> 鍵。</li>
                  <li>直接用滑鼠點擊 3D 建築本體。</li>
                  <li>利用右下角「全島 3D 雷達」或右上角「產品目錄」一鍵傳送。</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              開始 3D 探索！
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
