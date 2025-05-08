"use client";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../primitives/tabs";
import FoodItem from "./food-item";

interface CategoryTabsProps {
  items: FoodItemType[];
}

interface FoodItemType {
  category: string;
  description: string;
  image: string;
  name: string;
  price: string;
}

const CategoryTabs = ({ items }: CategoryTabsProps) => {
  const categories = ["All", "Breakfast", "Main Course", "Desserts", "Drinks"];
  const [activeCategory, setActiveCategory] = useState("All");

  // Filter items based on active category
  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <Tabs
        className="w-full"
        defaultValue="All"
        onValueChange={(value) => setActiveCategory(value)}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2
            className={`
              font-heading text-2xl font-bold text-gray-800
              md:text-3xl
            `}
          >
            Explore Our Menu
          </h2>
          <TabsList className="bg-gray-100/80">
            {categories.map((category) => (
              <TabsTrigger
                className={`
                  data-[state=active]:bg-restaurant-primary
                  data-[state=active]:text-white
                `}
                key={category}
                value={category}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent className="mt-0" value={activeCategory}>
          <div
            className={`
              grid grid-cols-1 gap-6
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            `}
          >
            {filteredItems.map((item, index) => (
              <FoodItem
                description={item.description}
                image={item.image}
                key={index}
                name={item.name}
                price={item.price}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoryTabs;
