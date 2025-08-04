import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ShoppingCart, User, LogOut, Settings, History } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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
            <Link to="/">
              <h1 className="text-2xl font-display font-bold text-gray-900 hover:text-primary hover:scale-105 transition-all duration-300 cursor-pointer">Spicera Premium</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <a href="#home" className="text-gray-900 hover:text-primary transition-all duration-300 font-medium relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#products" className="text-black hover:text-primary transition-all duration-300 font-medium relative group">
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <Link to="/store" className="text-gray-900 hover:text-primary transition-all duration-300 font-medium relative group">
                Store
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <a href="#story" className="text-black hover:text-primary transition-all duration-300 font-medium relative group">
                Our Story
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#contact" className="text-black hover:text-primary transition-all duration-300 font-medium relative group">
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
              
              {/* Authentication Section */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer">
                        <History className="mr-2 h-4 w-4" />
                        Order History
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={async () => await logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-black hover:text-primary"
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
              <a href="#home" className="block px-3 py-2 text-black hover:text-primary transition-colors font-medium">Home</a>
            <a href="#products" className="block px-3 py-2 text-black hover:text-primary transition-colors font-medium">Products</a>
            <Link to="/store" className="block px-3 py-2 text-black hover:text-primary transition-colors font-medium">Store</Link>
            <a href="#story" className="block px-3 py-2 text-black hover:text-primary transition-colors font-medium">Our Story</a>
            <a href="#contact" className="block px-3 py-2 text-black hover:text-primary transition-colors font-medium">Contact</a>
            <Link to="/cart" className="flex items-center justify-between px-3 py-2 text-black hover:text-primary transition-colors font-medium">
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
              
              {/* Mobile Authentication Section */}
              {user ? (
                <>
                  <div className="px-3 py-2 text-black border-t border-gray-600 mt-2">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <Link to="/profile" className="block px-3 py-2 text-black hover:text-primary transition-colors font-medium">
                    <User className="w-4 h-4 mr-2 inline" />
                    Profile
                  </Link>
                  <Link to="/orders" className="block px-3 py-2 text-black hover:text-primary transition-colors font-medium">
                    <History className="w-4 h-4 mr-2 inline" />
                    Order History
                  </Link>
                  <button
                    onClick={async () => await logout()}
                    className="block w-full text-left px-3 py-2 text-black hover:text-primary transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2 inline" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-black hover:text-primary transition-colors font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="block px-3 py-2 text-black hover:text-primary transition-colors font-medium">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}