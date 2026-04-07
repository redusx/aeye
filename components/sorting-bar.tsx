"use client";

import { ChevronDown, Grid3X3, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const sortOptions = [
  { label: "Çok Satanlar", value: "bestseller" },
  { label: "Yeni Gelenler", value: "newest" },
  { label: "Fiyat: Düşükten Yükseğe", value: "price-asc" },
  { label: "Fiyat: Yüksekten Düşüğe", value: "price-desc" },
  { label: "İndirim Oranı", value: "discount" },
];

interface SortingBarProps {
  productCount?: number;
  onToggleFilters?: () => void;
}

export function SortingBar({ productCount = 702, onToggleFilters }: SortingBarProps) {
  const [selectedSort, setSelectedSort] = useState("bestseller");
  const [gridSize, setGridSize] = useState<"small" | "large">("small");

  const selectedLabel = sortOptions.find((opt) => opt.value === selectedSort)?.label;

  return (
    <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden h-8 text-xs gap-1.5"
          onClick={onToggleFilters}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtreler
        </Button>
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{productCount}</span> ürün
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Grid Size Toggle */}
        <div className="hidden sm:flex items-center border border-border rounded-sm overflow-hidden">
          <button
            onClick={() => setGridSize("small")}
            className={`p-1.5 transition-colors ${
              gridSize === "small"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setGridSize("large")}
            className={`p-1.5 transition-colors ${
              gridSize === "large"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <span className="hidden sm:inline">Sırala:</span>
              <span className="font-medium">{selectedLabel}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSelectedSort(option.value)}
                className={`text-xs ${
                  selectedSort === option.value ? "bg-secondary font-medium" : ""
                }`}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
