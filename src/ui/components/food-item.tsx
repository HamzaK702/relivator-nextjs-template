import { ShoppingCart } from "lucide-react";
import React from "react";

import { Button } from "../primitives/button";

interface FoodItemProps {
  description: string;
  image: string;
  name: string;
  price: string;
}

const FoodItem = ({ description, image, name, price }: FoodItemProps) => {
  return (
    <div
      className={`
        overflow-hidden rounded-lg bg-white shadow-sm transition-shadow
        hover:shadow-md
      `}
    >
      <div className="relative aspect-square overflow-hidden">
        <img alt={name} className="h-full w-full object-cover" src={image} />
        <div
          className={`
            absolute inset-0 flex items-end bg-gradient-to-t from-black/40
            to-transparent p-4 opacity-0 transition-opacity
            hover:opacity-100
          `}
        >
          <Button
            className={`
              text-restaurant-primary w-full bg-white
              hover:bg-white/90
            `}
            size="sm"
            variant="secondary"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-1 text-lg font-medium">{name}</h3>
        <p className="mb-3 line-clamp-2 h-10 text-sm text-gray-600">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-restaurant-primary font-semibold">{price}</p>
          <Button
            className={`
              hover:text-restaurant-primary
              p-0 text-gray-600
            `}
            size="sm"
            variant="ghost"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
