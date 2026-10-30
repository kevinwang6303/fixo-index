import { useState, useEffect, useCallback } from 'react';
import { FIXO_PRODUCTS } from './data/fixoProducts';
import { FixoProduct } from './types/product';
import { GameCanvas } from './components/GameCanvas';
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
  Info
} from 'lucide-react';

const STORAGE_KEY = 'fixo_island_visited_v1';
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1750;

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

  // Player position state for minimap & HUD (Spawn at Command Bridge)
  const [playerPos, setPlayerPos] = useState({ x: 1200, y: 830 });
  const [joystickVector, setJoystickVector] = useState({ x: 0, y: 0 });
  const [teleportTarget, setTeleportTarget] = useState<{ x: number; y: number } | null>(null);

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
    // Teleport slightly in front of the building
    setTeleportTarget({
      x: product.building.x,
      y: product.building.y + 60
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
      {/* 1. Main Interactive Game Canvas */}
      <GameCanvas
        products={FIXO_PRODUCTS}
        activeProduct={activeProduct}
        onOpenProduct={(p) => setActiveProduct(p)}
        playerPos={playerPos}
        setPlayerPos={setPlayerPos}
        joystickVector={joystickVector}
        teleportTarget={teleportTarget}
        clearTeleport={() => setTeleportTarget(null)}
      />

      {/* 2. Top Header Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between gap-3 pointer-events-none z-30">
        {/* Brand Logo & Version */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/70 px-3.5 py-2 rounded-2xl shadow-xl pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-lg shadow-md shadow-sky-500/20">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-white">FiXo 星際太空梭旗艦</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                v5.4.1.0
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">
              Foxconn Starship Flagship // Space Capsule Tour
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
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-2xl flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-bold text-white mb-0.5">歡迎登上 FiXo 星際太空梭！</div>
              <p className="text-slate-300 leading-relaxed">
                使用 <kbd className="px-1 rounded bg-slate-800 text-sky-400 font-mono">WASD</kbd> 噴射推進飛行，<strong className="text-sky-300">人物於零重力環境懸浮漂浮（腳完全不著地）</strong>。每個產品皆為獨立太空艙室，靠近按 <kbd className="px-1 rounded bg-slate-800 text-sky-400 font-mono">SPACE</kbd> 或點擊即可進入探索！
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
          playerPos={playerPos}
          visitedIds={visitedIds}
          onTeleport={handleTeleport}
          worldWidth={WORLD_WIDTH}
          worldHeight={WORLD_HEIGHT}
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
                探索指南與操作說明
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
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-white mb-1">🚀 零重力飛行方式</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong className="text-slate-200">鍵盤推進</strong>：方向鍵 或 W, A, S, D 鍵，噴射背包將點火推進。</li>
                  <li><strong className="text-slate-200">微重力姿態</strong>：人物腳完全懸空漂浮，放開按鍵具備真實微重力慣性滑行。</li>
                  <li><strong className="text-slate-200">滑鼠/點擊飛行</strong>：點擊星艦艙室或走廊任意處，太空人將自動噴射飛往目標。</li>
                  <li><strong className="text-slate-200">觸控搖桿</strong>：可點擊右上角搖桿按鈕開啟虛擬噴射搖桿。</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-white mb-1">🚪 進入太空艙探索產品</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>飛到各太空艙室周邊，按下 <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-sky-300">SPACE</kbd> 或 <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-sky-300">E</kbd> 鍵。</li>
                  <li>直接點擊該太空艙室氣閘門。</li>
                  <li>利用右下角「星艦全艦雷達」或右上角「產品目錄」一鍵傳送至目標艙室。</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-white mb-1">📖 內容依據</div>
                <p className="text-slate-400 leading-relaxed">
                  本星艦依據《FiXo User Portal Manual v5.4.1.0 繁體》架構規劃，每個太空艙室皆對應完整原廠產品功能手冊與 Markdown 靜態技術文檔。
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              我知道了，開始探索！
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
