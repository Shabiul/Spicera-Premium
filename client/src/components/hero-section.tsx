import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section 
      id="home" 
      className="relative h-screen flex items-center justify-center parallax-bg"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5)), url('/src/assets/images/spices/biryani-masala.jpg')`
      }}
    >
      <div className="text-center text-gray-900 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight hover-float">
          <span className="text-black">SPICERA</span> <span className="text-black hover-glow">PREMIUM</span><br />Spice Mixes
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-8 font-light leading-relaxed max-w-3xl mx-auto fade-in">
          Handcrafted with love, sourced with care. Experience the true essence of authentic flavors that transform every meal into a culinary masterpiece.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in">
          <Button 
            className="bg-primary hover:bg-primary/80 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-500 hover:transform hover:scale-110 hover:shadow-2xl hover-glow w-full sm:w-auto"
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Our Collection
          </Button>
          <Button 
            variant="outline"
            className="glass border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-500 hover:transform hover:scale-110 w-full sm:w-auto"
            onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn Our Story
          </Button>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hover:animate-none transition-all duration-300">
        <div className="glass-card p-3 rounded-full">
          <ChevronDown className="text-primary text-2xl h-8 w-8" />
        </div>
      </div>
    </section>
  );
}