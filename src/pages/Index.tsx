import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CouponCard from "@/components/CouponCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  getNextAvailableCoupon,
  initializeStorage,
  getSessionId,
  canClaimCoupon,
  addClaim,
  markCouponAsUsed,
} from "@/lib/storage";
import { getUserIP } from "@/lib/mock-ip";
import { formatTimeLeft } from "@/lib/format-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, Clock, Gift, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

// Constants
const COOLDOWN_PERIOD_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds (changed from 24 hours)

const Index = () => {
  const [nextCoupon, setNextCoupon] = useState(null);
  const [claimedCoupon, setClaimedCoupon] = useState(null);
  const [canClaim, setCanClaim] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize storage and check if user can claim
  useEffect(() => {
    initializeStorage();
    checkClaimStatus();
    loadNextCoupon();
  }, []);

  const checkClaimStatus = () => {
    const ip = getUserIP();
    const sessionId = getSessionId();
    const { canClaim: userCanClaim, timeLeft: timeRemaining } = canClaimCoupon(
      ip,
      sessionId
    );

    setCanClaim(userCanClaim);
    setTimeLeft(timeRemaining);

    // If there's a cooldown active, set a timer to update the timeLeft
    if (!userCanClaim && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTimeLeft = prev - 1000;
          if (newTimeLeft <= 0) {
            clearInterval(timer);
            setCanClaim(true);
            return 0;
          }
          return newTimeLeft;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  };

  const loadNextCoupon = () => {
    setLoading(true);
    setTimeout(() => {
      const coupon = getNextAvailableCoupon();
      setNextCoupon(coupon);
      setLoading(false);
    }, 500); // Simulated loading time
  };

  const handleClaimCoupon = () => {
    if (!canClaim || !nextCoupon) return;

    const ip = getUserIP();
    const sessionId = getSessionId();

    // Create a new claim
    const claim = addClaim({
      ip,
      sessionId,
      couponId: nextCoupon.id,
    });

    // Mark the coupon as used
    markCouponAsUsed(nextCoupon.id, claim);

    // Update state
    setClaimedCoupon(nextCoupon);
    setNextCoupon(null);
    setCanClaim(false);
    setTimeLeft(COOLDOWN_PERIOD_MS); // 6 hours in milliseconds (changed from 24 hours)

    // Show success toast
    toast({
      title: "Coupon claimed!",
      description: "You've successfully claimed your coupon.",
    });

    // Set a timer to update the cooldown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTimeLeft = prev - 1000;
        if (newTimeLeft <= 0) {
          clearInterval(timer);
          setCanClaim(true);
          checkClaimStatus();
          loadNextCoupon();
          return 0;
        }
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <section className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to Guest Gift Garden
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Claim your free coupon today, no signup required!
            </p>
          </section>

          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {claimedCoupon ? (
              <div className="space-y-6">
                <Alert className="bg-accent border-primary">
                  <Gift className="h-5 w-5" />
                  <AlertTitle>Coupon Claimed!</AlertTitle>
                  <AlertDescription>
                    You've successfully claimed your coupon. Come back in{" "}
                    {formatTimeLeft(timeLeft)} to claim another one.
                  </AlertDescription>
                </Alert>

                <CouponCard
                  coupon={claimedCoupon}
                  claimed={true}
                  showCode={true}
                />

                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClaimedCoupon(null);
                      checkClaimStatus();
                      loadNextCoupon();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check for Another Coupon
                  </Button>
                </div>
              </div>
            ) : !canClaim ? (
              <div className="space-y-6">
                <Alert>
                  <Clock className="h-5 w-5" />
                  <AlertTitle>Cooldown Period</AlertTitle>
                  <AlertDescription>
                    You've already claimed a coupon recently. Please wait{" "}
                    {formatTimeLeft(timeLeft)} before claiming another.
                  </AlertDescription>
                </Alert>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="text-center p-8 border rounded-lg bg-muted/50">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">
                      Coupon Cooldown
                    </h3>
                    <p className="text-muted-foreground">
                      To ensure fair distribution, there's a 6-hour cooldown
                      period between claims.
                    </p>
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : nextCoupon ? (
              <div className="space-y-6">
                <Alert className="bg-accent border-primary/40">
                  <Gift className="h-5 w-5" />
                  <AlertTitle>A Gift for You!</AlertTitle>
                  <AlertDescription>
                    A special coupon is available for you to claim. Click the
                    button to reveal your surprise!
                  </AlertDescription>
                </Alert>

                <CouponCard
                  coupon={nextCoupon}
                  onClaim={handleClaimCoupon}
                  showCode={false}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <Alert variant="destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle>No Coupons Available</AlertTitle>
                  <AlertDescription>
                    We're currently out of coupons. Please check back later!
                  </AlertDescription>
                </Alert>

                <div className="text-center p-8 border rounded-lg">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">All Claimed!</h3>
                  <p className="text-muted-foreground mb-4">
                    All our coupons have been claimed. Check back soon for new
                    offers!
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      checkClaimStatus();
                      loadNextCoupon();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Again
                  </Button>
                </div>
              </div>
            )}
          </motion.div>        
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
