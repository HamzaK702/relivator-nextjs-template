"use client";
import { useEffect, useState } from "react";

import { getPopularItems } from "~/network";
import {
  MenuItem,
  MenuItemResponse,
  MenuItemStatusEnum,
} from "~/network/types/menu-item-response";

import FoodItem from "./food-item";

interface CategorySectionProps {
  description?: string;
  title: string;
  viewAll?: boolean;
}

const CategorySection = ({
  description,
  title,
  viewAll = false,
}: CategorySectionProps) => {
  const [categories, setCategories] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        setLoading(true);
        const response = await getPopularItems();
        console.log(response);
        // The API returns response.data which is MenuItemResponse[]
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch popular items");
        setLoading(false);
        console.error("Error fetching popular items:", err);
      }
    };

    fetchPopularItems();
  }, []);

  // Flatten all menu items from all categories and filter out unavailable items
  const availableItems = categories.flatMap((category) =>
    category.menuItems.filter(
      (item: MenuItem) => item.status !== MenuItemStatusEnum.UNAVAILABLE
    )
  );

  // Take only up to 4 items (default limit)
  const displayItems = availableItems.slice(0, 4);

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="mb-8">
            <h2
              className={`
                mb-2 text-2xl font-bold text-gray-800
                md:text-3xl
              `}
            >
              {title}
            </h2>
            {description && (
              <p className="max-w-2xl text-gray-600">{description}</p>
            )}
          </div>
          {viewAll && (
            <a
              className={`
                text-restaurant-primary font-medium
                hover:underline
              `}
              href="#"
            >
              View All
            </a>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center py-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <div
            className={`
              grid grid-cols-1 gap-6
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            `}
          >
            {displayItems.map((item, index) => (
              <FoodItem
                description={item.description}
                image={item.image}
                key={index}
                name={item.name}
                price={item.price.toString()}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
