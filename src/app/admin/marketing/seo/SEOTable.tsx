'use client';

import React, { useState } from 'react';
import { SEOSettings } from '@prisma/client';
import { saveSEOSettings } from '@/app/actions/seo';
import { toast } from 'sonner';
import { Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SEOTable({ initialSettings }: { initialSettings: SEOSettings[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SEOSettings>>({
    route: '',
    title: '',
    description: '',
    keywords: '',
    ogImageUrl: ''
  });

  const handleEdit = (seo: SEOSettings) => {
    setFormData(seo);
    setIsOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      route: '',
      title: '',
      description: '',
      keywords: '',
      ogImageUrl: ''
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.route || !formData.title || !formData.description) {
      toast.error('Route, title, and description are required.');
      return;
    }

    setLoading(true);
    const result = await saveSEOSettings({
      id: formData.id,
      route: formData.route,
      title: formData.title,
      description: formData.description,
      keywords: formData.keywords || '',
      ogImageUrl: formData.ogImageUrl
    });
    setLoading(false);

    if (result.success) {
      toast.success('SEO settings saved successfully.');
      setIsOpen(false);
    } else {
      toast.error(result.error || 'Failed to save SEO settings.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Route SEO
        </Button>
      </div>

      <div className="w-full rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialSettings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No SEO settings found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              initialSettings.map((seo) => (
                <TableRow key={seo.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {seo.route}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {seo.title}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {seo.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(seo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit SEO Settings' : 'Add New Route SEO'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="route">Route Path (e.g. / or /marketplace)</Label>
              <Input 
                id="route" 
                value={formData.route || ''}
                onChange={(e) => setFormData({...formData, route: e.target.value})}
                placeholder="/"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input 
                id="title" 
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="AutoAlpha | Crypto Trading"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Meta Description</Label>
              <Textarea 
                id="description" 
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description for search engines..."
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma separated)</Label>
              <Input 
                id="keywords" 
                value={formData.keywords || ''}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                placeholder="crypto, trading, bot, autoalpha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ogImageUrl">Open Graph Image URL (optional)</Label>
              <Input 
                id="ogImageUrl" 
                value={formData.ogImageUrl || ''}
                onChange={(e) => setFormData({...formData, ogImageUrl: e.target.value})}
                placeholder="https://autoalpha.ai/og-image.jpg"
              />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
