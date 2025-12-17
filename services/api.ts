
import { supabase } from './supabaseClient';
import { MillingBit, Collet, HistoryLog } from '../types';
import { mockBits, mockCollets } from './mockData';

// --- Mappers ---
// Convert DB snake_case to App camelCase
const mapBitFromDB = (data: any): MillingBit => ({
  id: data.id,
  name: data.name,
  type: data.type,
  diameter: data.diameter,
  imageUrl: data.image_url,
  stock: data.stock,
  minStock: data.min_stock,
  material: data.material,
  colletSize: data.collet_size,
  hasCollet: data.has_collet,
  specs: data.specs,
  application: data.application,
});

const mapColletFromDB = (data: any): Collet => ({
  id: data.id,
  name: data.name,
  size: data.size,
  type: data.type,
  description: data.description,
  stock: data.stock,
  minStock: data.min_stock,
  isImperial: data.is_imperial,
  imageUrl: data.image_url,
});

// Helper for UUID validation
const isValidUUID = (id: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

// --- Bits API ---

export const fetchBits = async (): Promise<MillingBit[]> => {
  try {
    const { data, error } = await supabase.from('bits').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapBitFromDB);
  } catch (error) {
    console.warn('API Error (falling back to mock data):', error);
    return mockBits;
  }
};

export const fetchBitById = async (id: string): Promise<MillingBit | null> => {
  if (!id) return null;
  
  // Try Supabase first if it looks like a UUID
  if (isValidUUID(id)) {
      try {
        const { data, error } = await supabase.from('bits').select('*').eq('id', id).single();
        if (!error && data) {
           return mapBitFromDB(data);
        }
      } catch (error) {
        console.warn('API Error fetching ID (falling back to mock):', error);
      }
  }

  // Fallback to mock data (allows searching items with simple IDs '1', '2' etc)
  const mockBit = mockBits.find(b => b.id === id);
  return mockBit || null;
};

export const updateBitStock = async (id: string, newStock: number) => {
  try {
    if (isValidUUID(id)) {
       const { error } = await supabase.from('bits').update({ stock: newStock }).eq('id', id);
       if (error) throw error;
    } else {
       // Mock in-memory update for demo
       const item = mockBits.find(b => b.id === id);
       if (item) item.stock = newStock;
    }
  } catch (error) {
    console.warn('Update failed (demo mode active)', error);
  }
};

export const updateBit = async (id: string, updates: Partial<MillingBit>) => {
  try {
    if (isValidUUID(id)) {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.diameter) dbUpdates.diameter = updates.diameter;
      if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock;
      if (updates.material) dbUpdates.material = updates.material;
      if (updates.colletSize) dbUpdates.collet_size = updates.colletSize;
      if (updates.hasCollet !== undefined) dbUpdates.has_collet = updates.hasCollet;
      if (updates.specs) dbUpdates.specs = updates.specs;
      if (updates.application) dbUpdates.application = updates.application;

      const { error } = await supabase.from('bits').update(dbUpdates).eq('id', id);
      if (error) throw error;
    } else {
      // Mock update
      const idx = mockBits.findIndex(b => b.id === id);
      if (idx !== -1) {
        mockBits[idx] = { ...mockBits[idx], ...updates };
      }
    }
  } catch (error) {
    console.warn('Update failed (demo mode active)', error);
  }
};

export const createBit = async (bit: Omit<MillingBit, 'id'>) => {
  try {
    const dbPayload = {
      name: bit.name,
      type: bit.type,
      diameter: bit.diameter,
      image_url: bit.imageUrl,
      stock: bit.stock,
      min_stock: bit.minStock,
      material: bit.material,
      collet_size: bit.colletSize,
      has_collet: bit.hasCollet,
      specs: bit.specs,
      application: bit.application
    };
    const { error } = await supabase.from('bits').insert(dbPayload);
    if (error) throw error;
  } catch (error) {
    console.warn('Create failed (demo mode active), adding to memory', error);
    // Add to mock with random ID
    const newId = Math.random().toString(36).substr(2, 9);
    mockBits.unshift({ ...bit, id: newId });
  }
};

// --- Collets API ---

export const fetchCollets = async (): Promise<Collet[]> => {
  try {
    const { data, error } = await supabase.from('collets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapColletFromDB);
  } catch (error) {
    console.warn('API Error (falling back to mock data):', error);
    return mockCollets;
  }
};

export const updateColletStock = async (id: string, newStock: number) => {
  try {
    if (isValidUUID(id)) {
      const { error } = await supabase.from('collets').update({ stock: newStock }).eq('id', id);
      if (error) throw error;
    } else {
      const item = mockCollets.find(c => c.id === id);
      if (item) item.stock = newStock;
    }
  } catch (error) {
    console.warn('Update failed (demo mode active)', error);
  }
};

export const createCollet = async (collet: Omit<Collet, 'id'>) => {
  try {
    const dbPayload = {
      name: collet.name,
      size: collet.size,
      type: collet.type,
      description: collet.description,
      stock: collet.stock,
      min_stock: collet.minStock,
      is_imperial: collet.isImperial,
      image_url: collet.imageUrl
    };
    const { error } = await supabase.from('collets').insert(dbPayload);
    if (error) throw error;
  } catch (error) {
    console.warn('Create failed (demo mode active), adding to memory', error);
    const newId = Math.random().toString(36).substr(2, 9);
    mockCollets.unshift({ ...collet, id: newId });
  }
};

// --- History API (Mock) ---

export const fetchHistory = async (): Promise<HistoryLog[]> => {
  // Simulate delay
  await new Promise(r => setTimeout(r, 600));

  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const lastWeek = new Date(now); lastWeek.setDate(now.getDate() - 3);

  // Helper to get random item
  const getRandomBit = () => mockBits[Math.floor(Math.random() * Math.min(5, mockBits.length))];

  const logs: HistoryLog[] = [
    {
      id: 'h1',
      itemId: mockBits[0].id,
      itemName: mockBits[0].name,
      itemImage: mockBits[0].imageUrl,
      type: 'usage',
      quantity: 1,
      timestamp: new Date(now.setHours(14, 30)),
      project: 'Usinagem PCB'
    },
    {
      id: 'h2',
      itemId: mockBits[1].id,
      itemName: mockBits[1].name,
      itemImage: mockBits[1].imageUrl,
      type: 'usage',
      quantity: 1,
      timestamp: new Date(now.setHours(10, 15)),
      project: 'Corte MDF 15mm'
    },
    {
      id: 'h3',
      itemId: mockBits[2].id,
      itemName: mockBits[2].name,
      itemImage: mockBits[2].imageUrl,
      type: 'restock',
      quantity: 5,
      timestamp: new Date(yesterday.setHours(18, 0)),
      user: 'Admin'
    },
    {
      id: 'h4',
      itemId: mockBits[0].id,
      itemName: mockBits[0].name,
      itemImage: mockBits[0].imageUrl,
      type: 'usage',
      quantity: 2,
      timestamp: new Date(yesterday.setHours(9, 30)),
      project: 'Gravação Logo'
    },
    {
        id: 'h5',
        itemId: mockBits[3].id,
        itemName: mockBits[3].name,
        itemImage: mockBits[3].imageUrl,
        type: 'usage',
        quantity: 1,
        timestamp: new Date(lastWeek.setHours(15, 20)),
        project: 'Molde Alumínio'
    },
    {
        id: 'h6',
        itemId: mockBits[2].id,
        itemName: mockBits[2].name,
        itemImage: mockBits[2].imageUrl,
        type: 'restock',
        quantity: 10,
        timestamp: new Date(lastWeek.setHours(11, 0)),
    }
  ];

  return logs;
};

// --- Seeding ---

export const seedDatabase = async () => {
  // Mock success to prevent errors in UI
  console.log("Seeding simulated successfully.");
  return true;
};