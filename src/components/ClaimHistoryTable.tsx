
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Coupon, UserClaim } from '@/lib/types';
import { formatDate } from '@/lib/format-utils';
import { Clock, Shield } from 'lucide-react';

interface ClaimHistoryTableProps {
  claims: UserClaim[];
  coupons: Coupon[];
}

const ClaimHistoryTable: React.FC<ClaimHistoryTableProps> = ({ claims, coupons }) => {
  // Sort claims by timestamp (newest first)
  const sortedClaims = [...claims].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getCouponCode = (couponId: string): string => {
    const coupon = coupons.find(c => c.id === couponId);
    return coupon ? coupon.code : 'Unknown';
  };

  // Mask IP address for privacy in the demo
  const maskIP = (ip: string): string => {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.***.***`;
  };

  // Mask session ID for privacy in the demo
  const maskSessionId = (sessionId: string): string => {
    if (sessionId.length <= 8) return sessionId;
    return `${sessionId.substring(0, 8)}...`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">Claim History</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <p>Total claims: <span className="font-semibold">{sortedClaims.length}</span></p>
        </div>
      </div>
      
      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/40">
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="font-medium">Coupon</TableHead>
              <TableHead className="font-medium">
                <div className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> 
                  <span>IP Address</span>
                </div>
              </TableHead>
              <TableHead className="font-medium">Session ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClaims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No claims have been made yet.
                </TableCell>
              </TableRow>
            ) : (
              sortedClaims.map((claim) => (
                <TableRow key={claim.id} className="hover:bg-muted/10">
                  <TableCell>{formatDate(claim.timestamp)}</TableCell>
                  <TableCell className="font-medium text-primary">
                    {getCouponCode(claim.couponId)}
                  </TableCell>
                  <TableCell>{maskIP(claim.ip)}</TableCell>
                  <TableCell className="font-mono text-xs">{maskSessionId(claim.sessionId)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClaimHistoryTable;
