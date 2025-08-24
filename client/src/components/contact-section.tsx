import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertContactSubmissionSchema } from "@shared/schema";

export default function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertContactSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      // Your access key is now included here
      formData.append('access_key', '8e403798-0852-424d-ba5b-e3a3061caa0f'); 
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('subject', data.subject);
      formData.append('message', data.message);
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      
      let result;
      try {
        result = await response.json();
      } catch (error) {
        throw new Error('Invalid response from server');
      }
      
      if (result.success) {
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you soon. ✨",
        });
        form.reset();
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get In Touch</h2>
            <p className="text-lg text-gray-600 mb-8">
              Ready to elevate your culinary experience? Contact us for custom blends, bulk orders, or any questions about our premium spices.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center hover-lift">
                <div className="bg-primary p-4 rounded-full mr-6 hover:scale-110 transition-all duration-300 hover-glow">
                  <Phone className="text-white h-6 w-6" />
                </div>
                <div>
                  {/* Corrected text color to be visible on white background */}
                  <h4 className="font-semibold text-gray-800 text-lg">Phone</h4>
                  <p className="text-gray-600">+91 9916559234</p>
                </div>
              </div>
              
              <div className="flex items-center hover-lift">
                <div className="bg-primary p-4 rounded-full mr-6 hover:scale-110 transition-all duration-300 hover-glow">
                  {/* Corrected icon color for consistency */}
                  <Mail className="text-white h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">Email</h4>
                  <p className="text-gray-600">spicerapremium@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center hover-lift">
                <div className="bg-primary p-4 rounded-full mr-6 hover:scale-110 transition-all duration-300 hover-glow">
                  {/* Corrected icon color for consistency */}
                  <MapPin className="text-white h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">Location</h4>
                  <p className="text-gray-600">Bangalore, INDIA</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="fade-in">
            <Form {...form}>
              {/* Corrected form styling for light theme */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="bg-gray-50/70 p-6 lg:p-8 rounded-2xl shadow-lg space-y-6 border border-gray-200 backdrop-blur-lg hover:shadow-2xl transition-all duration-300">
                <h3 className="font-display text-2xl font-semibold text-gray-900 mb-6">Send us a message</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
                      <FormControl>
                        {/* Corrected focus ring color for consistency */}
                        <Input 
                          placeholder="Your full name" 
                          className="focus:ring-primary focus:border-primary" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your@email.com" 
                          className="focus:ring-primary focus:border-primary" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary focus:border-primary">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Product Inquiry">Product Inquiry</SelectItem>
                          <SelectItem value="Custom Blend Request">Custom Blend Request</SelectItem>
                          <SelectItem value="Bulk Order">Bulk Order</SelectItem>
                          <SelectItem value="General Question">General Question</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Tell us how we can help you..." 
                          className="focus:ring-primary focus:border-primary" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}