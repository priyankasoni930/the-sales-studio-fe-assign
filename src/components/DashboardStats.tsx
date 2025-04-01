
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coupon, UserClaim } from '@/lib/types';
import { Gift, Check, Clock, AlertTriangle } from 'lucide-react';

interface DashboardStatsProps {
  coupons: Coupon[];
  claims: UserClaim[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ coupons, claims }) => {
  // Calculate stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive && !c.isUsed).length;
  const claimedCoupons = coupons.filter(c => c.isUsed).length;
  const inactiveCoupons = coupons.filter(c => !c.isActive && !c.isUsed).length;

  // Calculate claim rate (if any coupons exist)
  const claimRate = totalCoupons > 0 
    ? Math.round((claimedCoupons / totalCoupons) * 100) 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCoupons}</div>
          <p className="text-xs text-muted-foreground">
            {claimRate}% claim rate
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCoupons}</div>
          <p className="text-xs text-muted-foreground">
            Available for distribution
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Claimed Coupons</CardTitle>
          <Check className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{claimedCoupons}</div>
          <p className="text-xs text-muted-foreground">
            Successfully distributed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Coupons</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveCoupons}</div>
          <p className="text-xs text-muted-foreground">
            Paused distribution
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
