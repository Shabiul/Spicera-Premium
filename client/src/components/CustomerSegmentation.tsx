import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Users, RefreshCw, BarChart3, Target } from 'lucide-react';

interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  criteria: {
    totalOrders?: { min?: number; max?: number };
    totalSpent?: { min?: number; max?: number };
    lastOrderDays?: number;
    favoriteCategories?: string[];
    registrationDays?: { min?: number; max?: number };
  };
  isActive: boolean;
  createdAt: string;
  memberCount?: number;
}

interface SegmentMember {
  id: string;
  email: string;
  name?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  registrationDate: string;
}

interface SegmentAnalytics {
  totalMembers: number;
  averageOrderValue: number;
  totalRevenue: number;
  averageOrders: number;
  retentionRate: number;
}

interface SegmentFormData {
  name: string;
  description: string;
  totalOrdersMin: string;
  totalOrdersMax: string;
  totalSpentMin: string;
  totalSpentMax: string;
  lastOrderDays: string;
  registrationDaysMin: string;
  registrationDaysMax: string;
  isActive: boolean;
}

const initialFormData: SegmentFormData = {
  name: '',
  description: '',
  totalOrdersMin: '',
  totalOrdersMax: '',
  totalSpentMin: '',
  totalSpentMax: '',
  lastOrderDays: '',
  registrationDaysMin: '',
  registrationDaysMax: '',
  isActive: true
};

export default function CustomerSegmentation() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [segmentMembers, setSegmentMembers] = useState<SegmentMember[]>([]);
  const [segmentAnalytics, setSegmentAnalytics] = useState<SegmentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CustomerSegment | null>(null);
  const [formData, setFormData] = useState<SegmentFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSegments();
  }, []);

  useEffect(() => {
    if (selectedSegment) {
      fetchSegmentMembers(selectedSegment.id);
      fetchSegmentAnalytics(selectedSegment.id);
    }
  }, [selectedSegment]);

  const fetchSegments = async () => {
    try {
      const response = await fetch('/api/admin/segments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSegments(data);
      }
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSegmentMembers = async (segmentId: string) => {
    try {
      const response = await fetch(`/api/admin/segments/${segmentId}/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSegmentMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch segment members:', error);
    }
  };

  const fetchSegmentAnalytics = async (segmentId: string) => {
    try {
      const response = await fetch(`/api/admin/segments/${segmentId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSegmentAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch segment analytics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const criteria: any = {};
      
      if (formData.totalOrdersMin || formData.totalOrdersMax) {
        criteria.totalOrders = {};
        if (formData.totalOrdersMin) criteria.totalOrders.min = parseInt(formData.totalOrdersMin);
        if (formData.totalOrdersMax) criteria.totalOrders.max = parseInt(formData.totalOrdersMax);
      }
      
      if (formData.totalSpentMin || formData.totalSpentMax) {
        criteria.totalSpent = {};
        if (formData.totalSpentMin) criteria.totalSpent.min = parseFloat(formData.totalSpentMin);
        if (formData.totalSpentMax) criteria.totalSpent.max = parseFloat(formData.totalSpentMax);
      }
      
      if (formData.lastOrderDays) {
        criteria.lastOrderDays = parseInt(formData.lastOrderDays);
      }
      
      if (formData.registrationDaysMin || formData.registrationDaysMax) {
        criteria.registrationDays = {};
        if (formData.registrationDaysMin) criteria.registrationDays.min = parseInt(formData.registrationDaysMin);
        if (formData.registrationDaysMax) criteria.registrationDays.max = parseInt(formData.registrationDaysMax);
      }

      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        criteria,
        isActive: formData.isActive
      };

      const url = editingSegment 
        ? `/api/admin/segments/${editingSegment.id}`
        : '/api/admin/segments';
      
      const method = editingSegment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchSegments();
        setIsDialogOpen(false);
        setEditingSegment(null);
        setFormData(initialFormData);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save segment');
      }
    } catch (error) {
      console.error('Failed to save segment:', error);
      alert('Failed to save segment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (segment: CustomerSegment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      totalOrdersMin: segment.criteria.totalOrders?.min?.toString() || '',
      totalOrdersMax: segment.criteria.totalOrders?.max?.toString() || '',
      totalSpentMin: segment.criteria.totalSpent?.min?.toString() || '',
      totalSpentMax: segment.criteria.totalSpent?.max?.toString() || '',
      lastOrderDays: segment.criteria.lastOrderDays?.toString() || '',
      registrationDaysMin: segment.criteria.registrationDays?.min?.toString() || '',
      registrationDaysMax: segment.criteria.registrationDays?.max?.toString() || '',
      isActive: segment.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (segmentId: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/segments/${segmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchSegments();
        if (selectedSegment?.id === segmentId) {
          setSelectedSegment(null);
        }
      } else {
        alert('Failed to delete segment');
      }
    } catch (error) {
      console.error('Failed to delete segment:', error);
      alert('Failed to delete segment');
    }
  };

  const handleRefreshSegment = async (segmentId: string) => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/admin/segments/${segmentId}/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchSegments();
        if (selectedSegment?.id === segmentId) {
          await fetchSegmentMembers(segmentId);
          await fetchSegmentAnalytics(segmentId);
        }
      } else {
        alert('Failed to refresh segment');
      }
    } catch (error) {
      console.error('Failed to refresh segment:', error);
      alert('Failed to refresh segment');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshAllSegments = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/segments/refresh-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchSegments();
        if (selectedSegment) {
          await fetchSegmentMembers(selectedSegment.id);
          await fetchSegmentAnalytics(selectedSegment.id);
        }
      } else {
        alert('Failed to refresh all segments');
      }
    } catch (error) {
      console.error('Failed to refresh all segments:', error);
      alert('Failed to refresh all segments');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading customer segments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customer Segmentation</h2>
          <p className="text-gray-600">Group customers for targeted marketing campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshAllSegments}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingSegment(null); setFormData(initialFormData); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSegment ? 'Edit Segment' : 'Create New Segment'}
                </DialogTitle>
                <DialogDescription>
                  {editingSegment ? 'Update segment criteria' : 'Define criteria to group customers'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Segment Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="High Value Customers"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Customers who have spent over $500"
                  />
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Segmentation Criteria</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Orders (Min)</Label>
                      <Input
                        type="number"
                        value={formData.totalOrdersMin}
                        onChange={(e) => setFormData({ ...formData, totalOrdersMin: e.target.value })}
                        placeholder="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Orders (Max)</Label>
                      <Input
                        type="number"
                        value={formData.totalOrdersMax}
                        onChange={(e) => setFormData({ ...formData, totalOrdersMax: e.target.value })}
                        placeholder="50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Spent (Min $)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.totalSpentMin}
                        onChange={(e) => setFormData({ ...formData, totalSpentMin: e.target.value })}
                        placeholder="100.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Spent (Max $)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.totalSpentMax}
                        onChange={(e) => setFormData({ ...formData, totalSpentMax: e.target.value })}
                        placeholder="1000.00"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Last Order Within (Days)</Label>
                    <Input
                      type="number"
                      value={formData.lastOrderDays}
                      onChange={(e) => setFormData({ ...formData, lastOrderDays: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Registered Since (Min Days)</Label>
                      <Input
                        type="number"
                        value={formData.registrationDaysMin}
                        onChange={(e) => setFormData({ ...formData, registrationDaysMin: e.target.value })}
                        placeholder="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Registered Since (Max Days)</Label>
                      <Input
                        type="number"
                        value={formData.registrationDaysMax}
                        onChange={(e) => setFormData({ ...formData, registrationDaysMax: e.target.value })}
                        placeholder="365"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingSegment ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Customer Segments
            </CardTitle>
            <CardDescription>
              Click on a segment to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {segments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No segments created yet. Create your first segment to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSegment?.id === segment.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSegment(segment)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{segment.name}</h4>
                        {segment.description && (
                          <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={segment.isActive ? 'default' : 'secondary'}>
                            {segment.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {segment.memberCount !== undefined && (
                            <span className="text-sm text-gray-500">
                              {segment.memberCount} members
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshSegment(segment.id);
                          }}
                          disabled={isRefreshing}
                        >
                          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(segment);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(segment.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {selectedSegment ? (
            <Tabs defaultValue="members" className="space-y-4">
              <TabsList>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="members">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {selectedSegment.name} Members
                    </CardTitle>
                    <CardDescription>
                      Customers in this segment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {segmentMembers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No members in this segment yet.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total Orders</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead>Last Order</TableHead>
                            <TableHead>Registered</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segmentMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{member.name || 'N/A'}</div>
                                  <div className="text-sm text-gray-500">{member.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>{member.totalOrders}</TableCell>
                              <TableCell>${member.totalSpent.toFixed(2)}</TableCell>
                              <TableCell>
                                {member.lastOrderDate 
                                  ? new Date(member.lastOrderDate).toLocaleDateString()
                                  : 'Never'
                                }
                              </TableCell>
                              <TableCell>
                                {new Date(member.registrationDate).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {selectedSegment.name} Analytics
                    </CardTitle>
                    <CardDescription>
                      Performance metrics for this segment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {segmentAnalytics ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{segmentAnalytics.totalMembers}</div>
                          <div className="text-sm text-blue-700">Total Members</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">${segmentAnalytics.averageOrderValue.toFixed(2)}</div>
                          <div className="text-sm text-green-700">Avg Order Value</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">${segmentAnalytics.totalRevenue.toFixed(2)}</div>
                          <div className="text-sm text-purple-700">Total Revenue</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{segmentAnalytics.averageOrders.toFixed(1)}</div>
                          <div className="text-sm text-orange-700">Avg Orders</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{(segmentAnalytics.retentionRate * 100).toFixed(1)}%</div>
                          <div className="text-sm text-red-700">Retention Rate</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Loading analytics...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a customer segment to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}