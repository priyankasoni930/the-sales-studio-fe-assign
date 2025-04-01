
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Eye, EyeOff, Plus } from 'lucide-react';
import { Coupon } from '@/lib/types';
import { formatDate } from '@/lib/format-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCoupon, saveCoupon, toggleCouponStatus } from '@/lib/storage';
import { useToast } from "@/components/ui/use-toast";

interface AdminCouponTableProps {
  coupons: Coupon[];
  onUpdate: () => void;
}

const AdminCouponTable: React.FC<AdminCouponTableProps> = ({ coupons, onUpdate }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', description: '', isActive: true });
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();

  const handleAddCoupon = () => {
    if (!newCoupon.code || !newCoupon.description) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please fill in all required fields",
      });
      return;
    }

    addCoupon({
      code: newCoupon.code,
      description: newCoupon.description,
      isActive: true,
    });

    setNewCoupon({ code: '', description: '', isActive: true });
    setIsAddDialogOpen(false);
    onUpdate();
    
    toast({
      title: "Coupon added",
      description: `Coupon "${newCoupon.code}" has been added successfully`,
    });
  };

  const handleEditCoupon = () => {
    if (editingCoupon && editingCoupon.code && editingCoupon.description) {
      saveCoupon(editingCoupon);
      setIsEditDialogOpen(false);
      onUpdate();
      
      toast({
        title: "Coupon updated",
        description: `Coupon "${editingCoupon.code}" has been updated successfully`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please fill in all required fields",
      });
    }
  };

  const handleToggleStatus = (couponId: string) => {
    const updatedCoupon = toggleCouponStatus(couponId);
    if (updatedCoupon) {
      onUpdate();
      
      toast({
        title: updatedCoupon.isActive ? "Coupon activated" : "Coupon deactivated",
        description: `Coupon "${updatedCoupon.code}" has been ${updatedCoupon.isActive ? 'activated' : 'deactivated'}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., SUMMER20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., 20% off summer collection"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                />
              </div>
              <Button onClick={handleAddCoupon} className="w-full">
                Add Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No coupons found. Add your first coupon!
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>{coupon.description}</TableCell>
                  <TableCell>
                    {coupon.isUsed ? (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        Used
                      </Badge>
                    ) : coupon.isActive ? (
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(coupon.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setIsEditDialogOpen(true);
                        }}
                        disabled={coupon.isUsed}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleStatus(coupon.id)}
                        disabled={coupon.isUsed}
                      >
                        {coupon.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          {editingCoupon && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Coupon Code</Label>
                <Input
                  id="edit-code"
                  value={editingCoupon.code}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingCoupon.description}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                />
              </div>
              <Button onClick={handleEditCoupon} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCouponTable;
