"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import { Loader2 } from "lucide-react";

interface GlassesModel {
  id: number;
  fileName: string;
  modelPath: string;
  displayName: string;
  fileSize: number;
  lastModified: string;
}

export function ProductGrid() {
  const [models, setModels] = useState<GlassesModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch("/api/glasses");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setModels(data.models ?? []);
      } catch (err) {
        console.error("[ProductGrid] Failed to fetch models:", err);
        setError("Modeller yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Modeller taranıyor...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">
          Henüz gözlük modeli bulunamadı.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <code className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">
            public/models/sunglasses/
          </code>{" "}
          klasörüne .glb dosyası ekleyin.
        </p>
      </div>
    );
  }

  // ─── Responsive Grid ──────────────────────────────────────────────
  // For 1 model:  1 column centered
  // For 2 models: 2 columns
  // For 3 models: 3 columns on md+
  // For 4+:       2 → 3 → 4 columns (standard responsive)
  const gridClass = getGridClass(models.length);

  return (
    <div className={gridClass}>
      {models.map((model) => (
        <ProductCard
          key={model.id}
          id={model.id}
          name={model.displayName}
          modelPath={model.modelPath}
        />
      ))}
    </div>
  );
}

/**
 * Returns the appropriate Tailwind grid classes based on item count.
 * Ensures even distribution regardless of how many models exist.
 */
function getGridClass(count: number): string {
  if (count === 1) {
    return "grid grid-cols-1 max-w-sm mx-auto gap-4";
  }
  if (count === 2) {
    return "grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-4";
  }
  if (count === 3) {
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
  }
  // 4+ models: standard responsive grid
  return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3";
}

/**
 * Exposes the model count for parent components (e.g. SortingBar).
 * Use via a separate hook or by lifting state.
 */
export { type GlassesModel };
