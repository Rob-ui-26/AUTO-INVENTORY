import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { ProductRow } from "../types";

export function exportResults(products: ProductRow[]) {
  const diffItems = products.filter(
    (p) => p.difference !== null && p.difference !== 0
  );

  const wsData = [
    ["Результати перерахунку — Розбіжності"],
    [""],
    [
      "Назва",
      "Категорія",
      "Кінцевий залишок",
      "Склад (введено)",
      "Вітрина (введено)",
      "Сума (Склад + Вітрина)",
      "Різниця",
    ],
    ...diffItems.map((p) => [
      p.name,
      p.category,
      p.finalBalance,
      p.warehouseCount ?? "—",
      p.showcaseCount ?? "—",
      p.sum ?? "—",
      p.difference,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [
    { wch: 40 },
    { wch: 30 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 22 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Розбіжності");

  const now = new Date();
  const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;
  const filename = `Перерахунок_${dateStr}.xlsx`;

  const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbOut], { type: "application/octet-stream" }), filename);
}
