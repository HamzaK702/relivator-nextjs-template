import { ShoppingCart } from "lucide-react";
import React, { useState } from "react";

import { MenuItem } from "~/network/types/menu-item-response";

import { Button } from "../primitives/button";
import MenuItemModal from "./menu-item-modal";

interface FoodItemProps {
  // Legacy props for backward compatibility
  description?: string;
  image?: string;
  menuItem?: MenuItem;
  name?: string;
  price?: string;
}

const FoodItem = ({
  description,
  image,
  menuItem,
  name,
  price,
}: FoodItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemDescription = menuItem?.description || description || "";
  const itemImage = menuItem?.image || image || "";
  const itemName = menuItem?.name || name || "";
  const itemPrice = menuItem?.price?.toString() || price || "0";

  // const handleAddToCart = () => {
  //   // This will be handled by the modal
  //   console.log("Opening modal for item:", menuItem);
  // };

  const openModal = () => {
    if (menuItem) {
      setIsModalOpen(true);
    }
  };

  return (
    <div
      className={`
        overflow-hidden rounded-lg bg-white shadow-sm transition-shadow
        hover:shadow-md
      `}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          alt={itemName}
          className="h-full w-full object-cover"
          src={itemImage}
        />
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
            onClick={openModal}
            size="sm"
            variant="secondary"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-1 text-lg font-medium">{itemName.trim()}</h3>
        <p className="mb-3 line-clamp-2 h-10 text-sm text-gray-600">
          {itemDescription}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-restaurant-primary font-semibold">
            PKR {itemPrice}
          </p>
          <Button
            className={`
              hover:text-restaurant-primary
              p-0 text-gray-600
            `}
            onClick={openModal}
            size="sm"
            variant="ghost"
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Modal */}
      {menuItem && (
        <MenuItemModal
          isOpen={isModalOpen}
          menuItem={menuItem}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default FoodItem;
