import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, CheckSquare, Square, ArrowRight, ListChecks, Search, X,
  ChevronDown, ChevronRight, RotateCcw, Layers
} from "lucide-react";
import type { CategoryGroup, CountMode } from "../types";
import StoreBadge from "../components/StoreBadge";

interface Props {
  categories: string[];
  categoryGroups: CategoryGroup[];
  mode: string;
  storeAddress: string;
  isSecondPass?: boolean;
  firstPassCategories: string[];
  onSelect: (countMode: CountMode, selectedCategories: string[]) => void;
}

export default function CategorySelectPage({
  categories,
  categoryGroups,
  mode,
  storeAddress,
  isSecondPass,
  firstPassCategories,
  onSelect,
}: Props) {
  const [countMode, setCountMode] = useState<CountMode | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Flat list of all leaf categories (those with products)
  // filtered by search
  const searchLower = search.trim().toLowerCase();

  // Expand the group if a search result is inside it
  const getExpandedForSearch = (groupName: string, children: string[]) => {
    if (!searchLower) return expandedGroups.has(groupName);
    return children.some((c) => c.toLowerCase().includes(searchLower));
  };

  // All leaf categories that match search
  const matchesSearch = (cat: string) =>
    !searchLower || cat.toLowerCase().includes(searchLower);

  // --- selection helpers ---

  const getGroupState = (children: string[]): "all" | "some" | "none" => {
    const selectedCount = children.filter((c) => selected.has(c)).length;
    if (selectedCount === children.length) return "all";
    if (selectedCount > 0) return "some";
    return "none";
  };

  const toggleLeaf = (cat: string) => {
    const next = new Set(selected);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setSelected(next);
  };

  const toggleGroup = (children: string[]) => {
    const state = getGroupState(children);
    const next = new Set(selected);
    if (state === "all") {
      children.forEach((c) => next.delete(c));
    } else {
      children.forEach((c) => next.add(c));
    }
    setSelected(next);
  };

  const toggleExpand = (groupName: string) => {
    const next = new Set(expandedGroups);
    if (next.has(groupName)) next.delete(groupName);
    else next.add(groupName);
    setExpandedGroups(next);
  };

  const handleProceed = () => {
    if (!countMode) return;
    if (countMode === "all") {
      onSelect("all", categories);
    } else {
      onSelect("selected", Array.from(selected));
    }
  };

  const handleContinuePrevious = () => {
    onSelect("selected", firstPassCategories);
  };

  const canProceed =
    countMode === "all" || (countMode === "selected" && selected.size > 0);

  const modeLabel = mode === "warehouse" ? "Складу" : "Вітрини";

  // Groups that have at least one matching child (or standalone leaves that match)
  const visibleGroups = categoryGroups.filter((g) => {
    if (g.name === "") {
      // ungrouped leaves
      return g.children.some(matchesSearch);
    }
    // group header: show if header matches OR any child matches
    return matchesSearch(g.name) || g.children.some(matchesSearch);
  });

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg mb-2">
          Перерахунок {modeLabel}
        </h2>
        <p className="text-white/75 font-bold text-lg">
          Оберіть категорії для перерахунку
        </p>
      </motion.div>

      <StoreBadge address={storeAddress} />

      <div className="w-full max-w-2xl space-y-4">

        {/* "Continue previous" button — only on second pass */}
        {isSecondPass && firstPassCategories.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinuePrevious}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border-2
              bg-white/20 border-white/60 hover:bg-white/30 hover:border-white
              transition-all duration-300 text-white font-black text-base"
          >
            <RotateCcw className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div>Продовжити перерахунок попередньої категорії</div>
              <div className="text-white/60 font-bold text-xs mt-0.5">
                {firstPassCategories.length > 3
                  ? `${firstPassCategories.slice(0, 3).join(", ")}… +${firstPassCategories.length - 3}`
                  : firstPassCategories.join(", ")}
              </div>
            </div>
          </motion.button>
        )}

        {/* Mode selection */}
        <div className="flex flex-col sm:flex-row gap-3">
          {[
            { key: "all" as CountMode, label: "Порахувати всі категорії", icon: ListChecks },
            { key: "selected" as CountMode, label: "Вибрати категорії", icon: Tag },
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCountMode(key)}
              className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 font-black text-base
                transition-all duration-300 cursor-pointer
                ${countMode === key
                  ? "bg-white text-purple-700 border-white shadow-lg"
                  : "bg-white/15 text-white border-white/40 hover:bg-white/25"
                }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>

        {/* Category tree with search */}
        <AnimatePresence>
          {countMode === "selected" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-white/10 rounded-2xl border-2 border-white/30 p-4 space-y-3">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Пошук категорії..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/15 border-2 border-white/30 rounded-xl
                      pl-9 pr-9 py-2.5 text-white font-bold text-sm placeholder-white/40
                      focus:outline-none focus:border-white focus:bg-white/25 transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Count label */}
                <p className="text-white/70 font-bold text-sm uppercase tracking-wide">
                  {search
                    ? `Знайдено: ${visibleGroups.reduce((acc, g) => acc + g.children.filter(matchesSearch).length + (g.name && matchesSearch(g.name) && g.children.length === 0 ? 1 : 0), 0)} · Вибрано: ${selected.size}`
                    : `Виберіть категорії (${selected.size}/${categories.length})`
                  }
                </p>

                {/* Category tree */}
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1 custom-scroll">
                  {visibleGroups.length === 0 ? (
                    <div className="text-center py-6 text-white/40 font-bold text-sm">
                      Нічого не знайдено
                    </div>
                  ) : (
                    visibleGroups.map((group) => {
                      // Standalone / ungrouped leaves
                      if (group.name === "") {
                        return group.children.filter(matchesSearch).map((cat) => (
                          <LeafRow
                            key={cat}
                            cat={cat}
                            selected={selected.has(cat)}
                            onToggle={() => toggleLeaf(cat)}
                            indent={false}
                          />
                        ));
                      }

                      const visibleChildren = group.children.filter(matchesSearch);
                      const groupState = getGroupState(group.children);
                      const isExpanded = getExpandedForSearch(group.name, group.children);
                      const hasChildren = group.children.length > 0;

                      return (
                        <div key={group.name}>
                          {/* Group header row */}
                          <div className="flex items-center gap-1">
                            {/* Expand/collapse toggle */}
                            {hasChildren && (
                              <button
                                onClick={() => toggleExpand(group.name)}
                                className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0"
                              >
                                {isExpanded
                                  ? <ChevronDown className="w-4 h-4" />
                                  : <ChevronRight className="w-4 h-4" />
                                }
                              </button>
                            )}
                            {/* Group checkbox + label */}
                            <motion.button
                              layout
                              whileTap={{ scale: 0.98 }}
                              onClick={() => hasChildren ? toggleGroup(group.children) : toggleLeaf(group.name)}
                              className={`flex-1 flex items-center gap-3 p-3 rounded-xl text-left
                                transition-all duration-200 cursor-pointer
                                ${groupState === "all"
                                  ? "bg-white/25 border-2 border-white/60"
                                  : groupState === "some"
                                    ? "bg-white/15 border-2 border-white/40"
                                    : "bg-white/5 border-2 border-transparent hover:bg-white/15"
                                }`}
                            >
                              {hasChildren ? (
                                <Layers className={`w-5 h-5 flex-shrink-0 ${
                                  groupState !== "none" ? "text-white" : "text-white/50"
                                }`} />
                              ) : groupState === "all" ? (
                                <CheckSquare className="w-5 h-5 text-white flex-shrink-0" />
                              ) : (
                                <Square className="w-5 h-5 text-white/50 flex-shrink-0" />
                              )}
                              <div>
                                <span className="text-white font-black text-sm">{group.name}</span>
                                {hasChildren && (
                                  <span className="text-white/50 font-bold text-xs ml-2">
                                    ({group.children.length} підкатегорій)
                                  </span>
                                )}
                              </div>
                            </motion.button>
                          </div>

                          {/* Children */}
                          <AnimatePresence>
                            {isExpanded && hasChildren && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden ml-7 mt-1 space-y-1"
                              >
                                {visibleChildren.map((cat) => (
                                  <LeafRow
                                    key={cat}
                                    cat={cat}
                                    selected={selected.has(cat)}
                                    onToggle={() => toggleLeaf(cat)}
                                    indent
                                  />
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Proceed button */}
        <AnimatePresence>
          {canProceed && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleProceed}
              className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl
                bg-white text-purple-700 font-black text-xl
                shadow-2xl hover:shadow-white/30 transition-all duration-300"
            >
              <span>Розпочати перерахунок</span>
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LeafRow({
  cat,
  selected,
  onToggle,
  indent,
}: {
  cat: string;
  selected: boolean;
  onToggle: () => void;
  indent: boolean;
}) {
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left
        transition-all duration-200 cursor-pointer
        ${indent ? "pl-3" : ""}
        ${selected
          ? "bg-white/25 border-2 border-white/60"
          : "bg-white/5 border-2 border-transparent hover:bg-white/15"
        }`}
    >
      {selected
        ? <CheckSquare className="w-5 h-5 text-white flex-shrink-0" />
        : <Square className="w-5 h-5 text-white/50 flex-shrink-0" />
      }
      <span className="text-white font-bold text-sm">{cat}</span>
    </motion.button>
  );
}
