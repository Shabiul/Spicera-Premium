import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Plus, 
  Edit, 
  Trash2,
  TrendingUp,
  Calendar,
  FileSpreadsheet,
  Tag,
  Target
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BulkProductManager from '@/components/BulkProductManager';
import CouponManager from '@/components/CouponManager';
import CustomerSegmentation from '@/components/CustomerSegmentation';

interface AdminMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: any[];
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: '',
    featured: false
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/');
    }
  }, [user, setLocation]);

  // Fetch admin metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<AdminMetrics>({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    enabled: !!user && user.role === 'admin'
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!user && user.role === 'admin'
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productData,
          price: parseFloat(productData.price),
          stock: parseInt(productData.stock)
        })
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      setNewProduct({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        stock: '',
        featured: false
      });
      setSelectedImage(null);
      setImagePreview('');
      setShowAddForm(false);
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          price: data.price ? parseFloat(data.price) : undefined,
          stock: data.stock ? parseInt(data.stock) : undefined
        })
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      setEditingProduct(null);
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    }
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    createProductMutation.mutate(newProduct);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: editingProduct });
    }
  };

  // Chart data processing
  const revenueData = metrics?.recentOrders?.slice(-7).map((order, index) => ({
    day: `Day ${index + 1}`,
    revenue: parseFloat(order.totalAmount),
    orders: 1
  })) || [];

  const categoryData = products?.reduce((acc, product) => {
    const existing = acc.find(item => item.category === product.category);
    if (existing) {
      existing.count += 1;
      existing.value += product.stock;
    } else {
      acc.push({ category: product.category, count: 1, value: product.stock });
    }
    return acc;
  }, [] as { category: string; count: number; value: number }[]) || [];

  const stockData = products?.slice(0, 10).map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    stock: product.stock,
    price: parseFloat(product.price)
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Sparkline data for metric cards with dates and tooltips
  const userSparklineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      value: Math.max(1, (metrics?.totalUsers || 0) - 6 + i + Math.random() * 2),
      date: date.toLocaleDateString(),
      label: `${Math.floor(Math.max(1, (metrics?.totalUsers || 0) - 6 + i + Math.random() * 2))} users`
    };
  });

  const orderSparklineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const orderCount = Math.floor(i + 1 + Math.random() * 2);
    return {
      value: orderCount,
      date: date.toLocaleDateString(),
      label: `${orderCount} orders`
    };
  });

  const revenueSparklineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const revenue = (i + 1) * 50 + Math.random() * 100;
    return {
      value: revenue,
      date: date.toLocaleDateString(),
      label: `₹${revenue.toFixed(2)} revenue`
    };
  });

  const productSparklineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const productCount = Math.floor(Math.max(1, (metrics?.totalProducts || 0) - 3 + i + Math.random() * 1));
    return {
      value: productCount,
      date: date.toLocaleDateString(),
      label: `${productCount} products`
    };
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>
            Access denied. Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor your website metrics and manage products</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="bulk-products">Bulk Products</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {metricsLoading ? (
              <div>Loading metrics...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
                      <div className="h-[40px] mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userSparklineData}>
                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white p-2 border rounded shadow-lg">
                                      <p className="text-sm font-medium">{data.date}</p>
                                      <p className="text-sm text-blue-600">{data.label}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics?.totalOrders || 0}</div>
                      <div className="h-[40px] mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={orderSparklineData}>
                            <Area type="monotone" dataKey="value" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white p-2 border rounded shadow-lg">
                                      <p className="text-sm font-medium">{data.date}</p>
                                      <p className="text-sm text-green-600">{data.label}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{metrics?.totalRevenue?.toFixed(2) || '0.00'}</div>
                      <div className="h-[40px] mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueSparklineData}>
                            <Bar dataKey="value" fill="#FFBB28" />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white p-2 border rounded shadow-lg">
                                      <p className="text-sm font-medium">{data.date}</p>
                                      <p className="text-sm text-yellow-600">{data.label}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics?.totalProducts || 0}</div>
                      <div className="h-[40px] mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={productSparklineData}>
                            <Line type="monotone" dataKey="value" stroke="#FF8042" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white p-2 border rounded shadow-lg">
                                      <p className="text-sm font-medium">{data.date}</p>
                                      <p className="text-sm text-purple-600">{data.label}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Revenue Trend
                      </CardTitle>
                      <CardDescription>Daily revenue from recent orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                          <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Product Categories
                      </CardTitle>
                      <CardDescription>Distribution of products by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ category, count }) => `${category} (${count})`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Product Stock Levels
                    </CardTitle>
                    <CardDescription>Current stock levels for top products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stockData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="stock" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recent Orders
                    </CardTitle>
                    <CardDescription>Latest orders from customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {metrics?.recentOrders?.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.customerEmail}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{order.totalAmount}</p>
                            <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )) || <p>No recent orders</p>}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Button onClick={() => {
                setShowAddForm(true);
                setSelectedImage(null);
                setImagePreview('');
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">Product Image</Label>
                      <div className="space-y-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedImage(file);
                              // Create preview
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const result = e.target?.result as string;
                                setImagePreview(result);
                              };
                              reader.readAsDataURL(file);
                              
                              // Upload file to server
                              try {
                                const formData = new FormData();
                                formData.append('image', file);
                                
                                const token = localStorage.getItem('auth_token');
                                const response = await fetch('/api/upload', {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: formData
                                });
                                
                                if (response.ok) {
                                  try {
                                    const result = await response.json();
                                    setNewProduct({ ...newProduct, image: result.url });
                                  } catch (error) {
                                    console.error('Failed to parse upload response:', error);
                                  }
                                } else {
                                  console.error('Upload failed');
                                }
                              } catch (error) {
                                console.error('Upload error:', error);
                              }
                            }
                          }}
                          required
                        />
                        {imagePreview && (
                          <div className="mt-2">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-32 h-32 object-cover rounded-md border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={newProduct.featured}
                        onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                      />
                      <Label htmlFor="featured">Featured Product</Label>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={createProductMutation.isPending}>
                        {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowAddForm(false);
                        setSelectedImage(null);
                        setImagePreview('');
                        setNewProduct({
                          name: '',
                          description: '',
                          price: '',
                          image: '',
                          category: '',
                          stock: '',
                          featured: false
                        });
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsLoading ? (
                <div>Loading products...</div>
              ) : (
                products?.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg">₹{product.price}</span>
                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                          Stock: {product.stock}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {editingProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-name">Product Name</Label>
                        <Input
                          id="edit-name"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-category">Category</Label>
                        <Input
                          id="edit-category"
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-price">Price</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-stock">Stock</Label>
                        <Input
                          id="edit-stock"
                          type="number"
                          value={editingProduct.stock}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-image">Product Image</Label>
                      <div className="space-y-2">
                        <Input
                          id="edit-image"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Upload file to server
                              try {
                                const formData = new FormData();
                                formData.append('image', file);
                                
                                const token = localStorage.getItem('auth_token');
                                const response = await fetch('/api/upload', {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: formData
                                });
                                
                                if (response.ok) {
                                  try {
                                    const result = await response.json();
                                    setEditingProduct({ ...editingProduct, image: result.url });
                                  } catch (error) {
                                    console.error('Failed to parse upload response:', error);
                                  }
                                } else {
                                  console.error('Upload failed');
                                }
                              } catch (error) {
                                console.error('Upload error:', error);
                              }
                            }
                          }}
                        />
                        {editingProduct.image && (
                          <div className="mt-2">
                            <img 
                              src={editingProduct.image} 
                              alt="Current image" 
                              className="w-32 h-32 object-cover rounded-md border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-featured"
                        checked={editingProduct.featured}
                        onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      />
                      <Label htmlFor="edit-featured">Featured Product</Label>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={updateProductMutation.isPending}>
                        {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold">User Management</h2>
            <Card>
              <CardContent>
                <div className="space-y-4">
                  {usersLoading ? (
                    <div>Loading users...</div>
                  ) : (
                    users?.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">Role: {user.role}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.isActive ? "default" : "destructive"}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Order Management</h2>
            <Card>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.recentOrders?.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">{order.customerName} - {order.customerEmail}</p>
                        <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.totalAmount}</p>
                        <Badge>{order.status}</Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) || <p>No orders found</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk-products" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <FileSpreadsheet className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Bulk Product Management</h2>
            </div>
            <BulkProductManager />
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Coupon Management</h2>
            </div>
            <CouponManager />
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Customer Segmentation</h2>
            </div>
            <CustomerSegmentation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}