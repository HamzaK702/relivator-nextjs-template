"use client";

import { useEffect, useState } from "react";

import { useCart } from "~/store/useCart";

interface CartHydrationWrapperProps {
  children: React.ReactNode;
}

export function CartHydrationWrapper({ children }: CartHydrationWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const setHasHydrated = useCart((state) => state.setHasHydrated);

  useEffect(() => {
    // Mark as hydrated on client side
    setIsHydrated(true);
    setHasHydrated(true);
  }, [setHasHydrated]);

  // Don't render cart-dependent components until hydrated
  if (!isHydrated) {
    return (
      <div className="relative">
        <div
          className={`
          h-9 w-9 animate-pulse rounded-full border border-gray-200 bg-gray-100
        `}
        />
      </div>
    );
  }

  return <>{children}</>;
}
