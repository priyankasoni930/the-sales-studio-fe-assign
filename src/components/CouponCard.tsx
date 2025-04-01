
import React from 'react';
import { Gift, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coupon } from '@/lib/types';

interface CouponCardProps {
  coupon: Coupon;
  onClaim?: () => void;
  claimed?: boolean;
  showCode?: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({ 
  coupon, 
  onClaim, 
  claimed = false,
  showCode = false 
}) => {
  return (
    <Card className={`coupon-card w-full max-w-md mx-auto overflow-hidden ${claimed ? 'bg-accent' : 'bg-card'}`}>
      <CardHeader className="bg-primary text-primary-foreground pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Gift className="h-5 w-5" />
            {showCode ? coupon.code : 'Mystery Coupon'}
          </CardTitle>
          {claimed && (
            <span className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Claimed
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-card-foreground">{coupon.description}</p>
        
        {showCode && !claimed && (
          <div className="mt-4 p-3 bg-accent rounded-md text-center">
            <span className="font-semibold text-lg">{coupon.code}</span>
          </div>
        )}
        
        {claimed && showCode && (
          <div className="mt-4 p-3 bg-muted rounded-md text-center">
            <span className="font-semibold text-lg">{coupon.code}</span>
          </div>
        )}
      </CardContent>
      
      {onClaim && !claimed && (
        <CardFooter className="pt-0">
          <Button onClick={onClaim} className="w-full">
            Claim Your Gift
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CouponCard;
