
import { supabase } from './supabaseClient';
import { MillingBit, Collet, HistoryLog } from '../types';
import { mockBits, mockCollets } from './mockData';

// --- Mappers ---
const mapBitFromDB = (data: any): MillingBit => ({
  id: data.id,
  name: data.name || '',
  type: data.type || '',
  diameter: data.diameter || '',
  imageUrl: data.image_url || '',
  stock: Number(data.stock || 0),
  minStock: Number(data.min_stock || 0),
  material: data.material || '',
  // Prioridade absoluta para a coluna diam_haste conforme solicitado
  colletSize: data.diam_haste !== undefined && data.diam_haste !== null ? String(data.diam_haste) : String(data.collet_size || ''), 
  recommendedCollet: data.pinca_recomendada || '', 
  hasCollet: !!data.has_collet,
  specs: data.specs || {},
  application: data.application || {},
});

const mapColletFromDB = (data: any): Collet => ({
  id: data.id,
  name: data.name || '',
  size: data.size || '',
  type: data.type || '',
  description: data.description || '',
  stock: Number(data.stock || 0),
  minStock: Number(data.min_stock || 0),
  isImperial: !!data.is_imperial,
  imageUrl: data.image_url || '',
});

const isValidUUID = (id: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

// Helper para tratar erros do Supabase de forma legível
const handleSupabaseError = (error: any, context: string) => {
  let message = 'Erro desconhecido';
  
  if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    message = error.message || error.details || JSON.stringify(error);
  }

  console.error(`[API ${context}] Erro Crítico:`, message);
  throw new Error(`${context}: ${message}`);
};

// --- Bits API ---

export const fetchBits = async (): Promise<MillingBit[]> => {
  try {
    const { data, error } = await supabase.from('bits').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapBitFromDB);
  } catch (error) {
    console.warn('Usando mocks devido a falha no fetch:', error);
    return mockBits;
  }
};

export const fetchBitById = async (id: string): Promise<MillingBit | null> => {
  if (!id) return null;
  if (isValidUUID(id)) {
    try {
      const { data, error } = await supabase.from('bits').select('*').eq('id', id).single();
      if (error) throw error;
      return mapBitFromDB(data);
    } catch (error) {
      console.error('Erro ao buscar bit por ID:', error);
    }
  }
  return mockBits.find(b => b.id === id) || null;
};

export const updateBit = async (id: string, updates: Partial<MillingBit>) => {
  if (!isValidUUID(id)) {
    const idx = mockBits.findIndex(b => b.id === id);
    if (idx !== -1) mockBits[idx] = { ...mockBits[idx], ...updates };
    return;
  }

  try {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.diameter !== undefined) dbUpdates.diameter = updates.diameter;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.stock !== undefined) dbUpdates.stock = Number(updates.stock);
    if (updates.minStock !== undefined) dbUpdates.min_stock = Number(updates.minStock);
    if (updates.material !== undefined) dbUpdates.material = updates.material;
    
    // Vinculação estrita com a coluna diam_haste
    if (updates.colletSize !== undefined) {
      const val = String(updates.colletSize).replace(',', '.');
      const numericVal = parseFloat(val);
      dbUpdates.diam_haste = isNaN(numericVal) ? val : numericVal;
    }
    
    // IMPORTANTE: pinca_recomendada removida pois o banco a gera automaticamente
    if (updates.hasCollet !== undefined) dbUpdates.has_collet = !!updates.hasCollet;
    if (updates.specs !== undefined) dbUpdates.specs = updates.specs;
    if (updates.application !== undefined) dbUpdates.application = updates.application;

    const { error } = await supabase.from('bits').update(dbUpdates).eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'UpdateBit');
  }
};

export const createBit = async (bit: Omit<MillingBit, 'id'>) => {
  try {
    const shankVal = String(bit.colletSize).replace(',', '.');
    const shankNumeric = parseFloat(shankVal);
    const dbPayload = {
      name: bit.name,
      type: bit.type,
      diameter: bit.diameter,
      image_url: bit.imageUrl,
      stock: Number(bit.stock),
      min_stock: Number(bit.minStock),
      material: bit.material,
      // Salva na coluna correta diam_haste
      diam_haste: isNaN(shankNumeric) ? shankVal : shankNumeric,
      // IMPORTANTE: pinca_recomendada removida pois o banco a gera automaticamente
      has_collet: !!bit.hasCollet,
      specs: bit.specs,
      application: bit.application
    };
    const { error } = await supabase.from('bits').insert(dbPayload);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'CreateBit');
  }
};

export const updateBitStock = async (id: string, newStock: number) => {
  if (!isValidUUID(id)) {
    const item = mockBits.find(b => b.id === id);
    if (item) item.stock = newStock;
    return;
  }
  try {
    const { error } = await supabase.from('bits').update({ stock: Number(newStock) }).eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'UpdateStock');
  }
};

export const fetchCollets = async (): Promise<Collet[]> => {
  try {
    const { data, error } = await supabase.from('collets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapColletFromDB);
  } catch (error) {
    return mockCollets;
  }
};

export const updateColletStock = async (id: string, newStock: number) => {
  if (!isValidUUID(id)) {
    const item = mockCollets.find(c => c.id === id);
    if (item) item.stock = newStock;
    return;
  }
  try {
    const { error } = await supabase.from('collets').update({ stock: Number(newStock) }).eq('id', id);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'UpdateColletStock');
  }
};

export const createCollet = async (collet: Omit<Collet, 'id'>) => {
  try {
    const dbPayload = {
      name: collet.name,
      size: collet.size,
      type: collet.type,
      description: collet.description,
      stock: Number(collet.stock),
      min_stock: Number(collet.minStock),
      is_imperial: !!collet.isImperial,
      image_url: collet.imageUrl
    };
    const { error } = await supabase.from('collets').insert(dbPayload);
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'CreateCollet');
  }
};

export const fetchHistory = async (): Promise<HistoryLog[]> => {
  return [
    { id: 'h1', itemId: '1', itemName: 'Exemplo', itemImage: '', type: 'usage', quantity: 1, timestamp: new Date() }
  ];
};

export const seedDatabase = async () => true;
