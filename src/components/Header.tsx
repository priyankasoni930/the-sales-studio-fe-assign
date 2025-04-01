
import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, UserCog } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Gift className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Guest Gift Garden</h1>
        </Link>
        <Link to="/admin">
          <Button variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <UserCog className="w-5 h-5 mr-2" />
            Admin
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
