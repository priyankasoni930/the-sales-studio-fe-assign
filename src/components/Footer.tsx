
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Guest Gift Garden. All rights reserved.</p>
        <p className="text-sm mt-1">A secure coupon distribution system.</p>
      </div>
    </footer>
  );
};

export default Footer;
