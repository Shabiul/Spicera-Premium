import { Sprout, ChefHat, Award, Truck } from "lucide-react";

const qualityPoints = [
  {
    icon: Sprout,
    title: "Source Direct",
    description: "We work directly with farmers and cooperatives to ensure the highest quality and fair pricing for our premium ingredients."
  },
  {
    icon: ChefHat,
    title: "Small Batch",
    description: "Every blend is carefully crafted in small batches to maintain freshness and ensure consistent quality in every jar."
  },
  {
    icon: Award,
    title: "Quality Tested",
    description: "Each ingredient undergoes rigorous quality testing for purity, potency, and flavor to meet our premium standards."
  },
  {
    icon: Truck,
    title: "Fresh Delivery",
    description: "We grind and package to order, ensuring you receive the freshest possible spices with maximum flavor and aroma."
  }
];

export default function QualitySection() {
  return (
    <section id="quality" className="py-20 bg-gradient-to-br from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-spice-gold">Why Choose Spicera Premium</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">Our commitment to quality sets us apart</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {qualityPoints.map((point, index) => {
            const IconComponent = point.icon;
            return (
              <div key={index} className="text-center fade-in hover-lift">
                <div className="bg-spice-gold p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center hover:scale-110 transition-all duration-300 hover-glow hover-rotate">
                  <IconComponent className="text-black h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-4 text-white">{point.title}</h3>
                <p className="opacity-90">{point.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}