"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-3">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "mt-3 max-h-[400px]" : "max-h-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface FilterCheckboxProps {
  label: string;
  count?: number;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

function FilterCheckbox({ label, count, checked = false, onChange }: FilterCheckboxProps) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer group">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="h-4 w-4 rounded-sm border-border"
      />
      <span className="text-xs text-foreground group-hover:text-primary transition-colors flex-1">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </label>
  );
}

const brands = [
  { name: "Ray-Ban", count: 156 },
  { name: "Oakley", count: 89 },
  { name: "Gucci", count: 67 },
  { name: "Prada", count: 54 },
  { name: "Versace", count: 43 },
  { name: "Dolce & Gabbana", count: 38 },
  { name: "Tom Ford", count: 32 },
  { name: "Persol", count: 28 },
  { name: "Carrera", count: 25 },
  { name: "Maui Jim", count: 21 },
  { name: "Police", count: 18 },
  { name: "Calvin Klein", count: 15 },
];

const priceRanges = [
  { label: "0 - 500 ₺", value: "0-500" },
  { label: "500 - 1.000 ₺", value: "500-1000" },
  { label: "1.000 - 2.000 ₺", value: "1000-2000" },
  { label: "2.000 - 5.000 ₺", value: "2000-5000" },
  { label: "5.000 ₺ ve üzeri", value: "5000+" },
];

const genders = [
  { label: "Kadın", count: 234 },
  { label: "Erkek", count: 312 },
  { label: "Unisex", count: 156 },
];

const frameShapes = [
  { label: "Dikdörtgen", count: 89 },
  { label: "Yuvarlak", count: 67 },
  { label: "Kare", count: 54 },
  { label: "Oval", count: 43 },
  { label: "Kedi Gözü", count: 38 },
  { label: "Pilot", count: 76 },
];

const frameColors = [
  { label: "Siyah", count: 234 },
  { label: "Kahverengi", count: 156 },
  { label: "Altın", count: 89 },
  { label: "Gümüş", count: 67 },
  { label: "Şeffaf", count: 43 },
  { label: "Mavi", count: 32 },
];

const lensColors = [
  { label: "Siyah", count: 312 },
  { label: "Kahverengi", count: 189 },
  { label: "Yeşil", count: 67 },
  { label: "Mavi", count: 54 },
  { label: "Aynalı", count: 43 },
  { label: "Gradyan", count: 38 },
];

export function FilterSidebar() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [selectedFrameColors, setSelectedFrameColors] = useState<string[]>([]);
  const [selectedLensColors, setSelectedLensColors] = useState<string[]>([]);

  const toggleFilter = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="sticky top-16 bg-card lg:bg-transparent">
        <div className="p-4 lg:p-0">
          <h2 className="text-sm font-semibold text-foreground mb-3 hidden lg:block">
            Filtreler
          </h2>

          <div className="max-h-[calc(100vh-120px)] overflow-y-auto pr-2 space-y-0">
            <FilterSection title="Markalar">
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <FilterCheckbox
                    key={brand.name}
                    label={brand.name}
                    count={brand.count}
                    checked={selectedBrands.includes(brand.name)}
                    onChange={() =>
                      toggleFilter(brand.name, selectedBrands, setSelectedBrands)
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Fiyat Aralığı">
              <div className="space-y-0.5">
                {priceRanges.map((range) => (
                  <FilterCheckbox
                    key={range.value}
                    label={range.label}
                    checked={selectedPrice.includes(range.value)}
                    onChange={() =>
                      toggleFilter(range.value, selectedPrice, setSelectedPrice)
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Cinsiyet">
              <div className="space-y-0.5">
                {genders.map((gender) => (
                  <FilterCheckbox
                    key={gender.label}
                    label={gender.label}
                    count={gender.count}
                    checked={selectedGenders.includes(gender.label)}
                    onChange={() =>
                      toggleFilter(gender.label, selectedGenders, setSelectedGenders)
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Çerçeve Şekli" defaultOpen={false}>
              <div className="space-y-0.5">
                {frameShapes.map((shape) => (
                  <FilterCheckbox
                    key={shape.label}
                    label={shape.label}
                    count={shape.count}
                    checked={selectedShapes.includes(shape.label)}
                    onChange={() =>
                      toggleFilter(shape.label, selectedShapes, setSelectedShapes)
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Çerçeve Rengi" defaultOpen={false}>
              <div className="space-y-0.5">
                {frameColors.map((color) => (
                  <FilterCheckbox
                    key={color.label}
                    label={color.label}
                    count={color.count}
                    checked={selectedFrameColors.includes(color.label)}
                    onChange={() =>
                      toggleFilter(
                        color.label,
                        selectedFrameColors,
                        setSelectedFrameColors
                      )
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Cam Rengi" defaultOpen={false}>
              <div className="space-y-0.5">
                {lensColors.map((color) => (
                  <FilterCheckbox
                    key={color.label}
                    label={color.label}
                    count={color.count}
                    checked={selectedLensColors.includes(color.label)}
                    onChange={() =>
                      toggleFilter(
                        color.label,
                        selectedLensColors,
                        setSelectedLensColors
                      )
                    }
                  />
                ))}
              </div>
            </FilterSection>
          </div>
        </div>
      </div>
    </aside>
  );
}
