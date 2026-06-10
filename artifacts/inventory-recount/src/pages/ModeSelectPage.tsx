import { motion } from "framer-motion";
import { Warehouse, ShoppingBag } from "lucide-react";
import type { AppMode } from "../types";
import StoreBadge from "../components/StoreBadge";

interface Props {
  onSelect: (mode: AppMode) => void;
  isSecondPass?: boolean;
  firstMode?: AppMode;
  storeAddress: string;
}

const modes: { key: AppMode; label: string; desc: string; icon: typeof Warehouse }[] = [
  { key: "warehouse", label: "Склад", desc: "Перерахунок товарів на складі", icon: Warehouse },
  { key: "showcase", label: "Вітрина", desc: "Перерахунок товарів на вітрині", icon: ShoppingBag },
];

export default function ModeSelectPage({ onSelect, isSecondPass, firstMode, storeAddress }: Props) {
  const available = isSecondPass
    ? modes.filter((m) => m.key !== firstMode)
    : modes;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg mb-2">
          {isSecondPass ? "Перейти до перерахунку" : "Що рахуємо?"}
        </h2>
        <p className="text-white/75 font-bold text-lg">
          {isSecondPass
            ? "Оберіть наступний тип для перерахунку"
            : "Оберіть тип перерахунку"}
        </p>
      </motion.div>

      <StoreBadge address={storeAddress} />

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {available.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.button
              key={m.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(m.key)}
              className="flex-1 flex flex-col items-center gap-4 p-8 rounded-3xl
                bg-white/15 border-2 border-white/40 hover:bg-white/25 hover:border-white
                transition-all duration-300 cursor-pointer group"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center
                group-hover:bg-white/30 transition-colors">
                <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">{m.label}</div>
                <div className="text-white/70 font-bold text-sm mt-1">{m.desc}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
