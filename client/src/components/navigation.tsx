import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Link } from "wouter";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  interface CartItemWithProduct {
    id: string;
    sessionId: string;
    productId: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
  }

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-display font-bold text-gray-900 hover:text-primary hover:scale-105 transition-all duration-300">Spicera Premium</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <a href="#home" className="text-gray-900 hover:text-primary transition-all duration-300 font-medium relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#products" className="text-white hover:text-primary transition-all duration-300 font-medium relative group">
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <Link to="/store" className="text-gray-900 hover:text-primary transition-all duration-300 font-medium relative group">
                Store
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <a href="#story" className="text-white hover:text-primary transition-all duration-300 font-medium relative group">
                Our Story
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#contact" className="text-white hover:text-primary transition-all duration-300 font-medium relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <Link to="/cart" className="relative p-2 text-gray-900 hover:text-primary transition-colors duration-300">
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-white hover:text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-dark rounded-b-lg mx-4">
              <a href="#home" className="block px-3 py-2 text-white hover:text-primary transition-colors font-medium">Home</a>
            <a href="#products" className="block px-3 py-2 text-white hover:text-primary transition-colors font-medium">Products</a>
            <Link to="/store" className="block px-3 py-2 text-white hover:text-primary transition-colors font-medium">Store</Link>
            <a href="#story" className="block px-3 py-2 text-white hover:text-primary transition-colors font-medium">Our Story</a>
            <a href="#contact" className="block px-3 py-2 text-white hover:text-primary transition-colors font-medium">Contact</a>
            <Link to="/cart" className="flex items-center justify-between px-3 py-2 text-white hover:text-primary transition-colors font-medium">
                <span className="flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                </span>
                {cartItemCount > 0 && (
                  <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}