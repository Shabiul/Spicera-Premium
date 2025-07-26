import { Leaf, Heart } from "lucide-react";

export default function StorySection() {
  return (
    <section id="story" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-black mb-6">Our Story</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Born from a passion for authentic flavors, Spicera Premium began in a small kitchen where traditional recipes met modern quality standards. Our founder's grandmother's secret spice blends inspired a journey to bring authentic, homemade spice mixes to discerning food lovers.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Every blend is carefully crafted in small batches, using only the finest ingredients sourced directly from trusted growers. We believe that great food starts with great spices, and great spices start with great care.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center">
                <div className="bg-spice-gold p-3 rounded-full mr-4">
                  <Leaf className="text-black text-xl h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-black">100% Natural</h4>
                  <p className="text-gray-600">No artificial additives</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-spice-gold p-3 rounded-full mr-4">
                  <Heart className="text-black text-xl h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-black">Handcrafted</h4>
                  <p className="text-gray-600">Made with love and care</p>
                </div>
              </div>
            </div>
          </div>
          <div className="fade-in">
            <img 
              src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Traditional spice preparation" 
              className="rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}