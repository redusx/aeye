"use client";

import dynamic from "next/dynamic";
import { Heart, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const Product3DView = dynamic(
  () => import("@/components/Product3DView").then((mod) => mod.Product3DView),
  { ssr: false }
);

interface ProductCardProps {
  id: number;
  name: string;
  modelPath: string;
}

export function ProductCard({ name, modelPath }: ProductCardProps) {
  return (
    <div className="group relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30">
      {/* Wishlist Button */}
      <button className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card">
        <Heart className="h-4 w-4 text-foreground" />
      </button>

      {/* 3D Rotation hint */}
      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-card/70 backdrop-blur-sm text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <RotateCcw className="h-3 w-3" />
        <span>Döndür</span>
      </div>

      {/* 3D Model View */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-secondary/30 to-secondary/60">
        <Product3DView modelPath={modelPath} />
      </div>

      {/* Model Name */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground text-center truncate">
          {name}
        </h3>
      </div>
    </div>
  );
}
