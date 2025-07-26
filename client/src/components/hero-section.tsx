import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section 
      id="home" 
      className="relative h-screen flex items-center justify-center parallax-bg"
      style={{
        backgroundImage: `linear-gradient(rgba(47, 27, 20, 0.4), rgba(139, 69, 19, 0.3)), url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')`
      }}
    >
      <div className="text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Authentic <span className="text-spice-gold">Premium</span><br />Spice Mixes
        </h1>
        <p className="text-xl md:text-2xl mb-8 font-light leading-relaxed">
          Handcrafted with love, sourced with care. Experience the true essence of authentic flavors that transform every meal into a culinary masterpiece.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-spice-gold hover:bg-spice-amber text-spice-dark px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:transform hover:scale-105"
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Our Collection
          </Button>
          <Button 
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-spice-dark px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
            onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn Our Story
          </Button>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-white text-2xl h-8 w-8" />
      </div>
    </section>
  );
}
