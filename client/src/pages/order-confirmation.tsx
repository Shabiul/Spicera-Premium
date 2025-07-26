import { CheckCircle, Package, Truck, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderConfirmation() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Order Confirmed!
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Thank you for your order. We've received your purchase and will begin processing it shortly.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white text-left">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Order Processing</h3>
                    <p className="text-sm text-gray-400">
                      We're carefully preparing your premium spices for shipment. This typically takes 1-2 business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Shipping</h3>
                    <p className="text-sm text-gray-400">
                      Your order will be shipped via our premium carrier and you'll receive tracking information by email.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Delivery</h3>
                    <p className="text-sm text-gray-400">
                      Your authentic spice blends will arrive fresh and ready to transform your cooking experience.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border border-amber-500/20 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-amber-400 mb-2">Order Confirmation Email</h3>
            <p className="text-gray-300 text-sm">
              A detailed confirmation email has been sent to your inbox with your order details and tracking information once available.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3">
                Back to Home
              </Button>
            </Link>
            <Link to="/store">
              <Button 
                variant="outline" 
                className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black px-8 py-3"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Questions about your order? Contact us at{" "}
              <a href="mailto:orders@spicera.com" className="text-amber-500 hover:text-amber-400">
                orders@spicera.com
              </a>{" "}
              or call{" "}
              <a href="tel:+1-555-SPICE-1" className="text-amber-500 hover:text-amber-400">
                +1 (555) SPICE-1
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}