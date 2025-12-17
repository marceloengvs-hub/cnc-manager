import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex justify-center min-h-screen bg-[#0d141c]">
      <div className="w-full max-w-md bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden relative min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default Layout;