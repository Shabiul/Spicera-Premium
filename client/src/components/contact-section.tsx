import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";

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

  const contactMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you soon.",
      });
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    contactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-spice-cream to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="fade-in">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-spice-brown mb-6">Get In Touch</h2>
            <p className="text-lg text-gray-700 mb-8">
              Ready to elevate your culinary experience? Contact us for custom blends, bulk orders, or any questions about our premium spices.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="bg-spice-gold p-4 rounded-full mr-6">
                  <Phone className="text-spice-dark h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-spice-brown text-lg">Phone</h4>
                  <p className="text-gray-600">+1 (555) 123-SPICE</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-spice-gold p-4 rounded-full mr-6">
                  <Mail className="text-spice-dark h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-spice-brown text-lg">Email</h4>
                  <p className="text-gray-600">hello@spicerapremium.com</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-spice-gold p-4 rounded-full mr-6">
                  <MapPin className="text-spice-dark h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-spice-brown text-lg">Location</h4>
                  <p className="text-gray-600">Artisan District, Portland, OR</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="fade-in">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
                <h3 className="font-display text-2xl font-semibold text-spice-brown mb-6">Send us a message</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your full name" 
                          className="focus:ring-spice-gold focus:border-transparent" 
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
                          className="focus:ring-spice-gold focus:border-transparent" 
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
                          <SelectTrigger className="focus:ring-spice-gold focus:border-transparent">
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
                          className="focus:ring-spice-gold focus:border-transparent" 
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
                  className="w-full bg-spice-brown hover:bg-spice-dark text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:transform hover:scale-105"
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
