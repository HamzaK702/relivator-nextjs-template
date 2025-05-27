import { X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import {
  MenuItem,
  MenuItemCustomization,
  MenuItemCustomizationOption,
} from "~/network/types/menu-item-response";

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

  const handleAddToCart = useCallback(() => {
    const errors = validateCustomizations();
    setValidationErrors(errors);

    if (errors.length === 0) {
      console.log("Selected customizations:", {
        customizations: selectedCustomizations,
        menuItem,
      });
      onClose();
    }
  }, [validateCustomizations, menuItem, selectedCustomizations, onClose]);

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
                className={`
                rounded bg-gray-100 px-2 py-1 text-xs text-gray-500
              `}
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

          <section className="mb-6 flex items-center gap-4">
            <span className="font-medium text-gray-900">
              Base Price: PKR {menuItem.price}
            </span>
          </section>
        </div>

        <footer className={MODAL_CLASSES.footer}>
          <div className="flex items-center justify-end">
            <Button
              className={`
                bg-green-600 px-8 font-medium text-white
                hover:bg-green-700
              `}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MenuItemModal;
