import { motion } from "framer-motion";
import { Download, TrendingDown, TrendingUp, CheckCircle, RotateCcw } from "lucide-react";
import type { ProductRow } from "../types";
import { exportResults } from "../utils/exporter";
import StoreBadge from "../components/StoreBadge";

interface Props {
  products: ProductRow[];
  selectedCategories: string[];
  storeAddress: string;
  onRestart: () => void;
}

export default function ResultsPage({ products, selectedCategories, storeAddress, onRestart }: Props) {
  // Only include products from categories that were selected for recounting
  const inScope = selectedCategories.length > 0
    ? products.filter((p) => selectedCategories.includes(p.category))
    : products;

  const computed = inScope.map((p) => {
    const w = p.warehouseCount ?? 0;
    const s = p.showcaseCount ?? 0;
    const sum = w + s;
    const difference = sum - p.finalBalance;
    return { ...p, sum, difference };
  });

  const diffItems = computed.filter((p) => p.difference !== 0);
  const okItems = computed.filter((p) => p.difference === 0);
  const shortages = diffItems.filter((p) => p.difference < 0);
  const surpluses = diffItems.filter((p) => p.difference > 0);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 w-full max-w-3xl"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg mb-2">
          Результати перерахунку
        </h2>
        <StoreBadge address={storeAddress} />
        <div className="flex flex-wrap justify-center gap-4 mt-1">
          <div className="px-4 py-2 bg-white/15 rounded-2xl border border-white/30">
            <span className="text-white font-black text-lg">{diffItems.length}</span>
            <span className="text-white/70 font-bold text-sm ml-1">розбіжностей</span>
          </div>
          <div className="px-4 py-2 bg-green-500/20 rounded-2xl border border-green-300/30">
            <span className="text-green-300 font-black text-lg">{okItems.length}</span>
            <span className="text-white/70 font-bold text-sm ml-1">збігаються</span>
          </div>
        </div>
        {selectedCategories.length > 0 && (
          <p className="text-white/50 font-bold text-xs mt-3">
            Категорій у перерахунку: {selectedCategories.length}
          </p>
        )}
      </motion.div>

      <div className="w-full max-w-3xl space-y-4">
        {diffItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white/10 rounded-3xl border-2 border-white/30"
          >
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-white font-black text-2xl mb-2">Всі позиції збігаються!</p>
            <p className="text-white/60 font-bold">Розбіжностей між сумою та кінцевим залишком не виявлено</p>
          </motion.div>
        ) : (
          <>
            {/* Export button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => exportResults(computed)}
              className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl
                bg-white text-purple-700 font-black text-xl
                shadow-2xl hover:shadow-white/30 transition-all duration-300"
            >
              <Download className="w-6 h-6" />
              <span>Експорт результатів</span>
            </motion.button>

            {/* Column header */}
            <div className="grid grid-cols-[1fr_70px_70px_70px_80px] gap-2 px-4 py-2">
              <span className="text-white/50 font-bold text-xs uppercase tracking-wide">Назва</span>
              <span className="text-white/50 font-bold text-xs uppercase tracking-wide text-right">Залишок</span>
              <span className="text-white/50 font-bold text-xs uppercase tracking-wide text-right">Склад</span>
              <span className="text-white/50 font-bold text-xs uppercase tracking-wide text-right">Вітрина</span>
              <span className="text-white/50 font-bold text-xs uppercase tracking-wide text-right">Різниця</span>
            </div>

            {/* Shortages */}
            {shortages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-red-500/15 rounded-2xl border-2 border-red-300/30 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-red-300/20">
                  <TrendingDown className="w-5 h-5 text-red-300" />
                  <span className="text-red-300 font-black text-sm uppercase tracking-wide">
                    Нестача — {shortages.length} позицій
                  </span>
                </div>
                {shortages.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.03 }}
                    className="grid grid-cols-[1fr_70px_70px_70px_80px] gap-2 px-4 py-3 items-center
                      border-b border-red-300/10 last:border-0 hover:bg-red-500/10 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-white font-black text-sm truncate">{p.name}</div>
                      <div className="text-white/40 font-bold text-xs truncate">{p.category}</div>
                    </div>
                    <span className="text-white/70 font-bold text-sm text-right">{p.finalBalance}</span>
                    <span className="text-white/70 font-bold text-sm text-right">{p.warehouseCount ?? "—"}</span>
                    <span className="text-white/70 font-bold text-sm text-right">{p.showcaseCount ?? "—"}</span>
                    <span className="text-red-300 font-black text-sm text-right">{p.difference}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Surpluses */}
            {surpluses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-green-500/15 rounded-2xl border-2 border-green-300/30 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-green-300/20">
                  <TrendingUp className="w-5 h-5 text-green-300" />
                  <span className="text-green-300 font-black text-sm uppercase tracking-wide">
                    Надлишок — {surpluses.length} позицій
                  </span>
                </div>
                {surpluses.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.03 }}
                    className="grid grid-cols-[1fr_70px_70px_70px_80px] gap-2 px-4 py-3 items-center
                      border-b border-green-300/10 last:border-0 hover:bg-green-500/10 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-white font-black text-sm truncate">{p.name}</div>
                      <div className="text-white/40 font-bold text-xs truncate">{p.category}</div>
                    </div>
                    <span className="text-white/70 font-bold text-sm text-right">{p.finalBalance}</span>
                    <span className="text-white/70 font-bold text-sm text-right">{p.warehouseCount ?? "—"}</span>
                    <span className="text-white/70 font-bold text-sm text-right">{p.showcaseCount ?? "—"}</span>
                    <span className="text-green-300 font-black text-sm text-right">+{p.difference}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        {/* Restart */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl
            bg-white/10 border-2 border-white/30 hover:bg-white/20
            text-white font-black text-base transition-all duration-300"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Розпочати новий перерахунок</span>
        </motion.button>
      </div>
    </div>
  );
}
