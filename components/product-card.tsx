"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Product3DView = dynamic(
  () => import("@/components/Product3DView").then((mod) => mod.Product3DView),
  { ssr: false }
);

interface ProductCardProps {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image?: string;
  modelPath?: string;
  isBestseller?: boolean;
  isNew?: boolean;
}

export function ProductCard({
  name,
  brand,
  price,
  originalPrice,
  image,
  modelPath,
  isBestseller,
  isNew,
}: ProductCardProps) {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-card border border-border rounded-sm overflow-hidden transition-shadow duration-200 hover:shadow-lg">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isBestseller && (
          <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-sm">
            Çok Satan
          </span>
        )}
        {isNew && (
          <span className="px-1.5 py-0.5 bg-foreground text-background text-[10px] font-medium rounded-sm">
            Yeni
          </span>
        )}
        {discount > 0 && (
          <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-sm">
            %{discount}
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card">
        <Heart className="h-4 w-4 text-foreground" />
      </button>

      {/* 3D Model or Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary/50">
        {modelPath ? (
          <Product3DView modelPath={modelPath} />
        ) : image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : null}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
          {brand}
        </p>
        <h3 className="text-xs font-medium text-foreground line-clamp-2 min-h-[2rem] leading-tight">
          {name}
        </h3>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-sm font-semibold text-foreground">
            {price.toLocaleString("tr-TR")} ₺
          </span>
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {originalPrice.toLocaleString("tr-TR")} ₺
            </span>
          )}
        </div>
        <Button
          className={cn(
            "w-full mt-2 h-8 text-xs font-medium",
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          Sepete Ekle
        </Button>
      </div>
    </div>
  );
}
