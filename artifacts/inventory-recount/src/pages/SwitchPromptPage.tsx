import { motion } from "framer-motion";
import { ArrowRightLeft, BarChart2 } from "lucide-react";
import type { AppMode } from "../types";
import StoreBadge from "../components/StoreBadge";

interface Props {
  currentMode: AppMode;
  onSwitchMode: () => void;
  onGoToResults: () => void;
  storeAddress: string;
}

export default function SwitchPromptPage({ currentMode, onSwitchMode, onGoToResults, storeAddress }: Props) {
  const nextModeLabel = currentMode === "warehouse" ? "вітрини" : "складу";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg mb-3">
          Що робимо далі?
        </h2>
        <p className="text-white/75 font-bold text-lg">
          Перерахунок завершено. Оберіть наступну дію.
        </p>
      </motion.div>

      <StoreBadge address={storeAddress} />

      <div className="flex flex-col gap-4 w-full max-w-md">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.03, x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSwitchMode}
          className="flex items-center gap-4 p-6 rounded-2xl
            bg-white/15 border-2 border-white/40 hover:bg-white/25 hover:border-white
            transition-all duration-300 text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <ArrowRightLeft className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-white font-black text-xl">
              Перейти до перерахунку {nextModeLabel}?
            </div>
            <div className="text-white/60 font-bold text-sm mt-0.5">
              Продовжити з іншим типом
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.03, x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={onGoToResults}
          className="flex items-center gap-4 p-6 rounded-2xl
            bg-white text-purple-700
            shadow-2xl hover:shadow-white/30 transition-all duration-300 text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-7 h-7 text-purple-700" />
          </div>
          <div>
            <div className="font-black text-xl">Переглянути результати</div>
            <div className="text-purple-500 font-bold text-sm mt-0.5">
              Показати різницю мінус/плюс
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
