import { Button } from "@/components/ui/button";

const featuredProducts = [
  {
    id: 1,
    name: "Royal Garam Masala",
    description: "A harmonious blend of 12 carefully selected whole spices, roasted to perfection and ground fresh. Our signature blend brings warmth and complexity to any dish.",
    price: "From $24.99",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    id: 2,
    name: "Heritage Curry Powder",
    description: "An authentic family recipe passed down through generations. Featuring turmeric, coriander, and cumin with a perfect balance of heat and aroma.",
    price: "From $19.99",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    id: 3,
    name: "Artisan Chai Masala",
    description: "Experience the perfect cup of chai with our carefully crafted blend of cardamom, cinnamon, ginger, and cloves. Each sip transports you to Indian tea gardens.",
    price: "From $22.99",
    image: "https://images.unsplash.com/photo-1575467678930-c7acd65d6470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  }
];

const fullCollection = [
  {
    name: "Ethiopian Berbere",
    description: "Complex, fiery blend with over 15 spices",
    price: "$26.99",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Ras el Hanout",
    description: "Moroccan magic in every pinch",
    price: "$28.99",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Five Spice Blend",
    description: "Traditional Chinese aromatic harmony",
    price: "$21.99",
    image: "https://images.unsplash.com/photo-1575467678930-c7acd65d6470?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  },
  {
    name: "Premium Za'atar",
    description: "Middle Eastern herb and spice medley",
    price: "$18.99",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
  }
];

export default function ProductsSection() {
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
              <div key={product.id} className={`hover-lift glass-card rounded-2xl overflow-hidden shadow-lg border border-gray-200 ${index % 2 === 0 ? 'fade-in-left' : 'fade-in-right'}`}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 lg:p-8">
                  <h3 className="font-display text-xl lg:text-2xl font-semibold text-white mb-3">{product.name}</h3>
                  <p className="text-gray-300 mb-4 text-sm lg:text-base">{product.description}</p>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-spice-gold font-semibold text-lg">{product.price}</span>
                    <Button className="bg-spice-gold text-black px-6 py-2 rounded-full hover:bg-spice-amber transition-all duration-300 hover:transform hover:scale-105 hover-glow w-full sm:w-auto">
                      View Details
                    </Button>
                  </div>
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
            {fullCollection.map((product, index) => (
              <div key={index} className="hover-lift glass-card bg-gray-900/50 rounded-xl p-6 text-center fade-in border border-gray-800/50 hover-rotate">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-display text-lg lg:text-xl font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-gray-400 text-xs lg:text-sm mb-4">{product.description}</p>
                <span className="text-spice-gold font-bold text-lg">{product.price}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 fade-in">
            <Button className="bg-spice-gold hover:bg-spice-amber text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-500 hover:transform hover:scale-110 hover:shadow-2xl hover-glow">
              View Complete Catalog
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}