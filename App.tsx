import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import Layout from './components/Layout';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import MillingBitsList from './pages/MillingBitsList';
import MillingBitDetails from './pages/MillingBitDetails';
import ColletStock from './pages/ColletStock';
import NewMillingBit from './pages/NewMillingBit';
import EditStock from './pages/EditStock';
import EditMillingBit from './pages/EditMillingBit';
import NewCollet from './pages/NewCollet';
import Scanner from './pages/Scanner';
import BitStockList from './pages/BitStockList';
import History from './pages/History';
import AdminManagement from './pages/AdminManagement';
import { Session } from '@supabase/supabase-js';
import { DataProvider } from './contexts/DataContext';

const AppContent: React.FC<{ session: Session | null }> = ({ session }) => {
  const location = useLocation();
  
  if (!session) {
    return <Login />;
  }

  // Show bottom nav on main tabs and details view for better navigation flow
  const showBottomNav = 
    ['/', '/list', '/stock', '/profile'].includes(location.pathname) || 
    location.pathname.startsWith('/details/');

  return (
    <DataProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/list" element={<MillingBitsList />} />
          <Route path="/details/:id" element={<MillingBitDetails />} />
          <Route path="/edit-stock/:id" element={<EditStock />} />
          <Route path="/edit/:id" element={<EditMillingBit />} />
          <Route path="/stock" element={<ColletStock />} />
          <Route path="/bit-stock" element={<BitStockList />} />
          <Route path="/history" element={<History />} />
          <Route path="/new" element={<NewMillingBit />} />
          <Route path="/new-collet" element={<NewCollet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/admin-management" element={<AdminManagement />} />
          {/* Default redirect for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {showBottomNav && <BottomNav />}
      </Layout>
    </DataProvider>
  );
}

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn("Session initialization error:", error.message);
          await supabase.auth.signOut();
          if (mounted) setSession(null);
        } else {
          if (mounted) setSession(data.session);
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
        if (mounted) setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Cast event to string to avoid TS2367 error if types are missing specific enums
      const eventType = event as string;

      if (eventType === 'SIGNED_OUT' || eventType === 'USER_DELETED') {
        setSession(null);
      } else if (eventType === 'TOKEN_REFRESH_REVOKED') {
         await supabase.auth.signOut();
         setSession(null);
      } else {
        setSession(session);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center text-primary">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <HashRouter>
      <AppContent session={session} />
    </HashRouter>
  );
};

export default App;