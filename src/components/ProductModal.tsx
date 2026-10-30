import React, { useEffect, useRef, useState } from 'react';
import { FixoProduct } from '../types/product';
import { X, ExternalLink, CheckCircle, ShieldCheck, Layers, BookOpen, Cpu, Sparkles } from 'lucide-react';

interface ProductModalProps {
  product: FixoProduct | null;
  onClose: () => void;
  onVisited?: (productId: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onVisited }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeTab, setActiveTab] = useState<'features' | 'manual' | 'specs'>('features');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (product) {
      if (!dialog.open) {
        dialog.showModal();
        if (onVisited) {
          onVisited(product.id);
        }
      }
      setActiveTab('features');
      setCopied(false);
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [product, onVisited]);

  // Graceful degradation for closedby="any" on browsers lacking native support
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const outside = (e: PointerEvent, d: HTMLDialogElement) => {
        const r = d.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };

      let pressedOutside = false;
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = outside(e, dialog);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && outside(e, dialog)) {
          dialog.close();
        }
      };

      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);

      return () => {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }
  }, []);

  const handleCopyChapter = () => {
    if (!product) return;
    navigator.clipboard.writeText(`${product.code} - ${product.name} (${product.manualSection})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!product) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="product-modal-title"
      className="m-auto p-0 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-slate-100 shadow-2xl backdrop-blur-xl w-[92vw] max-w-2xl max-h-[88vh] overflow-hidden transition-all duration-300"
    >
      {/* Decorative top glow bar */}
      <div 
        className="h-1.5 w-full transition-all duration-500"
        style={{ backgroundColor: product.color.primary, boxShadow: `0 0 15px ${product.color.primary}` }}
      />

      <div className="p-6 md:p-8 flex flex-col max-h-[calc(88vh-6px)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 shadow-lg"
              style={{ backgroundColor: `${product.color.primary}20`, border: `1px solid ${product.color.primary}50` }}
            >
              {product.building.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-slate-800 text-sky-400 border border-sky-400/30">
                  {product.chapter}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                  {product.category}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ color: product.color.primary }}>
                  ● {product.badge}
                </span>
              </div>
              <h2 id="product-modal-title" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {product.name}
              </h2>
            </div>
          </div>

          <form method="dialog">
            <button
              type="submit"
              autoFocus
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="關閉對話框"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Subtitle & Tagline */}
        <div className="mt-4 mb-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-medium text-sky-400">
            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center gap-1">
              📍 3D 展館：{product.building.name} ({product.building.hex.q}, {product.building.hex.r})
            </span>
          </div>
          <p className="text-sm md:text-base font-semibold text-slate-200 leading-relaxed">
            {product.subtitle}
          </p>
          <p className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            {product.description}
          </p>
        </div>

        {/* 3D Heart Island Story & Location */}
        {product.story3D && (
          <div className="mb-4 p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-2.5 text-xs text-sky-200">
            <span className="text-xl shrink-0">🏝️</span>
            <div>
              <div className="font-bold text-sky-300 mb-0.5 flex items-center gap-1.5">
                <span>3D 政策島（Heart Island）場景導覽</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                  高軟亞灣聚落
                </span>
              </div>
              <div className="leading-relaxed text-sky-200/90">{product.story3D}</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 text-sm font-medium transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'features' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            核心功能 ({product.features.length})
            {activeTab === 'features' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-3 text-sm font-medium transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manual' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            手冊導引
            {activeTab === 'manual' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-2.5 px-3 text-sm font-medium transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'specs' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            規格標準
            {activeTab === 'specs' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-slate-200">{feature.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-sky-400 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> 手冊對應章節
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyChapter}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? '已複製！' : '複製章節名稱'}
                  </button>
                </div>
                <div className="text-base font-semibold text-white font-mono">
                  {product.manualSection}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  出處：FiXo User Portal Manual v5.4.1.0 繁體中文使用者指南
                </p>
              </div>

              {product.highlights && product.highlights.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    原廠手冊關鍵實戰機制
                  </h4>
                  <ul className="text-xs text-amber-200/90 space-y-1.5 list-disc list-inside">
                    {product.highlights.map((h, i) => (
                      <li key={i} className="leading-relaxed">{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  手冊推薦最佳實踐
                </h4>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>建立生產資源前，請先確認所在之「可用區域（Region）」與安全權限設定。</li>
                  <li>配合 CAM 多因子認證 (MFA) 及最小權限原則進行存取授權。</li>
                  <li>針對核心服務定期執行備份與快照演練，降低非預期停機風險。</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {product.specs.map((spec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400 mb-1">{spec.label}</div>
                    <div className="text-sm font-bold text-white font-mono">{spec.value}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">架構相容性</div>
                  <div className="text-xs text-slate-400">FiXo 企業級高可用架構、支援混合雲多活拓樸</div>
                </div>
                <Layers className="w-6 h-6 text-slate-500" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 hidden sm:block">
            按鍵盤 <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">ESC</kbd> 關閉視窗
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <form method="dialog">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs md:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                關閉
              </button>
            </form>
            <button
              type="button"
              onClick={() => alert(`已為您記下 ${product.name}！歡迎於 FiXo 控制台申請開通試用。`)}
              className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>申請試用體驗</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
