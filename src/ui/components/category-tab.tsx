"use client";
import { useCallback, useEffect, useState } from "react";

import { getStoreMenu } from "~/network";
import {
  MenuItem,
  MenuItemStatusEnum,
  StoreMenuResponse,
} from "~/network/types/menu-item-response"; // Update import path

import FoodItem from "./food-item";

// Cache for menu data
let menuCache: null | StoreMenuResponse[] = null;
let cacheTimestamp: null | number = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const CategoryTabs = () => {
  const [menuData, setMenuData] = useState<StoreMenuResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    return (
      menuCache &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < CACHE_DURATION
    );
  }, []);

  const fetchMenu = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first (unless force refresh)
        if (!forceRefresh && isCacheValid()) {
          console.log("Using cached menu data");
          setMenuData(menuCache!);
          setLoading(false);
          return;
        }

        console.log("Fetching menu from API");
        const response = await getStoreMenu();
        const sortedMenu = response.data.sort(
          (a, b) => a.sorting_index - b.sorting_index
        );

        // Update cache
        menuCache = sortedMenu;
        cacheTimestamp = Date.now();

        setMenuData(sortedMenu);

        // Set first category as active if none selected
        if (sortedMenu.length > 0 && activeCategory === "All") {
          // Keep "All" as default
        }
      } catch (err: any) {
        console.error("Error fetching menu:", err);
        setError(err?.response?.data?.message || "Failed to load menu");

        // If there's cached data, use it as fallback
        if (menuCache && menuCache.length > 0) {
          console.log("Using cached menu as fallback");
          setMenuData(menuCache);
        }
      } finally {
        setLoading(false);
      }
    },
    [isCacheValid, activeCategory]
  );

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleRetry = useCallback(() => {
    fetchMenu(true); // Force refresh
  }, [fetchMenu]);

  // Get unique categories from menu data
  const categories = [
    "All",
    ...menuData.map((category) => category.categoryName.trim()),
  ];

  // Filter and flatten menu items based on active category
  const getFilteredItems = (): MenuItem[] => {
    if (activeCategory === "All") {
      // Return all items from all categories
      return menuData.flatMap((category) =>
        category.menuItems.filter(
          (item) =>
            !item.hidden && item.status !== MenuItemStatusEnum.UNAVAILABLE
        )
      );
    } else {
      // Return items from selected category
      const selectedCategory = menuData.find(
        (cat) => cat.categoryName.trim() === activeCategory
      );
      return selectedCategory
        ? selectedCategory.menuItems.filter(
            (item) =>
              !item.hidden && item.status !== MenuItemStatusEnum.UNAVAILABLE
          )
        : [];
    }
  };

  const filteredItems = getFilteredItems();

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 w-96 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div
          className={`
            grid grid-cols-1 gap-6
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          `}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              className={`overflow-hidden rounded-lg border bg-white shadow-sm`}
              key={item}
            >
              <div className="h-48 animate-pulse bg-gray-200"></div>
              <div className="p-4">
                <div className="mb-2 h-4 animate-pulse rounded bg-gray-200"></div>
                <div className="mb-2 h-3 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div
          className={`
            rounded-lg border border-red-200 bg-red-50 p-6 text-center
          `}
        >
          <h3 className="mb-2 text-lg font-semibold text-red-800">
            Failed to Load Menu
          </h3>
          <p className="mb-4 text-red-600">{error}</p>
          <button
            className={`
              rounded bg-red-600 px-4 py-2 text-white transition-colors
              hover:bg-red-700
              disabled:opacity-50
            `}
            disabled={loading}
            onClick={handleRetry}
          >
            {loading ? "Retrying..." : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (menuData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            No Menu Items Available
          </h3>
          <p className="text-gray-600">Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h2
          className={`
            font-heading mb-6 text-2xl font-bold text-gray-800
            md:text-3xl
          `}
        >
          Explore Our Menu
        </h2>

        {/* Category Slider */}
        <div className="w-full pb-6">
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex justify-center space-x-3">
                {categories.map((category) => (
                  <button
                    className={`
                      flex-shrink-0 rounded-full px-6 py-3 text-sm font-medium
                      whitespace-nowrap transition-all duration-200
                      ${
                        activeCategory === category
                          ? "bg-gray-900 text-white shadow-md"
                          : `
                            bg-gray-100 text-gray-700
                            hover:bg-gray-200 hover:shadow-sm
                          `
                      }
                    `}
                    key={category}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length > 0 ? (
        <div
          className={`
            grid grid-cols-1 gap-6
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          `}
        >
          {filteredItems.map((item) => (
            <FoodItem
              description={item.description}
              image={item.image}
              key={item.menuItemId}
              // Pass the full item for customizations, etc.
              name={item.name.trim()}
              price={`${item.price}`}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            No items in {activeCategory === "All" ? "menu" : activeCategory}
          </h3>
          <p className="text-gray-600">Please try a different category.</p>
        </div>
      )}

      {/* Category count indicator */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing {filteredItems.length} item
        {filteredItems.length !== 1 ? "s" : ""}
        {activeCategory !== "All" && ` in ${activeCategory}`}
      </div>
    </div>
  );
};

export default CategoryTabs;
