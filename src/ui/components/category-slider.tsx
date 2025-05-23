"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { getStoreCategories } from "~/network";
import { StoreCategoryResponse } from "~/network/types/store-category-response";

let categoriesCache: null | StoreCategoryResponse[] = null;
let cacheTimestamp: null | number = null;
const CACHE_DURATION = 1 * 60 * 1000;

const CategorySlider = () => {
  const [categories, setCategories] = useState<StoreCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [selectedCategory, setSelectedCategory] = useState<null | string>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isCacheValid = useCallback(() => {
    return (
      categoriesCache &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < CACHE_DURATION
    );
  }, []);

  const fetchCategories = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);
        if (!forceRefresh && isCacheValid()) {
          console.log("Using cached categories");
          setCategories(categoriesCache!);
          if (categoriesCache!.length > 0) {
            setSelectedCategory(categoriesCache![0].id);
          }
          setLoading(false);
          return;
        }

        console.log("Fetching categories from API");
        const response = await getStoreCategories();
        const sortedCategories = response.data.sort(
          (a, b) => a.sorting_index - b.sorting_index
        );

        categoriesCache = sortedCategories;
        cacheTimestamp = Date.now();

        setCategories(sortedCategories);
        if (sortedCategories.length > 0) {
          setSelectedCategory(sortedCategories[0].id);
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError(err?.response?.data?.message || "Failed to load categories");

        if (categoriesCache && categoriesCache.length > 0) {
          console.log("Using cached categories as fallback");
          setCategories(categoriesCache);
          if (categoriesCache.length > 0) {
            setSelectedCategory(categoriesCache[0].id);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [isCacheValid]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log("Selected category:", categoryId);
  }, []);

  // Calculate how many items can fit on screen
  const getVisibleItems = () => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 640) return 2; // mobile
      if (width < 768) return 3; // sm
      if (width < 1024) return 4; // md
      if (width < 1280) return 5; // lg
      return 6; // xl and above
    }
    return 5; // default
  };

  const [visibleItems, setVisibleItems] = useState(getVisibleItems());

  useEffect(() => {
    const handleResize = () => {
      setVisibleItems(getVisibleItems());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    if (currentIndex < categories.length - visibleItems) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, categories.length, visibleItems]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleRetry = useCallback(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < categories.length - visibleItems;

  if (loading) {
    return (
      <div className="w-full py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex justify-center space-x-3 overflow-hidden">
            {[1, 2, 3, 4, 5].map((item) => (
              <div className="flex-shrink-0" key={item}>
                <div
                  className={`h-10 w-24 animate-pulse rounded-full bg-gray-200`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
            <button
              className={`
                mt-1 text-sm text-red-700 underline
                hover:text-red-800
                disabled:opacity-50
              `}
              disabled={loading}
              onClick={handleRetry}
            >
              {loading ? "Retrying..." : "Try again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-b border-gray-100 py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative">
          {/* Left Arrow */}
          {categories.length > visibleItems && canScrollLeft && (
            <button
              className={`
                absolute top-1/2 left-0 z-10 flex h-8 w-8 -translate-x-4
                -translate-y-1/2 transform items-center justify-center
                rounded-full border bg-white shadow-md transition-shadow
                hover:shadow-lg
              `}
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
          )}

          {/* Right Arrow */}
          {categories.length > visibleItems && canScrollRight && (
            <button
              className={`
                absolute top-1/2 right-0 z-10 flex h-8 w-8 translate-x-4
                -translate-y-1/2 transform items-center justify-center
                rounded-full border bg-white shadow-md transition-shadow
                hover:shadow-lg
              `}
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          )}

          {/* Categories Slider Container */}
          <div className="overflow-hidden">
            <div
              className={`
                flex space-x-3 transition-transform duration-300 ease-out
              `}
              style={{
                justifyContent:
                  categories.length <= visibleItems ? "center" : "flex-start",
                transform:
                  categories.length <= visibleItems
                    ? "translateX(0)"
                    : `translateX(-${currentIndex * (100 / visibleItems)}%)`,
                width:
                  categories.length <= visibleItems
                    ? "100%"
                    : `${(categories.length / visibleItems) * 100}%`,
              }}
            >
              {categories.map((category) => (
                <button
                  className={`
                    flex-shrink-0 rounded-full border px-4 py-2 text-sm
                    font-medium whitespace-nowrap transition-all duration-200
                    ${
                      selectedCategory === category.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : `
                          border-gray-200 bg-white text-gray-700
                          hover:border-gray-300 hover:bg-gray-50
                        `
                    }
                  `}
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.categoryName}
                </button>
              ))}
            </div>
          </div>

          {/* Dots indicator for slider */}
          {categories.length > visibleItems && (
            <div className="mt-4 flex justify-center space-x-2">
              {Array.from({
                length: Math.ceil(categories.length / visibleItems),
              }).map((_, index) => (
                <button
                  className={`
                    h-2 w-2 rounded-full transition-colors duration-200
                    ${
                      Math.floor(currentIndex / visibleItems) === index
                        ? "bg-gray-900"
                        : `
                          bg-gray-300
                          hover:bg-gray-400
                        `
                    }
                  `}
                  key={index}
                  onClick={() => setCurrentIndex(index * visibleItems)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;
