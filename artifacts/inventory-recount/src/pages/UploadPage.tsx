import { useRef, useState, DragEvent } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import type { ExcelData } from "../types";
import { parseExcel } from "../utils/excelParser";

interface Props {
  onUploaded: (data: ExcelData) => void;
}

export default function UploadPage({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|ods)$/i)) {
      setError("Будь ласка, завантажте файл у форматі .xlsx або .xls");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await parseExcel(file);
      onUploaded(data);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg tracking-tight mb-3">
          Авто Перерахунок
        </h1>
        <p className="text-white/80 text-lg md:text-xl font-bold">
          Завантажте Excel-таблицю для початку роботи
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-lg"
      >
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`
            relative cursor-pointer rounded-3xl border-4 border-dashed p-12 text-center
            transition-all duration-300
            ${dragging
              ? "border-white bg-white/30 scale-105"
              : "border-white/60 bg-white/10 hover:bg-white/20 hover:border-white"
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.ods"
            className="hidden"
            onChange={onInputChange}
          />

          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white font-bold text-lg">Читаємо файл...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <FileSpreadsheet className="w-16 h-16 text-white" strokeWidth={1.5} />
              </motion.div>
              <div>
                <p className="text-white font-black text-xl mb-1">
                  Перетягніть файл сюди
                </p>
                <p className="text-white/70 font-bold">
                  або натисніть для вибору
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-2xl">
                <Upload className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">.xlsx · .xls · .ods</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-3 bg-red-500/30 border-2 border-red-300/50 rounded-2xl p-4"
          >
            <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            <p className="text-white font-bold text-sm">{error}</p>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-center"
      >
        <p className="text-white/60 font-bold text-sm">
          Створено Князем Олександром для ТОВ "Торгіон"
        </p>
      </motion.div>
    </div>
  );
}
