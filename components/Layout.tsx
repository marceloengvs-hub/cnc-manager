import React from 'react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex justify-center min-h-screen bg-[#0d141c]">
      <div className="w-full max-w-md bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden relative min-h-screen flex flex-col">
        <div key={location.pathname} className="flex-1 flex flex-col page-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;