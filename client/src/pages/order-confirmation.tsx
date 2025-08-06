import { CheckCircle, Package, Truck, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderConfirmation() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thank you for your order. We've received your purchase and will begin processing it shortly.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="bg-white border-gray-200 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-gray-900 text-left">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Order Processing</h3>
                    <p className="text-sm text-gray-600">
                      We're carefully preparing your premium spices for shipment. This typically takes 1-2 business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Shipping</h3>
                    <p className="text-sm text-gray-600">
                      Your order will be shipped via our premium carrier and you'll receive tracking information by email.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Delivery</h3>
                    <p className="text-sm text-gray-600">
                      Your authentic spice blends will arrive fresh and ready to transform your cooking experience.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-primary mb-2">Order Confirmation Email</h3>
            <p className="text-gray-700 text-sm">
              A detailed confirmation email has been sent to your inbox with your order details and tracking information once available.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/80 text-white font-semibold px-8 py-3">
                Back to Home
              </Button>
            </Link>
            <Link to="/store">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Questions about your order? Contact us at{" "}
              <a href="mailto:spicerapremium@gmail.com" className="text-primary hover:text-primary/80">
                spicerapremium@gmail.com
              </a>{" "}
              or call{" "}
              <a href="tel:+91-9916559234" className="text-primary hover:text-primary/80">
                 +91 9916559234
               </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}