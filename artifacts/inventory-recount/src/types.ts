export interface ProductRow {
  id: number;
  name: string;
  category: string;
  finalBalance: number;
  warehouseCount: number | null;
  showcaseCount: number | null;
  sum: number | null;
  difference: number | null;
}

export interface CategoryGroup {
  name: string;
  children: string[];
}

export interface ExcelData {
  headers: string[];
  products: ProductRow[];
  categories: string[];
  categoryGroups: CategoryGroup[];
  storeAddress: string;
}

export type AppMode = "warehouse" | "showcase";
export type CountMode = "all" | "selected";

export type AppStep =
  | "upload"
  | "mode-select"
  | "category-select"
  | "counting"
  | "switch-prompt"
  | "results";

export interface AppState {
  step: AppStep;
  storeAddress: string;
  excelData: ExcelData | null;
  mode: AppMode | null;
  secondMode: AppMode | null;
  countMode: CountMode;
  selectedCategories: string[];
  firstPassCategories: string[];
  secondPassCategories: string[];
  products: ProductRow[];
  doingSecondPass: boolean;
  firstPassDone: boolean;
  secondPassDone: boolean;
}
