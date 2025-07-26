import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Anderson",
    role: "Home Chef",
    initials: "SA",
    rating: 5,
    content: "The garam masala is absolutely incredible. You can taste the difference quality makes. My curries have never been better!"
  },
  {
    name: "Chef Michael Rodriguez",
    role: "Executive Chef",
    initials: "MR",
    rating: 5,
    content: "As a professional chef, I'm very particular about my ingredients. Spicera Premium delivers restaurant-quality spices consistently."
  },
  {
    name: "Raj Patel",
    role: "Food Enthusiast",
    initials: "RP",
    rating: 5,
    content: "I love supporting a family business that cares about quality. The chai masala brings back memories of my grandmother's kitchen."
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-black mb-4">Customer Stories</h2>
          <p className="text-xl text-gray-600">Hear from our satisfied customers</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-2xl fade-in border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="text-spice-gold flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-spice-gold rounded-full flex items-center justify-center mr-4">
                  <span className="font-semibold text-black">{testimonial.initials}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-black">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}