import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, CartItem } from "@shared/schema";

export default function Store() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: cartItems = [], refetch: refetchCart } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
  });

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = async (productId: string) => {
    try {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
      await refetchCart();
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    try {
      const cartItem = cartItems.find(item => item.productId === productId);
      if (!cartItem) return;

      if (quantity <= 0) {
        await apiRequest("DELETE", `/api/cart/${cartItem.id}`, {});
      } else {
        await apiRequest("PUT", `/api/cart/${cartItem.id}`, { quantity });
      }
      await refetchCart();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart",
        variant: "destructive",
      });
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.quantity * parseFloat(item.product.price)), 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
            Spice Store
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover our premium collection of authentic spice blends, carefully crafted for the perfect flavor experience
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`
                  ${selectedCategory === category 
                    ? "bg-amber-500 hover:bg-amber-600 text-black" 
                    : "border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black"
                  }
                  transition-all duration-300
                `}
              >
                {category === "all" ? "All Products" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
            >
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.featured && (
                    <Badge className="absolute top-3 left-3 bg-amber-500 text-black hover:bg-amber-600">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">
                      {product.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-amber-400">
                      ₹{parseFloat(product.price).toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group-hover:shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>

      {/* Floating Cart Widget */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="bg-gray-900/95 border-amber-500/50 backdrop-blur-sm shadow-2xl shadow-amber-500/20 max-w-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingCart size={20} className="text-amber-500" />
                  Cart ({getTotalItems()})
                </h3>
                <Link to="/cart">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
                    View Cart
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm bg-gray-800/50 rounded p-2">
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.product.name}</p>
                      <p className="text-gray-400">₹{parseFloat(item.product.price).toFixed(0)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 border-gray-600 hover:bg-gray-700"
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="text-white mx-2 min-w-[20px] text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 border-gray-600 hover:bg-gray-700"
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <p className="text-gray-400 text-xs text-center">
                    +{cartItems.length - 3} more items
                  </p>
                )}
              </div>
              
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Total:</span>
                  <span className="text-amber-400">₹{getTotalPrice().toFixed(0)}</span>
                </div>
                <Link to="/checkout" className="block mt-2">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                    Checkout
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}