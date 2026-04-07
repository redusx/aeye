"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SortingBar } from "@/components/sorting-bar";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { SEOSection } from "@/components/seo-section";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductListingPage() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Mobile Filter Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity",
          showMobileFilters ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setShowMobileFilters(false)}
      />

      {/* Mobile Filter Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border lg:hidden transition-transform",
          showMobileFilters ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold text-sm">Filtreler</span>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-1 hover:bg-secondary rounded-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          <FilterSidebar />
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="py-3 text-xs text-muted-foreground">
          <ol className="flex items-center gap-1.5">
            <li>
              <a href="/" className="hover:text-foreground transition-colors">
                Ana Sayfa
              </a>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">Güneş Gözlüğü</li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="pb-4">
          <h1 className="text-xl font-semibold text-foreground">Güneş Gözlüğü</h1>
          <p className="text-xs text-muted-foreground mt-1">
            En kaliteli güneş gözlükleri, dünya markalarından özel koleksiyonlar
          </p>
        </div>

        {/* Main Content */}
        <div className="flex gap-6 pb-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>

          {/* Product Area */}
          <div className="flex-1 min-w-0">
            <SortingBar
              productCount={702}
              onToggleFilters={() => setShowMobileFilters(true)}
            />

            <div className="mt-4">
              <ProductGrid />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={59}
              onPageChange={setCurrentPage}
            />

            <SEOSection />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Kurumsal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">İletişim</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Kariyer</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Mağazalar</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Yardım</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sıkça Sorulan Sorular</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Sipariş Takibi</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">İade ve Değişim</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Garanti</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Kategoriler</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Güneş Gözlüğü</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Numaralı Gözlük</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Lens</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Aksesuar</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Bizi Takip Edin</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; 2026 OptikShop. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Gizlilik Politikası</a>
              <a href="#" className="hover:text-foreground transition-colors">Kullanım Koşulları</a>
              <a href="#" className="hover:text-foreground transition-colors">Çerez Politikası</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
