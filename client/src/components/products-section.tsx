import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, CartItem } from "@shared/schema";

export default function ProductsSection() {
  const { toast } = useToast();

  const { data: featuredProducts = [], isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const { data: allProducts = [], isLoading: allLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: cartItems = [], refetch: refetchCart } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
  });

  const addToCart = async (productId: string, productName: string) => {
    try {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
      await refetchCart();
      toast({
        title: "Added to cart!",
        description: `${productName} has been added to your cart`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const getCartQuantity = (productId: string) => {
    const cartItem = cartItems.find((item) => item.productId === productId);
    return cartItem ? cartItem.quantity : 0;
  };





  if (featuredLoading || allLoading) {
    return (
      <div className="py-20 bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <section id="products" className="py-20 bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 fade-in">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Premium Masala Collection</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Authentic Indian spice blends crafted for perfection • All products ₹100</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {allProducts.map((product, index) => {
            const spiceImages = [
              '/src/assets/images/spices/biryani-masala.jpg', // Biryani
              '/src/assets/images/spices/korma-masala.jpg', // Korma  
              '/src/assets/images/spices/GARAM-MASALA.jpeg', // Garam
              '/src/assets/images/spices/KITCHEN-KING.jpeg'  // Kitchen King
            ];
            
            return (
              <div key={product.id} className="group hover-lift glass-card bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300">
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={spiceImages[index] || spiceImages[0]} 
                    alt={product.name} 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {getCartQuantity(product.id) > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold animate-pulse">
                      {getCartQuantity(product.id)}
                    </Badge>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <span className="text-2xl font-bold text-amber-400">₹{product.price}</span>
                    <Button 
                      onClick={() => addToCart(product.id, product.name)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-16 fade-in">
          <Link to="/store">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-500 hover:transform hover:scale-110 hover:shadow-2xl">
              Explore Our Store
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}