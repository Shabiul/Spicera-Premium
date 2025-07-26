import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full glass-dark z-50 shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-display font-bold text-spice-gold hover:scale-105 transition-transform duration-300">Spicera Premium</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#home" className="text-white hover:text-spice-gold transition-all duration-300 font-medium relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spice-gold transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#products" className="text-white hover:text-spice-gold transition-all duration-300 font-medium relative group">
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spice-gold transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#story" className="text-white hover:text-spice-gold transition-all duration-300 font-medium relative group">
                Our Story
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spice-gold transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#quality" className="text-white hover:text-spice-gold transition-all duration-300 font-medium relative group">
                Quality
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spice-gold transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#contact" className="text-white hover:text-spice-gold transition-all duration-300 font-medium relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-spice-gold transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>
          
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-white hover:text-spice-gold"
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
              <a href="#home" className="block px-3 py-2 text-white hover:text-spice-gold transition-colors font-medium">Home</a>
              <a href="#products" className="block px-3 py-2 text-white hover:text-spice-gold transition-colors font-medium">Products</a>
              <a href="#story" className="block px-3 py-2 text-white hover:text-spice-gold transition-colors font-medium">Our Story</a>
              <a href="#quality" className="block px-3 py-2 text-white hover:text-spice-gold transition-colors font-medium">Quality</a>
              <a href="#contact" className="block px-3 py-2 text-white hover:text-spice-gold transition-colors font-medium">Contact</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}