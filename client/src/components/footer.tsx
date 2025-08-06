import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-900 py-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-primary mb-4">Spicera Premium</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Crafting authentic, premium spice blends that bring the world's finest flavors to your kitchen. Every jar tells a story of tradition, quality, and passion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-primary p-3 rounded-full hover:bg-primary/80 transition-colors text-white">
                <Facebook className="text-black h-5 w-5" />
              </a>
              <a href="#" className="bg-primary p-3 rounded-full hover:bg-primary/80 transition-colors text-white">
                <Instagram className="text-black h-5 w-5" />
              </a>
              <a href="#" className="bg-primary p-3 rounded-full hover:bg-primary/80 transition-colors text-white">
                <Twitter className="text-black h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#products" className="hover:text-primary transition-colors">Products</a></li>
            <li><a href="#story" className="hover:text-primary transition-colors">Our Story</a></li>
            <li><a href="#quality" className="hover:text-primary transition-colors">Quality Promise</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Customer Care</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
          <p>&copy; 2025 Spicera Premium. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}