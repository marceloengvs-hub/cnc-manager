
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MillingBit, Collet } from '../types';
import { fetchBits, fetchCollets, seedDatabase as apiSeed } from '../services/api';
import { supabase } from '../services/supabaseClient';

const INITIAL_ADMINS = [
  'marcelo.sousa@ufg.br',
  'ipelab.suporte@gmail.com',
  'pedrogoncalves@ufg.br'
];

const ADMIN_STORAGE_KEY = 'cnc_manager_admins_v2';
const BITS_CACHE_KEY = 'cnc_bits_cache';
const COLLETS_CACHE_KEY = 'cnc_collets_cache';

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

/**
 * Função utilitária para salvar no localStorage lidando com erros de quota.
 * Se falhar por falta de espaço, tenta salvar uma versão 'slim' (sem imagens pesadas).
 */
const safeSaveToCache = (key: string, data: any[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`[Cache] Falha ao salvar ${key} (Quota Excedida). Tentando modo slim...`);
    try {
      // Tenta salvar sem as imagens (que geralmente são strings Base64 pesadas)
      const slimData = data.map(item => {
        // Se a imagem for um link externo curto, mantém. Se for Base64 (>1000 chars), remove.
        const isLargeImage = item.imageUrl && item.imageUrl.length > 1000;
        if (isLargeImage) {
          const { imageUrl, ...rest } = item;
          return rest;
        }
        return item;
      });
      localStorage.setItem(key, JSON.stringify(slimData));
      console.info(`[Cache] ${key} salvo com sucesso em modo slim.`);
    } catch (innerError) {
      // Se ainda assim falhar, remove o item para evitar dados corrompidos
      localStorage.removeItem(key);
      console.error(`[Cache] Espaço crítico: impossível salvar metadados para ${key}.`);
    }
  }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bits, setBits] = useState<MillingBit[]>(() => {
    try {
      const cached = localStorage.getItem(BITS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  
  const [collets, setCollets] = useState<Collet[]>(() => {
    try {
      const cached = localStorage.getItem(COLLETS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  
  const [loading, setLoading] = useState(!bits.length && !collets.length);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [adminEmails, setAdminEmails] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_ADMINS;
    } catch (error) {
      return INITIAL_ADMINS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminEmails));
    } catch (e) { /* Admins são pequenos, improvável falhar aqui */ }
  }, [adminEmails]);

  const checkAdminStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      const email = user.email.toLowerCase().trim();
      const isUserAdmin = adminEmails.some(admin => admin.toLowerCase().trim() === email);
      setIsAdmin(isUserAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [adminEmails]);

  const refreshData = useCallback(async () => {
    try {
      // Busca paralela para otimizar tempo de rede
      const [bitsData, colletsData] = await Promise.all([fetchBits(), fetchCollets()]);
      
      setBits(bitsData);
      setCollets(colletsData);
      
      // Persistência segura
      safeSaveToCache(BITS_CACHE_KEY, bitsData);
      safeSaveToCache(COLLETS_CACHE_KEY, colletsData);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const seedData = async () => {
    if (!isAdmin) return;
    await apiSeed();
    await refreshData();
  };

  const getBitById = useCallback((id: string) => {
    return bits.find(b => b.id === id);
  }, [bits]);

  const addAdmin = useCallback((email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    setAdminEmails(prev => {
      if (prev.some(e => e.toLowerCase() === cleanEmail)) return prev;
      return [...prev, email.trim()];
    });
  }, []);

  const removeAdmin = useCallback((email: string) => {
    const target = email.toLowerCase().trim();
    setAdminEmails(prev => prev.filter(e => e.toLowerCase().trim() !== target));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await checkAdminStatus();
      await refreshData();
      if (isMounted) setLoading(false);
    };
    init();
    return () => { isMounted = false; };
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
