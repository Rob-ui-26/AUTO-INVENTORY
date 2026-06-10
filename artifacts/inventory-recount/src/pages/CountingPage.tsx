import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import type { ProductRow, AppMode } from "../types";
import StoreBadge from "../components/StoreBadge";

interface Props {
  products: ProductRow[];
  mode: AppMode;
  selectedCategories: string[];
  storeAddress: string;
  onFinish: (products: ProductRow[]) => void;
}

export default function CountingPage({ products, mode, selectedCategories, storeAddress, onFinish }: Props) {
  const [rows, setRows] = useState<ProductRow[]>(
    products.filter((p) => selectedCategories.includes(p.category))
  );
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(selectedCategories)
  );
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const modeLabel = mode === "warehouse" ? "Склад" : "Вітрина";

  const grouped = selectedCategories
    .filter((cat) => rows.some((r) => r.category === cat))
    .map((cat) => ({
      cat,
      items: rows.filter((r) => r.category === cat),
    }));

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleInput = useCallback(
    (id: number, value: string) => {
      const numVal = value === "" ? null : parseFloat(value.replace(",", "."));
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          if (mode === "warehouse") {
            return { ...r, warehouseCount: numVal };
          } else {
            return { ...r, showcaseCount: numVal };
          }
        })
      );
    },
    [mode]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const allIds = rows.map((r) => r.id);
      const idx = allIds.indexOf(id);
      if (idx >= 0 && idx < allIds.length - 1) {
        inputRefs.current.get(allIds[idx + 1])?.focus();
      }
    }
  };

  const getEnteredCount = (row: ProductRow) =>
    mode === "warehouse" ? row.warehouseCount : row.showcaseCount;

  const filled = rows.filter((r) => getEnteredCount(r) !== null).length;
  const total = rows.length;
  const progress = total > 0 ? (filled / total) * 100 : 0;

  const handleFinish = () => {
    const updated = products.map((p) => {
      const found = rows.find((r) => r.id === p.id);
      return found ?? p;
    });
    onFinish(updated);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-2 sm:px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mb-6"
      >
        <div className="text-center mb-3">
          <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">
            Перерахунок · {modeLabel}
          </h2>
          <p className="text-white/70 font-bold">
            Заповнено: {filled} / {total}
          </p>
        </div>
        <StoreBadge address={storeAddress} />
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Table area */}
      <div className="w-full max-w-3xl space-y-3 mb-6">
        {grouped.map(({ cat, items }, gi) => {
          const isExpanded = expandedCats.has(cat);
          const catFilled = items.filter((r) => getEnteredCount(r) !== null).length;

          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05 }}
              className="bg-white/10 rounded-2xl border-2 border-white/30 overflow-hidden"
            >
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {catFilled === items.length && (
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  )}
                  <span className="text-white font-black text-left truncate">{cat}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-white/60 font-bold text-sm whitespace-nowrap">
                    {catFilled}/{items.length}
                  </span>
                  {isExpanded
                    ? <ChevronUp className="w-5 h-5 text-white/70" />
                    : <ChevronDown className="w-5 h-5 text-white/70" />
                  }
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-[1fr_90px_90px] gap-2 px-4 pb-2 pt-1">
                      <span className="text-white/50 font-bold text-xs uppercase tracking-wide">Назва</span>
                      <span className="text-white/50 font-bold text-xs uppercase tracking-wide text-right">Кін. залишок</span>
                      <span className="text-white/50 font-bold text-xs uppercase tracking-wide text-center">{modeLabel}</span>
                    </div>

                    <div className="divide-y divide-white/10">
                      {items.map((row) => {
                        const entered = getEnteredCount(row);
                        return (
                          <div
                            key={row.id}
                            className="grid grid-cols-[1fr_90px_90px] gap-2 px-4 py-2.5 items-center hover:bg-white/5 transition-colors"
                          >
                            <span className="text-white font-bold text-sm truncate pr-2">{row.name}</span>
                            <span className="text-white/70 font-bold text-sm text-right">{row.finalBalance}</span>
                            <input
                              ref={(el) => {
                                if (el) inputRefs.current.set(row.id, el);
                              }}
                              type="number"
                              step="any"
                              placeholder="0"
                              value={entered ?? ""}
                              onChange={(e) => handleInput(row.id, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, row.id)}
                              className="w-full bg-white/20 border-2 border-white/40 rounded-xl px-2 py-1
                                text-white font-black text-sm text-center
                                focus:outline-none focus:border-white focus:bg-white/30
                                placeholder-white/30 transition-all"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Finish button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-3xl"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleFinish}
          className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl
            bg-white text-purple-700 font-black text-xl
            shadow-2xl hover:shadow-white/30 transition-all duration-300"
        >
          <span>Завершити перерахунок {modeLabel}</span>
          <ArrowRight className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </div>
  );
}
