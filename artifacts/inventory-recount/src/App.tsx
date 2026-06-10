import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AppMode, AppState, AppStep, CountMode, ExcelData, ProductRow } from "./types";
import GradientBackground from "./components/GradientBackground";
import UploadPage from "./pages/UploadPage";
import ModeSelectPage from "./pages/ModeSelectPage";
import CategorySelectPage from "./pages/CategorySelectPage";
import CountingPage from "./pages/CountingPage";
import SwitchPromptPage from "./pages/SwitchPromptPage";
import ResultsPage from "./pages/ResultsPage";

const initialState: AppState = {
  step: "upload",
  storeAddress: "",
  excelData: null,
  mode: null,
  secondMode: null,
  countMode: "all",
  selectedCategories: [],
  firstPassCategories: [],
  secondPassCategories: [],
  products: [],
  doingSecondPass: false,
  firstPassDone: false,
  secondPassDone: false,
};



const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};
const transition = { duration: 0.35, ease: "easeInOut" as const };

export default function App() {
  const [state, setState] = useState<AppState>(initialState);

  const update = (patch: Partial<AppState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const onUploaded = (data: ExcelData) => {
    update({ excelData: data, products: data.products, storeAddress: data.storeAddress, step: "mode-select" });
  };

  const onModeSelect = (mode: AppMode) => {
    if (state.doingSecondPass) {
      update({ secondMode: mode, step: "category-select" });
    } else {
      update({ mode, step: "category-select" });
    }
  };

  const onCategorySelect = (countMode: CountMode, selectedCategories: string[]) => {
    if (state.doingSecondPass) {
      update({ countMode, selectedCategories, secondPassCategories: selectedCategories, step: "counting" });
    } else {
      update({ countMode, selectedCategories, firstPassCategories: selectedCategories, step: "counting" });
    }
  };

  const onCountingFinish = (updatedProducts: ProductRow[]) => {
    if (state.doingSecondPass) {
      update({ products: updatedProducts, secondPassDone: true, step: "results" });
    } else {
      update({ products: updatedProducts, firstPassDone: true, step: "switch-prompt" });
    }
  };

  const onSwitchMode = () => {
    update({
      doingSecondPass: true,
      step: "mode-select",
      selectedCategories: [],
      countMode: "all",
    });
  };

  const onGoToResults = () => update({ step: "results" });

  const onRestart = () => setState(initialState);

  const currentMode = state.doingSecondPass
    ? (state.secondMode ?? state.mode)
    : state.mode;

  const renderStep = () => {
    switch (state.step) {
      case "upload":
        return <UploadPage onUploaded={onUploaded} />;

      case "mode-select":
        return (
          <ModeSelectPage
            onSelect={onModeSelect}
            isSecondPass={state.doingSecondPass}
            firstMode={state.mode ?? undefined}
            storeAddress={state.storeAddress}
          />
        );

      case "category-select":
        return (
          <CategorySelectPage
            categories={state.excelData?.categories ?? []}
            categoryGroups={state.excelData?.categoryGroups ?? []}
            mode={currentMode ?? "warehouse"}
            storeAddress={state.storeAddress}
            isSecondPass={state.doingSecondPass}
            firstPassCategories={state.firstPassCategories}
            onSelect={onCategorySelect}
          />
        );

      case "counting":
        return (
          <CountingPage
            products={state.products}
            mode={currentMode ?? "warehouse"}
            selectedCategories={state.selectedCategories}
            storeAddress={state.storeAddress}
            onFinish={onCountingFinish}
          />
        );

      case "switch-prompt":
        return (
          <SwitchPromptPage
            currentMode={state.mode ?? "warehouse"}
            onSwitchMode={onSwitchMode}
            onGoToResults={onGoToResults}
            storeAddress={state.storeAddress}
          />
        );

      case "results": {
        const allSelected = Array.from(
          new Set([...state.firstPassCategories, ...state.secondPassCategories])
        );
        return (
          <ResultsPage
            products={state.products}
            selectedCategories={allSelected}
            storeAddress={state.storeAddress}
            onRestart={onRestart}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <GradientBackground>
      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="w-full"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </GradientBackground>
  );
}
