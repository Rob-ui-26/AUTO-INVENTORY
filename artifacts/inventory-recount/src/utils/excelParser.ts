import * as XLSX from "xlsx";
import type { CategoryGroup, ExcelData, ProductRow } from "../types";

const COL_NAME = 0;      // Column A — product name
const COL_BALANCE = 6;   // Column G — "Кінцевий залишок"

const KNOWN_CATEGORIES = [
  "Вивели Сигарети і Алкоголь Торгіон",
  "ВАТНІ ТА ПАПЕРОВІ вироби",
  "Яйця",
  "* Тимчасові Кондитерка",
  "Батончики",
  "ШОКОЛАД",
  "Дріжджі, Закуска",
  "Масло, Маргарин",
  "Сир плавлений та намазки",
  "Сир фасований",
  "КАВА",
  "ОВОЧІ-ФРУКТИ ТОРГІОН",
  "* Тимчасові Спиртні напої",
  "Вино",
  "Горілка",
  "Елітний алкоголь",
  "Коньяк, бренді, віскі",
  "Пиво",
];

function norm(t: unknown): string {
  if (t == null) return "";
  return String(t).trim();
}

function parseNum(s: string): number {
  const n = parseFloat(s.replace(",", ".").replace(/\s/g, ""));
  return isNaN(n) ? 0 : n;
}

function isCategoryRow(value: string): string | null {
  const lower = value.toLowerCase();
  for (const cat of KNOWN_CATEGORIES) {
    if (lower === cat.toLowerCase()) return cat;
  }
  if (
    value.length > 2 &&
    (value === value.toUpperCase() || value.startsWith("*") || value.startsWith("."))
  ) {
    return value;
  }
  return null;
}

function extractStoreAddress(rows: unknown[][]): string {
  const pattern = /Склад\s+Дорівнює\s+"([^"]+)"/i;
  for (const row of rows) {
    for (const cell of row as unknown[]) {
      const text = norm(cell);
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
  }
  return "";
}

/**
 * Build category groups from the ordered list of categories and their product counts.
 * Categories with 0 direct products are "group headers" — their children are all
 * subsequent categories (with products) up to the next group header.
 */
function buildCategoryGroups(
  categoryOrder: string[],
  categoryProductCount: Record<string, number>
): CategoryGroup[] {
  const groups: CategoryGroup[] = [];
  let currentGroup: CategoryGroup | null = null;

  for (const cat of categoryOrder) {
    if (categoryProductCount[cat] === 0) {
      // This category has no direct products — it's a group header
      if (currentGroup) groups.push(currentGroup);
      currentGroup = { name: cat, children: [] };
    } else {
      // This category has products — it's a leaf
      if (currentGroup) {
        currentGroup.children.push(cat);
      } else {
        // No group header yet — treat as standalone (group with no header)
        groups.push({ name: "", children: [cat] });
      }
    }
  }
  if (currentGroup) groups.push(currentGroup);

  return groups;
}

export function parseExcel(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: false,
        }) as unknown[][];

        if (!rows || rows.length < 2) {
          reject(new Error("Файл порожній або має менше 2 рядків"));
          return;
        }

        // Find header row — first row with ≥2 non-empty cells in A–G
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(10, rows.length); i++) {
          const nonEmpty = (rows[i] as unknown[])
            .slice(0, 7)
            .filter((c) => norm(c).length > 0);
          if (nonEmpty.length >= 2) {
            headerRowIdx = i;
            break;
          }
        }

        const headers = (rows[headerRowIdx] as unknown[])
          .slice(0, 7)
          .map((h) => norm(h));

        const products: ProductRow[] = [];
        const categoryOrder: string[] = [];
        const categoryProductCount: Record<string, number> = {};
        let currentCategory = "Загальне";
        let id = 0;

        for (let i = headerRowIdx + 1; i < rows.length; i++) {
          const row = rows[i] as unknown[];
          const colA = norm(row[COL_NAME]);

          if (!colA) continue;

          // Category heading row?
          const cat = isCategoryRow(colA);
          if (cat) {
            currentCategory = cat;
            if (!categoryOrder.includes(cat)) {
              categoryOrder.push(cat);
              categoryProductCount[cat] = 0;
            }
            continue;
          }

          // Skip totals / summary rows
          const lower = colA.toLowerCase();
          if (
            lower.includes("разом") ||
            lower.includes("итого") ||
            lower.includes("всього")
          ) {
            continue;
          }

          const finalBalance = parseNum(norm(row[COL_BALANCE]));

          // Track product count per category
          if (!categoryOrder.includes(currentCategory)) {
            categoryOrder.push(currentCategory);
            categoryProductCount[currentCategory] = 0;
          }
          categoryProductCount[currentCategory]++;

          id++;
          products.push({
            id,
            name: colA,
            category: currentCategory,
            finalBalance,
            warehouseCount: null,
            showcaseCount: null,
            sum: null,
            difference: null,
          });
        }

        if (products.length === 0) {
          reject(new Error("У файлі не знайдено жодного товару. Перевірте формат файлу."));
          return;
        }

        const categoryGroups = buildCategoryGroups(categoryOrder, categoryProductCount);

        resolve({
          headers,
          products,
          categories: categoryOrder.filter((c) => categoryProductCount[c] > 0),
          categoryGroups,
          storeAddress: extractStoreAddress(rows),
        });
      } catch (err) {
        reject(new Error("Помилка читання файлу: " + (err as Error).message));
      }
    };
    reader.onerror = () => reject(new Error("Не вдалося прочитати файл"));
    reader.readAsArrayBuffer(file);
  });
}
