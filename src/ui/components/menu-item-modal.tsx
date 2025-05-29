import { Minus, Plus, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import {
  MenuItem,
  MenuItemCustomization,
  MenuItemCustomizationOption,
} from "~/network/types/menu-item-response";
import { useCart } from "~/store/useCart";

import { Button } from "../primitives/button";

interface MenuItemModalProps {
  isOpen: boolean;
  menuItem: MenuItem;
  onClose: () => void;
}

type SelectedCustomizations = Record<string, string | string[]>;

interface ValidationError {
  customizationId: string;
  message: string;
}

const MODAL_CLASSES = {
  closeButton: "rounded-full p-2 hover:bg-gray-100 transition-colors",
  container:
    "relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl",
  content: "max-h-[calc(90vh-140px)] overflow-y-auto p-6",
  errorContainer: "mb-4 rounded-lg bg-red-50 border border-red-200 p-3",
  footer: "border-t p-6",
  header: "flex items-center justify-between border-b p-6",
  optionLabel:
    "flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-gray-50 transition-colors",
  overlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
  quantityButton:
    "rounded-full p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
} as const;

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  menuItem,
  onClose,
}) => {
  const [selectedCustomizations, setSelectedCustomizations] =
    useState<SelectedCustomizations>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const { addToCart } = useCart();

  const initializeCustomizations = useCallback((): SelectedCustomizations => {
    return menuItem.customizations.reduce((acc, customization) => {
      acc[customization.customizationId] =
        customization.selectionType === "MULTIPLE" ? [] : "";
      return acc;
    }, {} as SelectedCustomizations);
  }, [menuItem.customizations]);

  useEffect(() => {
    if (isOpen) {
      setSelectedCustomizations(initializeCustomizations());
      setValidationErrors([]);
      setQuantity(1);
      setNotes("");
    }
  }, [isOpen, initializeCustomizations]);

  const handleCustomizationChange = useCallback(
    (
      customizationId: string,
      optionId: string,
      customization: MenuItemCustomization
    ) => {
      setSelectedCustomizations((prev) => {
        if (customization.selectionType === "SINGLE") {
          return { ...prev, [customizationId]: optionId };
        }

        const currentSelections = (prev[customizationId] as string[]) || [];
        const isSelected = currentSelections.includes(optionId);

        let newSelections: string[];
        if (isSelected) {
          newSelections = currentSelections.filter((id) => id !== optionId);
        } else {
          const hasLimit = customization.limit > 0;
          const canAddMore =
            !hasLimit || currentSelections.length < customization.limit;

          newSelections = canAddMore
            ? [...currentSelections, optionId]
            : currentSelections;
        }

        return { ...prev, [customizationId]: newSelections };
      });
    },
    []
  );

  const validateCustomizations = useCallback((): ValidationError[] => {
    return menuItem.customizations.reduce((errors, customization) => {
      if (!customization.isRequired) return errors;

      const selection = selectedCustomizations[customization.customizationId];
      const isEmpty =
        customization.selectionType === "SINGLE"
          ? !selection || selection === ""
          : !Array.isArray(selection) || selection.length === 0;

      if (isEmpty) {
        errors.push({
          customizationId: customization.customizationId,
          message: `Please select ${customization.title.toLowerCase()}`,
        });
      }

      return errors;
    }, [] as ValidationError[]);
  }, [menuItem.customizations, selectedCustomizations]);

  // Convert selectedCustomizations to the format expected by cart store
  const formatCustomizationsForCart = useCallback((): Record<
    string,
    string[]
  > => {
    const formatted: Record<string, string[]> = {};

    Object.entries(selectedCustomizations).forEach(
      ([customizationId, selection]) => {
        if (Array.isArray(selection)) {
          // Multiple selection - already in correct format
          formatted[customizationId] = selection;
        } else if (selection && selection !== "") {
          // Single selection - convert to array
          formatted[customizationId] = [selection];
        }
      }
    );

    return formatted;
  }, [selectedCustomizations]);

  // Calculate total price including customizations
  const calculateTotalPrice = useCallback((): number => {
    let total = menuItem.price;

    Object.entries(selectedCustomizations).forEach(
      ([customizationId, selection]) => {
        const customization = menuItem.customizations.find(
          (c) => c.customizationId === customizationId
        );

        if (!customization) return;

        const selectedOptionIds = Array.isArray(selection)
          ? selection
          : [selection];

        selectedOptionIds.forEach((optionId) => {
          if (optionId) {
            const option = customization.options.find(
              (opt) => opt.customizationOptionId === optionId
            );
            if (option) {
              total += option.priceModifier;
            }
          }
        });
      }
    );

    return total * quantity;
  }, [menuItem, selectedCustomizations, quantity]);

  const handleAddToCart = useCallback(() => {
    const errors = validateCustomizations();
    setValidationErrors(errors);

    if (errors.length === 0) {
      try {
        // Convert customizations to cart format
        const cartCustomizations = formatCustomizationsForCart();

        // Add to cart using the store
        const cartItemId = addToCart(
          menuItem,
          cartCustomizations,
          quantity,
          notes.trim() || undefined
        );

        console.log("Item added to cart:", {
          cartItemId,
          customizations: cartCustomizations,
          menuItem: menuItem.name,
          notes: notes.trim(),
          quantity,
        });

        // Close modal on success
        onClose();
      } catch (error) {
        console.error("Error adding item to cart:", error);
        // You could show an error message to the user here
      }
    }
  }, [
    validateCustomizations,
    formatCustomizationsForCart,
    addToCart,
    menuItem,
    quantity,
    notes,
    onClose,
  ]);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  }, []);

  const renderCustomizationOption = useCallback(
    (
      customization: MenuItemCustomization,
      option: MenuItemCustomizationOption
    ) => {
      const isSelected =
        customization.selectionType === "SINGLE"
          ? selectedCustomizations[customization.customizationId] ===
            option.customizationOptionId
          : (
              (selectedCustomizations[
                customization.customizationId
              ] as string[]) || []
            ).includes(option.customizationOptionId);

      const inputType =
        customization.selectionType === "SINGLE" ? "radio" : "checkbox";
      const showPriceModifier = option.priceModifier !== 0;

      return (
        <label
          className={MODAL_CLASSES.optionLabel}
          key={option.customizationOptionId}
        >
          <div className="flex items-center gap-3">
            <input
              checked={isSelected}
              className="h-4 w-4 accent-green-600"
              name={customization.customizationId}
              onChange={() =>
                handleCustomizationChange(
                  customization.customizationId,
                  option.customizationOptionId,
                  customization
                )
              }
              type={inputType}
            />
            <span className="text-gray-900">{option.name}</span>
          </div>
          {showPriceModifier && (
            <span className="text-sm font-medium text-gray-600">
              {option.priceModifier > 0 ? "+" : ""}PKR {option.priceModifier}
            </span>
          )}
        </label>
      );
    },
    [selectedCustomizations, handleCustomizationChange]
  );

  const renderCustomization = useCallback(
    (customization: MenuItemCustomization) => (
      <div className="mb-6" key={customization.customizationId}>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{customization.title}</h3>
          {customization.isRequired && (
            <span
              className={`
                rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600
              `}
            >
              Required
            </span>
          )}
          {customization.limit > 0 &&
            customization.selectionType === "MULTIPLE" && (
              <span
                className={`rounded bg-gray-100 px-2 py-1 text-xs text-gray-500`}
              >
                Max {customization.limit}
              </span>
            )}
        </div>
        <div className="space-y-2">
          {customization.options.map((option) =>
            renderCustomizationOption(customization, option)
          )}
        </div>
      </div>
    ),
    [renderCustomizationOption]
  );

  if (!isOpen) return null;

  const totalPrice = calculateTotalPrice();

  return (
    <div
      className={MODAL_CLASSES.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={MODAL_CLASSES.container}>
        <header className={MODAL_CLASSES.header}>
          <h2 className="text-xl font-semibold text-gray-900">
            {menuItem.name}
          </h2>
          <button
            aria-label="Close modal"
            className={MODAL_CLASSES.closeButton}
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className={MODAL_CLASSES.content}>
          <section className="mb-6 flex gap-4">
            <img
              alt={menuItem.name}
              className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
              src={menuItem.image}
            />
            <div className="min-w-0 flex-1">
              <p className="mb-2 line-clamp-2 text-gray-600">
                {menuItem.description}
              </p>
              <p className="text-lg font-semibold text-green-600">
                PKR {menuItem.price}
              </p>
            </div>
          </section>

          {menuItem.customizations.length > 0 && (
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Customize Your Order
              </h3>
              {menuItem.customizations.map(renderCustomization)}
            </section>
          )}

          {validationErrors.length > 0 && (
            <div className={MODAL_CLASSES.errorContainer}>
              <h4 className="mb-1 text-sm font-medium text-red-800">
                Please fix the following:
              </h4>
              <ul className="space-y-1 text-sm text-red-600">
                {validationErrors.map((error, index) => (
                  <li key={`${error.customizationId}-${index}`}>
                    • {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity Section */}
          <section className="mb-6">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Quantity:</span>
              <div className="flex items-center gap-3">
                <button
                  className={MODAL_CLASSES.quantityButton}
                  disabled={quantity <= 1}
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[2rem] text-center font-medium">
                  {quantity}
                </span>
                <button
                  className={MODAL_CLASSES.quantityButton}
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Notes Section */}
          <section className="mb-6">
            <label
              className="mb-2 block font-medium text-gray-900"
              htmlFor="notes"
            >
              Special Instructions (Optional):
            </label>
            <textarea
              className={`
                w-full rounded-lg border border-gray-300 p-3 text-sm
                placeholder-gray-400
                focus:border-green-500 focus:ring-1 focus:ring-green-500
                focus:outline-none
              `}
              id="notes"
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or modifications..."
              rows={3}
              value={notes}
            />
          </section>

          {/* Price Summary */}
          <section className="mb-6 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Total Price:</span>
              <span className="text-lg font-semibold text-green-600">
                PKR {totalPrice.toFixed(2)}
              </span>
            </div>
            {quantity > 1 && (
              <p className="mt-1 text-sm text-gray-500">
                PKR {(totalPrice / quantity).toFixed(2)} × {quantity}
              </p>
            )}
          </section>
        </div>

        <footer className={MODAL_CLASSES.footer}>
          <div className="flex items-center justify-end gap-3">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              className={`
                bg-green-600 px-8 font-medium text-white
                hover:bg-green-700
              `}
              onClick={handleAddToCart}
            >
              Add to Cart - PKR {totalPrice.toFixed(2)}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MenuItemModal;
