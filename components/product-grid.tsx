"use client";

import { ProductCard } from "./product-card";

const MODEL_PATH = "/models/sefo.glb";

const products = [
  {
    id: 1,
    name: "Aviator Classic Güneş Gözlüğü RB3025",
    brand: "Ray-Ban",
    price: 2499,
    originalPrice: 3299,
    image: "/products/sunglasses-1.jpg",
    modelPath: MODEL_PATH,
    isBestseller: true,
  },
  {
    id: 2,
    name: "Round Metal Tortoise Güneş Gözlüğü",
    brand: "Persol",
    price: 1899,
    image: "/products/sunglasses-2.jpg",
    modelPath: MODEL_PATH,
    isNew: true,
  },
  {
    id: 3,
    name: "Cat Eye Gold Metal Frame",
    brand: "Gucci",
    price: 4599,
    originalPrice: 5499,
    image: "/products/sunglasses-3.jpg",
    modelPath: MODEL_PATH,
    isBestseller: true,
  },
  {
    id: 4,
    name: "Wayfarer Original Siyah",
    brand: "Ray-Ban",
    price: 2199,
    image: "/products/sunglasses-4.jpg",
    modelPath: MODEL_PATH,
    isBestseller: true,
  },
  {
    id: 5,
    name: "Pilot Blue Tinted Silver Frame",
    brand: "Oakley",
    price: 1799,
    originalPrice: 2199,
    image: "/products/sunglasses-5.jpg",
    modelPath: MODEL_PATH,
  },
  {
    id: 6,
    name: "Oversized Square Black",
    brand: "Prada",
    price: 3899,
    image: "/products/sunglasses-6.jpg",
    modelPath: MODEL_PATH,
    isNew: true,
  },
  {
    id: 7,
    name: "Crystal Clear Round Frame",
    brand: "Tom Ford",
    price: 2999,
    originalPrice: 3599,
    image: "/products/sunglasses-7.jpg",
    modelPath: MODEL_PATH,
  },
  {
    id: 8,
    name: "Rose Gold Mirrored Aviator",
    brand: "Versace",
    price: 3299,
    image: "/products/sunglasses-8.jpg",
    modelPath: MODEL_PATH,
    isBestseller: true,
  },
  {
    id: 9,
    name: "Clubmaster Classic Kahverengi",
    brand: "Ray-Ban",
    price: 2399,
    originalPrice: 2899,
    image: "/products/sunglasses-1.jpg",
    modelPath: MODEL_PATH,
  },
  {
    id: 10,
    name: "Retro Square Havana",
    brand: "Carrera",
    price: 1599,
    image: "/products/sunglasses-2.jpg",
    modelPath: MODEL_PATH,
  },
  {
    id: 11,
    name: "Polarized Sport Güneş Gözlüğü",
    brand: "Oakley",
    price: 2899,
    originalPrice: 3499,
    image: "/products/sunglasses-3.jpg",
    modelPath: MODEL_PATH,
    isBestseller: true,
  },
  {
    id: 12,
    name: "Vintage Oval Gold Frame",
    brand: "Dolce & Gabbana",
    price: 4199,
    image: "/products/sunglasses-4.jpg",
    modelPath: MODEL_PATH,
    isNew: true,
  },
];

export function ProductGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
