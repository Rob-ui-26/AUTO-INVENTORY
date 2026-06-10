import { useState } from "react";
import { motion } from "framer-motion";
import { Table2, ArrowRight, CheckCircle } from "lucide-react";
import type { RawExcelData } from "../types";

interface Props {
  rawData: RawExcelData;
  onConfirm: (balanceColIdx: number) => void;
}

export default function ColumnSelectPage({ rawData, onConfirm }: Props) {
  const { headers, detectedBalanceColIdx } = rawData;
  const [selected, setSelected] = useState<number>(detectedBalanceColIdx);

  // Only show columns that have a non-empty header name
  const namedHeaders = headers
    .map((h, i) => ({ label: h, idx: i }))
    .filter((h) => h.label.length > 0);

  const autoDetected = detectedBalanceColIdx >= 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Table2 className="w-8 h-8 text-white" strokeWidth={1.5} />
          <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
            Вибір колонки
          </h2>
        </div>
        <p className="text-white/75 font-bold text-lg">
          Вкажіть колонку <span className="text-white">"Кінцевий залишок"</span> з вашого файлу
        </p>
        {autoDetected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mt-3 px-4 py-2
              bg-green-500/25 border border-green-300/50 rounded-2xl"
          >
            <CheckCircle className="w-4 h-4 text-green-300" />
            <span className="text-green-200 font-bold text-sm">
              Колонка визначена автоматично
            </span>
          </motion.div>
        )}
      </motion.div>

      <div className="w-full max-w-lg space-y-2">
        {namedHeaders.map(({ label, idx }, i) => {
          const isSelected = selected === idx;
          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(idx)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl
                border-2 text-left transition-all duration-200 cursor-pointer
                ${isSelected
                  ? "bg-white text-purple-700 border-white shadow-xl"
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/60"
                }`}
            >
              {/* Column letter */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                font-black text-sm flex-shrink-0
                ${isSelected ? "bg-purple-100 text-purple-700" : "bg-white/20 text-white"}`}>
                {String.fromCharCode(65 + idx)}
              </div>

              {/* Label */}
              <span className="font-black text-base truncate flex-1">{label}</span>

              {/* Check indicator */}
              {isSelected && (
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 w-full max-w-lg"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onConfirm(selected)}
          disabled={selected < 0}
          className={`w-full flex items-center justify-center gap-3 p-5 rounded-2xl
            font-black text-xl transition-all duration-300
            ${selected >= 0
              ? "bg-white text-purple-700 shadow-2xl hover:shadow-white/30 cursor-pointer"
              : "bg-white/20 text-white/40 cursor-not-allowed"
            }`}
        >
          <span>Підтвердити вибір</span>
          <ArrowRight className="w-6 h-6" />
        </motion.button>
        {selected >= 0 && (
          <p className="text-center text-white/60 font-bold text-sm mt-3">
            Обрано: <span className="text-white">{headers[selected]}</span>
          </p>
        )}
      </motion.div>
    </div>
  );
}
