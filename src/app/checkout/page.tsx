"use client";

import { CreditCard, MapPin, Truck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "~/lib/cn";
import { useCart, useCartTotal, useCartTotalItems } from "~/store/useCart";
import { LocationSelector } from "~/ui/components/location-search";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { RadioGroup, RadioGroupItem } from "~/ui/primitives/radio-group";
import { Separator } from "~/ui/primitives/separator";
import { Textarea } from "~/ui/primitives/textarea";

interface CustomerInfo {
  customerPhone: string;
  firstName: string;
  lastName: string;
}
interface DeliveryInfo {
  address: string;
  city: string;
  instructions?: string;
  phone: string;
}
interface OrderSummary {
  customizationTotal: number;
  deliveryFee: number;
  processingFee: number;
  subtotal: number;
  total: number;
}

// Types
type OrderType = "delivery" | "pickup";

type PaymentMethod = "cash" | "credit_card" | "digital_wallet";

// Fee Configuration
const DELIVERY_FEE = 150; // PKR
const PROCESSING_FEES = {
  cash: 0,
  credit_card: 0.01,
  digital_wallet: 0, // 1.5%
};

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart, getCartForAPI, items: cartItems } = useCart();
  const cartTotal = useCartTotal();
  const totalItems = useCartTotalItems();

  // Form state
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerPhone: "",
    firstName: "",
    lastName: "",
  });
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    address: "",
    city: "",
    instructions: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mb-6 text-muted-foreground">
            Add some items to your cart to proceed with checkout.
          </p>
          <Button onClick={() => router.push("/menu")}>Browse Menu</Button>
        </div>
      </div>
    );
  }

  // Calculate fees and totals
  const calculateOrderSummary = (): OrderSummary => {
    const baseTotal = cartTotal;

    const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
    const processingFeeRate = PROCESSING_FEES[paymentMethod];
    const processingFee = Math.round(baseTotal * processingFeeRate);

    const total = baseTotal + deliveryFee + processingFee;

    return {
      customizationTotal: baseTotal,
      deliveryFee,
      processingFee,
      subtotal: cartTotal,
      total,
    };
  };

  const orderSummary = calculateOrderSummary();

  // Format customizations for display
  const getItemCustomizationsText = (item: (typeof cartItems)[0]): string => {
    const selectedCustomizations = item.customizations
      .map((customization) => {
        const selectedOptions = customization.options
          .filter((option) => option.selected)
          .map((option) => option.name);

        if (selectedOptions.length > 0) {
          return `${customization.title}: ${selectedOptions.join(", ")}`;
        }
        return null;
      })
      .filter(Boolean);

    return selectedCustomizations.join(" | ");
  };

  // Calculate item display price
  const getItemDisplayPrice = (item: (typeof cartItems)[0]) => {
    const basePrice = item.menuItem.price;
    const customizationPrice = item.customizations.reduce(
      (sum, customization) => {
        return (
          sum +
          customization.options
            .filter((option) => option.selected)
            .reduce((optionSum, option) => optionSum + option.priceModifier, 0)
        );
      },
      0
    );
    return (basePrice + customizationPrice) * item.quantity;
  };

  // Handle form submission
  const handlePlaceOrder = async () => {
    setIsLoading(true);

    try {
      // Prepare order data
      const orderData = {
        customerInfo,
        items: getCartForAPI(),
        orderType,
        paymentMethod,
        ...(orderType === "delivery" && { deliveryInfo }),
        orderSummary,
        totalItems,
      };

      console.log("Order Data:", orderData);

      // TODO: Replace with your actual API call
      // const response = await createOrder(orderData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart and redirect to success page
      clearCart();
      router.push("/order-success");
    } catch (error) {
      console.error("Order placement failed:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  // Form validation
  const isFormValid = () => {
    const customerValid =
      customerInfo.firstName &&
      customerInfo.lastName &&
      customerInfo.customerPhone;
    const deliveryValid =
      orderType === "pickup" ||
      (deliveryInfo.address && deliveryInfo.city && deliveryInfo.phone);
    return customerValid && deliveryValid;
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">
          Review your order and complete your purchase
        </p>
      </div>

      <div
        className={`
          grid gap-8
          lg:grid-cols-2
        `}
      >
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`
                  grid gap-4
                  sm:grid-cols-2
                `}
              >
                <div>
                  <Label className="mb-2" htmlFor="firstName">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="Enter your first name"
                    value={customerInfo.firstName}
                  />
                </div>
                <div>
                  <Label className="mb-2" htmlFor="lastName">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Enter your last name"
                    value={customerInfo.lastName}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2" htmlFor="customerPhone">
                  Phone Number *
                </Label>
                <Input
                  id="customerPhone"
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Enter your phone number"
                  value={customerInfo.customerPhone}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                onValueChange={(value: OrderType) => setOrderType(value)}
                value={orderType}
              >
                <div
                  className={`
                    flex items-center space-x-2 rounded-lg border p-3
                    hover:bg-gray-50
                  `}
                >
                  <RadioGroupItem id="delivery" value="delivery" />
                  <Label className="flex-1 cursor-pointer" htmlFor="delivery">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Get it delivered to your door
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div
                  className={`
                    flex items-center space-x-2 rounded-lg border p-3
                    hover:bg-gray-50
                  `}
                >
                  <RadioGroupItem id="pickup" value="pickup" />
                  <Label className="flex-1 cursor-pointer" htmlFor="pickup">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pickup</p>
                        <p className="text-sm text-muted-foreground">
                          Collect from our store
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Delivery Information (shown only for delivery) */}
          {orderType === "delivery" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2" htmlFor="address">
                    Address *
                  </Label>
                  <Textarea
                    id="address"
                    onChange={(e) =>
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    value={deliveryInfo.address}
                  />
                </div>

                {/* Location Selector */}
                <div>
                  <Label className="mb-2">Pin Your Location</Label>
                  <LocationSelector
                    onLocationSelect={(data) => {
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        address: data.address,
                        latitude: data.coordinates.lat,
                        longitude: data.coordinates.lng,
                      }));
                    }}
                  />
                </div>

                <div>
                  <Label className="mb-2" htmlFor="instructions">
                    Delivery Instructions (Optional)
                  </Label>
                  <Textarea
                    id="instructions"
                    onChange={(e) =>
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                    placeholder="Any special instructions for delivery (e.g., building name, floor, landmarks)"
                    rows={2}
                    value={deliveryInfo.instructions}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                onValueChange={(value: PaymentMethod) =>
                  setPaymentMethod(value)
                }
                value={paymentMethod}
              >
                <div
                  className={`
                    flex items-center space-x-2 rounded-lg border p-3
                    hover:bg-gray-50
                  `}
                >
                  <RadioGroupItem id="cash" value="cash" />
                  <Label className="flex-1 cursor-pointer" htmlFor="cash">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Pay when you receive your order
                        </p>
                      </div>
                      <span className="ml-4 text-sm font-medium text-gray-500">
                        No Fee
                      </span>
                    </div>
                  </Label>
                </div>
                <div
                  className={`
                    flex items-center space-x-2 rounded-lg border p-3
                    hover:bg-gray-50
                  `}
                >
                  <RadioGroupItem id="credit_card" value="credit_card" />
                  <Label
                    className="flex-1 cursor-pointer"
                    htmlFor="credit_card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-muted-foreground">
                          Pay securely with your card
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div
                  className={`
                    flex items-center space-x-2 rounded-lg border p-3
                    hover:bg-gray-50
                  `}
                >
                  <RadioGroupItem id="digital_wallet" value="digital_wallet" />
                  <Label
                    className="flex-1 cursor-pointer"
                    htmlFor="digital_wallet"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">JazzCash Wallet</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary ({totalItems} items)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    className={`
                      flex gap-3 border-b pb-4
                      last:border-b-0 last:pb-0
                    `}
                    key={item.id}
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded">
                      <img
                        alt={item.menuItem.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="flex h-full w-full items-center justify-center bg-gray-200"><span class="text-xs text-gray-400">No Image</span></div>';
                          }
                        }}
                        src={item.menuItem.image}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">
                        {item.menuItem.name}
                      </h4>
                      {getItemCustomizationsText(item) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {getItemCustomizationsText(item)}
                        </p>
                      )}
                      {item.notes && (
                        <p className="mt-1 text-xs text-muted-foreground italic">
                          Note: {item.notes}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-medium">
                          PKR {getItemDisplayPrice(item).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>PKR {orderSummary.subtotal.toFixed(2)}</span>
              </div>
              {orderSummary.customizationTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Customizations</span>
                  <span>PKR {orderSummary.customizationTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span
                  className={cn(
                    orderSummary.deliveryFee === 0 && "text-green-600"
                  )}
                >
                  {orderSummary.deliveryFee === 0
                    ? "Free"
                    : `PKR ${orderSummary.deliveryFee.toFixed(2)}`}
                </span>
              </div>
              {orderSummary.processingFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>
                    Processing Fee (
                    {(PROCESSING_FEES[paymentMethod] * 100).toFixed(1)}%)
                  </span>
                  <span>PKR {orderSummary.processingFee.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>PKR {orderSummary.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button
            className="w-full"
            disabled={!isFormValid() || isLoading}
            onClick={handlePlaceOrder}
            size="lg"
          >
            {isLoading
              ? "Placing Order..."
              : `Place Order - PKR ${orderSummary.total.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
