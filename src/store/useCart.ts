import * as React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  MenuItem,
  MenuItemCustomization,
  MenuItemStatusEnum,
} from "~/network/types/menu-item-response";

export interface MenuItemCustomizationOption {
  customizationOptionId: string;
  name: string;
  priceModifier: number;
}

interface CartCustomization extends Omit<MenuItemCustomization, "options"> {
  options: CartCustomizationOption[];
}

interface CartCustomizationOption extends MenuItemCustomizationOption {
  selected: boolean;
}

interface CartItem {
  addedAt: number;
  customizations: CartCustomization[];
  id: string;
  menuItem: MenuItem;
  menuItemId: string;
  notes?: string;
  quantity: number;
}

interface CartState {
  _hasHydrated: boolean;

  addToCart: (
    menuItem: MenuItem,
    selectedCustomizations?: Record<string, string[]>,
    quantity?: number,
    notes?: string
  ) => string;
  clearCart: () => void;

  clearCustomizationSelections: (
    cartItemId: string,
    customizationId: string
  ) => void;

  deselectCustomizationOption: (
    cartItemId: string,
    customizationId: string,
    optionId: string
  ) => void;
  duplicateCartItem: (cartItemId: string) => string;
  getCartForAPI: () => {
    amount: number;
    customizations: OrderCustomizationInput[];
    menuItemId: string;
  }[];
  getCartItem: (cartItemId: string) => CartItem | undefined;

  getCartItemsByMenuId: (menuItemId: string) => CartItem[];
  getCartSummary: () => CartSummary;
  getItemQuantityInCart: (menuItemId: string) => number;
  isItemInCart: (menuItemId: string) => boolean;
  items: CartItem[];

  lastUpdated: null | number;
  removeAllInstancesOfMenuItem: (menuItemId: string) => void;
  removeFromCart: (cartItemId: string) => void;
  selectCustomizationOption: (
    cartItemId: string,
    customizationId: string,
    optionId: string
  ) => void;
  setCustomizationSelections: (
    cartItemId: string,
    customizationId: string,
    optionIds: string[]
  ) => void;

  setHasHydrated: (hasHydrated: boolean) => void;
  toggleCustomizationOption: (
    cartItemId: string,
    customizationId: string,
    optionId: string
  ) => void;

  updateNotes: (cartItemId: string, notes: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;

  validateCart: () => {
    errors: string[];
    isValid: boolean;
  };

  validateCartItem: (cartItemId: string) => {
    errors: string[];
    isValid: boolean;
  };
}

interface CartSummary {
  customizationTotal: number;
  itemCount: number;
  subtotal: number;
  total: number;
  totalItems: number;
}

interface OrderCustomizationInput {
  customizationId: string;
  selections: OrderSelectionInput[];
}

interface OrderSelectionInput {
  customizationOptionId: string;
}

// Default cart summary for non-hydrated state
const defaultCartSummary: CartSummary = {
  customizationTotal: 0,
  itemCount: 0,
  subtotal: 0,
  total: 0,
  totalItems: 0,
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,

      addToCart: (
        menuItem,
        selectedCustomizations = {},
        quantity = 1,
        notes = ""
      ) => {
        const cartItemId = `cart_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        const cartCustomizations: CartCustomization[] =
          menuItem.customizations.map((customization) => ({
            ...customization,
            options: customization.options.map((option) => ({
              ...option,
              selected:
                selectedCustomizations[customization.customizationId]?.includes(
                  option.customizationOptionId
                ) || false,
            })),
          }));

        const newItem: CartItem = {
          addedAt: Date.now(),
          customizations: cartCustomizations,
          id: cartItemId,
          menuItem,
          menuItemId: menuItem.menuItemId,
          notes,
          quantity,
        };

        set((state) => ({
          items: [...state.items, newItem],
          lastUpdated: Date.now(),
        }));

        return cartItemId;
      },

      clearCart: () => {
        set({
          items: [],
          lastUpdated: Date.now(),
        });
      },
      clearCustomizationSelections: (cartItemId, customizationId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== cartItemId) return item;

            return {
              ...item,
              customizations: item.customizations.map((customization) => {
                if (customization.customizationId !== customizationId)
                  return customization;

                return {
                  ...customization,
                  options: customization.options.map((option) => ({
                    ...option,
                    selected: false,
                  })),
                };
              }),
            };
          }),
          lastUpdated: Date.now(),
        }));
      },

      deselectCustomizationOption: (cartItemId, customizationId, optionId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== cartItemId) return item;

            return {
              ...item,
              customizations: item.customizations.map((customization) => {
                if (customization.customizationId !== customizationId)
                  return customization;

                return {
                  ...customization,
                  options: customization.options.map((option) =>
                    option.customizationOptionId === optionId
                      ? { ...option, selected: false }
                      : option
                  ),
                };
              }),
            };
          }),
          lastUpdated: Date.now(),
        }));
      },

      duplicateCartItem: (cartItemId) => {
        const itemToDuplicate = get().getCartItem(cartItemId);
        if (!itemToDuplicate) {
          throw new Error(`Cart item with ID ${cartItemId} not found`);
        }

        const newCartItemId = `cart_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const duplicatedItem: CartItem = {
          ...itemToDuplicate,
          addedAt: Date.now(),
          id: newCartItemId,
        };

        set((state) => ({
          items: [...state.items, duplicatedItem],
          lastUpdated: Date.now(),
        }));

        return newCartItemId;
      },

      getCartForAPI: () => {
        const { items } = get();
        return items.map((item) => ({
          amount: item.quantity,
          customizations: item.customizations
            .map((customization) => ({
              customizationId: customization.customizationId,
              selections: customization.options
                .filter((option) => option.selected)
                .map((option) => ({
                  customizationOptionId: option.customizationOptionId,
                })),
            }))
            .filter((customization) => customization.selections.length > 0),
          menuItemId: item.menuItemId,
        }));
      },

      getCartItem: (cartItemId) => {
        return get().items.find((item) => item.id === cartItemId);
      },

      getCartItemsByMenuId: (menuItemId) => {
        return get().items.filter((item) => item.menuItemId === menuItemId);
      },

      getCartSummary: () => {
        const { items } = get();

        const itemCount = items.length;
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

        let subtotal = 0;
        let customizationTotal = 0;

        items.forEach((item) => {
          const baseItemTotal = item.menuItem.price * item.quantity;
          subtotal += baseItemTotal;

          const customizationPrice = item.customizations.reduce(
            (sum, customization) => {
              const selectedOptionsPrice = customization.options
                .filter((option) => option.selected)
                .reduce(
                  (optionSum, option) => optionSum + option.priceModifier,
                  0
                );
              return sum + selectedOptionsPrice;
            },
            0
          );
          customizationTotal += customizationPrice * item.quantity;
        });

        const total = subtotal + customizationTotal;

        return {
          customizationTotal,
          itemCount,
          subtotal,
          total,
          totalItems,
        };
      },

      getItemQuantityInCart: (menuItemId) => {
        return get()
          .items.filter((item) => item.menuItemId === menuItemId)
          .reduce((sum, item) => sum + item.quantity, 0);
      },

      isItemInCart: (menuItemId) => {
        return get().items.some((item) => item.menuItemId === menuItemId);
      },

      items: [],

      lastUpdated: null,

      removeAllInstancesOfMenuItem: (menuItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.menuItemId !== menuItemId),
          lastUpdated: Date.now(),
        }));
      },

      removeFromCart: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
          lastUpdated: Date.now(),
        }));
      },

      selectCustomizationOption: (cartItemId, customizationId, optionId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== cartItemId) return item;

            return {
              ...item,
              customizations: item.customizations.map((customization) => {
                if (customization.customizationId !== customizationId)
                  return customization;

                const currentlySelected = customization.options.filter(
                  (opt) => opt.selected
                );

                if (customization.selectionType === "SINGLE") {
                  return {
                    ...customization,
                    options: customization.options.map((option) => ({
                      ...option,
                      selected: option.customizationOptionId === optionId,
                    })),
                  };
                }

                if (customization.selectionType === "MULTIPLE") {
                  if (
                    currentlySelected.length >= customization.limit &&
                    customization.limit > 0
                  ) {
                    const targetOption = customization.options.find(
                      (opt) => opt.customizationOptionId === optionId
                    );
                    if (targetOption && !targetOption.selected) {
                      return customization;
                    }
                  }

                  return {
                    ...customization,
                    options: customization.options.map((option) =>
                      option.customizationOptionId === optionId
                        ? { ...option, selected: true }
                        : option
                    ),
                  };
                }

                return customization;
              }),
            };
          }),
          lastUpdated: Date.now(),
        }));
      },

      setCustomizationSelections: (cartItemId, customizationId, optionIds) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== cartItemId) return item;

            return {
              ...item,
              customizations: item.customizations.map((customization) => {
                if (customization.customizationId !== customizationId)
                  return customization;

                return {
                  ...customization,
                  options: customization.options.map((option) => ({
                    ...option,
                    selected: optionIds.includes(option.customizationOptionId),
                  })),
                };
              }),
            };
          }),
          lastUpdated: Date.now(),
        }));
      },

      setHasHydrated: (hasHydrated: boolean) =>
        set({ _hasHydrated: hasHydrated }),

      toggleCustomizationOption: (cartItemId, customizationId, optionId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== cartItemId) return item;

            return {
              ...item,
              customizations: item.customizations.map((customization) => {
                if (customization.customizationId !== customizationId)
                  return customization;

                const currentOption = customization.options.find(
                  (opt) => opt.customizationOptionId === optionId
                );
                if (!currentOption) return customization;

                const currentlySelected = customization.options.filter(
                  (opt) => opt.selected
                );
                const isSelecting = !currentOption.selected;

                if (customization.selectionType === "SINGLE") {
                  return {
                    ...customization,
                    options: customization.options.map((option) => ({
                      ...option,
                      selected:
                        option.customizationOptionId === optionId
                          ? isSelecting
                          : false,
                    })),
                  };
                }

                if (customization.selectionType === "MULTIPLE") {
                  if (
                    isSelecting &&
                    currentlySelected.length >= customization.limit &&
                    customization.limit > 0
                  ) {
                    return customization;
                  }

                  return {
                    ...customization,
                    options: customization.options.map((option) =>
                      option.customizationOptionId === optionId
                        ? { ...option, selected: !option.selected }
                        : option
                    ),
                  };
                }

                return customization;
              }),
            };
          }),
          lastUpdated: Date.now(),
        }));
      },

      updateNotes: (cartItemId, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId ? { ...item, notes } : item
          ),
          lastUpdated: Date.now(),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(cartItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item
          ),
          lastUpdated: Date.now(),
        }));
      },

      validateCart: () => {
        const { items } = get();
        const errors: string[] = [];
        let isValid = true;

        if (items.length === 0) {
          errors.push("Cart is empty");
          isValid = false;
        }

        items.forEach((item) => {
          const itemValidation = get().validateCartItem(item.id);
          if (!itemValidation.isValid) {
            errors.push(...itemValidation.errors);
            isValid = false;
          }
        });

        return { errors, isValid };
      },

      validateCartItem: (cartItemId) => {
        const item = get().getCartItem(cartItemId);
        const errors: string[] = [];
        let isValid = true;

        if (!item) {
          errors.push(`Cart item with ID ${cartItemId} not found`);
          return { errors, isValid: false };
        }

        if (item.quantity <= 0) {
          errors.push(
            `Item "${item.menuItem.name}" has invalid quantity: ${item.quantity}`
          );
          isValid = false;
        }

        if (item.menuItem.status !== MenuItemStatusEnum.AVAILABLE) {
          errors.push(`Item "${item.menuItem.name}" is not available`);
          isValid = false;
        }

        item.customizations.forEach((customization) => {
          const selectedOptions = customization.options.filter(
            (opt) => opt.selected
          );

          if (customization.isRequired && selectedOptions.length === 0) {
            errors.push(
              `Required customization "${customization.title}" for item "${item.menuItem.name}" has no selection`
            );
            isValid = false;
          }

          if (
            customization.limit > 0 &&
            selectedOptions.length > customization.limit
          ) {
            errors.push(
              `Too many selections for "${customization.title}" in item "${item.menuItem.name}". Limit: ${customization.limit}, Selected: ${selectedOptions.length}`
            );
            isValid = false;
          }

          if (
            customization.selectionType === "SINGLE" &&
            selectedOptions.length > 1
          ) {
            errors.push(
              `Multiple selections for single-choice customization "${customization.title}" in item "${item.menuItem.name}"`
            );
            isValid = false;
          }
        });

        return { errors, isValid };
      },
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Create stable selector functions outside of hooks to prevent infinite loops
const selectCartSummary = (state: CartState) =>
  state._hasHydrated ? state.getCartSummary() : defaultCartSummary;

const selectCartItemCount = (state: CartState) =>
  state._hasHydrated ? state.items.length : 0;

const selectCartTotalItems = (state: CartState) =>
  state._hasHydrated
    ? state.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

const selectCartTotal = (state: CartState) =>
  state._hasHydrated ? state.getCartSummary().total : 0;

const selectClearCart = (state: CartState) => state.clearCart;

// Hydration-safe hooks with stable selectors
export const useCartSummary = () => {
  return useCart(selectCartSummary);
};

export const useCartItemCount = () => {
  return useCart(selectCartItemCount);
};

export const useCartTotalItems = () => {
  return useCart(selectCartTotalItems);
};

export const useCartTotal = () => {
  return useCart(selectCartTotal);
};

// For parameterized selectors, use useMemo to make them stable per parameter
export const useIsItemInCart = (menuItemId: string) => {
  const selector = React.useMemo(
    () => (state: CartState) =>
      state._hasHydrated ? state.isItemInCart(menuItemId) : false,
    [menuItemId]
  );
  return useCart(selector);
};

export const useItemQuantityInCart = (menuItemId: string) => {
  const selector = React.useMemo(
    () => (state: CartState) =>
      state._hasHydrated ? state.getItemQuantityInCart(menuItemId) : 0,
    [menuItemId]
  );
  return useCart(selector);
};

export const useCartManager = () => {
  const clearCart = useCart(selectClearCart);

  const resetCart = React.useCallback(() => {
    clearCart();
  }, [clearCart]);

  const addItemWithCustomizations = React.useCallback(
    (
      menuItem: MenuItem,
      customizationSelections: Record<string, string[]>,
      quantity = 1,
      notes = ""
    ) => {
      const addToCart = useCart.getState().addToCart;
      return addToCart(menuItem, customizationSelections, quantity, notes);
    },
    []
  );

  return React.useMemo(
    () => ({
      addItemWithCustomizations,
      resetCart,
    }),
    [addItemWithCustomizations, resetCart]
  );
};
