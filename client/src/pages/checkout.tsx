import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { CreditCard, MapPin, User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CartItemWithProduct {
  id: string;
  sessionId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    category: string;
    stock: number;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(10, "Please enter a complete shipping address"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id.slice(-8)} has been confirmed.`,
      });
      setLocation("/order-confirmation");
    },
    onError: (error: any) => {
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    createOrderMutation.mutate(data);
  };

  const subtotal = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );

  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 text-lg mb-8">
              You need items in your cart to proceed with checkout.
            </p>
            <Button 
              onClick={() => setLocation("/store")}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-gray-400">Complete your order information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your full name"
                              className="bg-gray-800 border-gray-700 text-white focus:border-amber-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              placeholder="Enter your email address"
                              className="bg-gray-800 border-gray-700 text-white focus:border-amber-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            Phone Number (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="tel"
                              placeholder="Enter your phone number"
                              className="bg-gray-800 border-gray-700 text-white focus:border-amber-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Shipping Address
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Enter your complete shipping address including street, city, state, and zip code"
                              className="bg-gray-800 border-gray-700 text-white focus:border-amber-500 min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={createOrderMutation.isPending}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 mt-8"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 pb-3 border-b border-gray-700">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-medium text-white">{item.product.name}</h4>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-amber-400">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-500" : ""}>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal < 50 && shipping > 0 && (
                    <p className="text-xs text-gray-500">
                      Free shipping on orders over $50
                    </p>
                  )}
                  <div className="border-t border-gray-700 pt-2">
                    <div className="flex justify-between text-lg font-semibold text-white">
                      <span>Total</span>
                      <span className="text-amber-400">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}