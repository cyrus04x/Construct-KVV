"use client";

import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/(components)/Button";
import { ProductFilters } from "@/app/(components)/product/ProductFilters";
import { productService } from '@/app/services/productServices';

import { Shop } from '@/types/shop';
import router from "next/router";
import { dashboardFakes } from "@/app/utils/fakes/DashboardFakes";
import { useTranslations } from "@/app/hooks/useTranslations";

interface ShopProductsProps {
  shopId?: string;
  shop?: Shop;
}

export const ShopProducts: React.FC<ShopProductsProps> = ({ shopId, shop }) => {
  const seller = shop?.data?.seller ?? {};
  const sellerId = (seller as { id?: string }).id;
  // const sellerSellerId = (seller as { sellerId?: string }).sellerId;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  // const { id: sellerId, sellerId: sellerSellerId } = seller;
  useEffect(() => {
    if (!sellerId || !authToken) return;
    setLoading(true);
    productService.getProductsBySellerId(sellerId, authToken)
      .then((data) => {
        console.log('Products fetched from getProductsBySellerId:', data);
        setProducts(data);
      })
      .finally(() => setLoading(false));
  }, [sellerId, authToken]);
  const { t } = useTranslations();

  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Products Grid */}
          {/* Filters */}
          <ProductFilters
            // initialProducts={initialProducts}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onSelectedCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            initialProducts={[]}
            availableCategories={[]}
            shop={shop}
          />

          {/* Products */}
          <div className="flex flex-wrap gap-5 justify-center lg:flex lg:justify-start">
            {loading ? (
              <div>Loading products...</div>
            ) : products.length === 0 ? (
              <div>No products found for this shop.</div>
            ) : (
              products.map((product) => (
                <div
                    key={product.id}
                    className="bg-white overflow-hidden w-64 m-2 hover:shadow-lg cursor-pointer hover:rounded-xl transition-shadow"
                    onClick={() => router.push(`/product/${product.id}`)}
                  >
                    <div className="relative">
                      {product.thumbnailUrl ? (
                        <Image
                          src={product.thumbnailUrl}
                          alt={product.name}
                          width={100}
                          height={100}
                          className="w-full h-56 object-cover rounded-xl" 
                        />
                      ) : (
                        <div className="w-full h-56 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400">
                          No Image
                        </div>
                      )}
                      <div className="absolute top-2 right-2 border text-gray-100 rounded-full p-3 flex items-center justify-center cursor-pointer shadow-sm hover:bg-yellow-400 hover:border-yellow-400 transition-colors">
                        <Heart className="text-gray-100" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between">
                        <h3 className="text-md font-semibold text-gray-900 w-[60%] mb-1">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-2 overflow">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-md text-yellow-400">
                          {product.price}
                          <span className="text-sm text-yellow-400"> Rwf</span>
                        </p>
                      </div>
                      <Button
                        text={t(dashboardFakes.common.addToCart)}
                        texSize={"text-sm"}
                        hoverBg={"hover:bg-yellow-400"}
                        borderCol={"border-yellow-300"}
                        bgCol={"white"}
                        textCol={"text-gray-800"}
                        border={"border-1"}
                        handleButton={() => alert(`Add to Cart clicked for ${product.name}`)}
                        padding={"p-3"}
                        round={"rounded-full"} />
                    </div>
                  </div>
              ))
            )}
          </div>
          {/* PAGINATION BUTTONS */}
          <div className="mt-6 flex justify-center space-x-2">
            <button className="border border-amber-300 hover:bg-amber-500 hover:text-white text-amber-300 font-semibold py-2 px-2 rounded focus:outline-none focus:shadow-outline">
              <ChevronLeft className="h-5 w-5 text-amber-300" />
            </button>
            <div className="flex justify-center items-center gap-3">
              <Link href={""}>01</Link>
              <Link href={""}>02</Link>
              <Link href={""}>03</Link>
              <Link href={""}>04</Link>
            </div>
            <button className="border border-amber-300 hover:bg-amber-500 hover:text-white text-amber-300 font-semibold py-2 px-2 rounded focus:outline-none focus:shadow-outline">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
      </div>
    </div>
  );
};
