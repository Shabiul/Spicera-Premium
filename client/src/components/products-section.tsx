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
    <>
      {/* Featured Products Preview */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Premium Spice Collection</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Each blend tells a story of tradition, quality, and passion</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="relative mb-4">
                  <img 
                    src={`https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80`} 
                    alt={product.name} 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {product.featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">
                      Featured
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-gray-300 mb-4 text-sm">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-500 font-bold text-lg">${product.price}</span>
                  <Button 
                    onClick={() => addToCart(product.id, product.name)}
                    className="bg-yellow-500 text-black hover:bg-yellow-600 px-4 py-2 rounded flex items-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Products Showcase */}
      <section id="products" className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-spice-gold mb-4">Complete Collection</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Discover our full range of premium spice blends</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {allProducts.map((product, index) => (
              <div key={product.id} className="bg-gray-900 rounded-xl p-4 border border-gray-700 text-center">
                <div className="relative mb-4">
                  <img 
                    src={`https://images.unsplash.com/photo-${index % 2 === 0 ? '1596040033229-a9821ebd058d' : '1506905925346-21bda4d32df4'}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80`} 
                    alt={product.name} 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {getCartQuantity(product.id) > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {getCartQuantity(product.id)}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                <p className="text-gray-400 text-xs mb-3">{product.description.slice(0, 80)}...</p>
                <div className="flex flex-col gap-2">
                  <span className="text-yellow-500 font-bold">${product.price}</span>
                  <Button 
                    onClick={() => addToCart(product.id, product.name)}
                    size="sm"
                    className="bg-yellow-500 text-black hover:bg-yellow-600 text-xs px-3 py-1 rounded flex items-center gap-1 justify-center"
                  >
                    <Plus size={12} />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 fade-in">
            <Link to="/store">
              <Button className="bg-spice-gold hover:bg-spice-amber text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-500 hover:transform hover:scale-110 hover:shadow-2xl hover-glow">
                View Complete Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}