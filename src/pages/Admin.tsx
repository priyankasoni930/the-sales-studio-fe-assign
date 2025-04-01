
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminLogin from '@/components/AdminLogin';
import AdminCouponTable from '@/components/AdminCouponTable';
import ClaimHistoryTable from '@/components/ClaimHistoryTable';
import DashboardStats from '@/components/DashboardStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getCoupons, getClaims, initializeStorage } from '@/lib/storage';
import { LogOut } from 'lucide-react';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [claims, setClaims] = useState([]);
  
  useEffect(() => {
    // Check if admin is already logged in
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    setIsLoggedIn(adminLoggedIn);
    
    // Initialize storage
    initializeStorage();
    
    // Load data if logged in
    if (adminLoggedIn) {
      loadData();
    }
  }, []);
  
  const loadData = () => {
    setCoupons(getCoupons());
    setClaims(getClaims());
  };
  
  const handleLogin = () => {
    setIsLoggedIn(true);
    loadData();
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {!isLoggedIn ? (
            <AdminLogin onLogin={handleLogin} />
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
              
              <DashboardStats coupons={coupons} claims={claims} />
              
              <Tabs defaultValue="coupons" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="coupons">Coupon Management</TabsTrigger>
                  <TabsTrigger value="claims">Claim History</TabsTrigger>
                </TabsList>
                <TabsContent value="coupons" className="mt-6">
                  <AdminCouponTable coupons={coupons} onUpdate={loadData} />
                </TabsContent>
                <TabsContent value="claims" className="mt-6">
                  <ClaimHistoryTable claims={claims} coupons={coupons} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
