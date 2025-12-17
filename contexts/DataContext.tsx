import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MillingBit, Collet } from '../types';
import { fetchBits, fetchCollets, seedDatabase as apiSeed } from '../services/api';
import { supabase } from '../services/supabaseClient';

const INITIAL_ADMINS = [
  'marcelo.sousa@ufg.br',
  // 'marcelo.engvs@gmail.com', // Removed as requested
  'ipelab.suporte@gmail.com',
  'pedrogoncalves@ufg.br'
];

// Changed key to force reset of admin list for users with old cached data
const ADMIN_STORAGE_KEY = 'cnc_manager_admins_v2';

interface DataContextType {
  bits: MillingBit[];
  collets: Collet[];
  loading: boolean;
  isAdmin: boolean;
  adminEmails: string[];
  refreshData: () => Promise<void>;
  seedData: () => Promise<void>;
  getBitById: (id: string) => MillingBit | undefined;
  addAdmin: (email: string) => void;
  removeAdmin: (email: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bits, setBits] = useState<MillingBit[]>([]);
  const [collets, setCollets] = useState<Collet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Initialize from LocalStorage or fall back to Initial list
  const [adminEmails, setAdminEmails] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_ADMINS;
    } catch (error) {
      console.warn("Failed to load admins from storage", error);
      return INITIAL_ADMINS;
    }
  });

  // Persist changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminEmails));
  }, [adminEmails]);

  const checkAdminStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      const email = user.email.toLowerCase().trim();
      // Check both exact match or case-insensitive match against list
      const isUserAdmin = adminEmails.some(admin => admin.toLowerCase().trim() === email);
      setIsAdmin(isUserAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [adminEmails]);

  const refreshData = useCallback(async () => {
    try {
      const [bitsData, colletsData] = await Promise.all([fetchBits(), fetchCollets()]);
      setBits(bitsData);
      setCollets(colletsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const seedData = async () => {
    if (!isAdmin) {
      alert("Apenas administradores podem importar dados.");
      return;
    }
    await apiSeed();
    await refreshData();
  };

  const getBitById = useCallback((id: string) => {
    return bits.find(b => b.id === id);
  }, [bits]);

  const addAdmin = useCallback((email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setAdminEmails(prev => {
      // Avoid duplicates case-insensitive
      if (prev.some(e => e.toLowerCase() === cleanEmail)) return prev;
      return [...prev, email.trim()]; // Store original casing but trimmed
    });
  }, []);

  const removeAdmin = useCallback((email: string) => {
    const target = email.toLowerCase().trim();
    setAdminEmails(prev => prev.filter(e => e.toLowerCase().trim() !== target));
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      await checkAdminStatus();
      await refreshData();
    };
    init();
  }, [refreshData, checkAdminStatus]);

  return (
    <DataContext.Provider value={{ 
      bits, 
      collets, 
      loading, 
      isAdmin, 
      adminEmails,
      refreshData, 
      seedData, 
      getBitById,
      addAdmin,
      removeAdmin
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};