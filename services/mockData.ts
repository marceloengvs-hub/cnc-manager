
import { MillingBit, Collet } from '../types';

// Helper to convert Drive View links to Direct Image links
const getImageUrl = (originalUrl: string | undefined, index: number) => {
  if (!originalUrl || !originalUrl.startsWith('http')) {
    return `https://ui-avatars.com/api/?name=Fresa+${index}&background=random&size=256&font-size=0.3`;
  }
  const match = originalUrl.match(/\/d\/(.+)\//);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=s400`;
  }
  return originalUrl;
};

/**
 * Lógica de Negócio (Regra Estrita diam_haste):
 * 
 * Input: diam_haste (vindo do DB como 'colletSize' na interface MillingBit)
 */
export const getRequiredColletSize = (shankDia: number | string): { label: string; targetSize: number | null } => {
  if (shankDia === undefined || shankDia === null || shankDia === '') {
     return { label: 'Pinça indisponível', targetSize: null };
  }

  let val: number;
  
  if (typeof shankDia === 'number') {
    val = shankDia;
  } else {
    // Parser robusto para capturar o primeiro número no campo diam_haste
    const normalized = String(shankDia).replace(',', '.');
    const match = normalized.match(/(\d+(\.\d+)?)/);
    val = match ? parseFloat(match[0]) : NaN;
  }
  
  if (isNaN(val)) return { label: 'Pinça indisponível', targetSize: null };
  
  const EPSILON = 0.15; 

  // REGRA 1: Se diam_haste é aprox 3mm (3, 3.175, etc) -> Usar 3.175mm
  if (Math.abs(val - 3) < EPSILON || Math.abs(val - 3.175) < 0.01) {
    return { label: 'Usar Pinça 3.175mm', targetSize: 3.175 };
  }
  
  // REGRA 2: Se diam_haste é aprox 5mm -> Usar 6mm
  if (Math.abs(val - 5) < EPSILON) {
    return { label: 'Usar Pinça 6mm', targetSize: 6 };
  }

  // REGRA 3: Se diam_haste é aprox 6mm -> Usar 6mm
  if (Math.abs(val - 6) < EPSILON) {
    return { label: 'Usar Pinça 6mm', targetSize: 6 };
  }
  
  return { label: 'Pinça indisponível', targetSize: null };
};

/**
 * Verifica se existe uma pinça compatível no estoque.
 */
export const checkColletCompatibility = (shankSize: string | number, collets: Collet[]): boolean => {
  const { targetSize } = getRequiredColletSize(shankSize);
  if (targetSize === null) return false;

  return collets.some(c => {
    if (c.stock <= 0) return false;
    const normalizedSize = c.size.replace(',', '.');
    const match = normalizedSize.match(/(\d+(\.\d+)?)/);
    const numericColletSize = match ? parseFloat(match[0]) : 0;
    return Math.abs(numericColletSize - targetSize) < 0.01;
  });
};

export const mockBits: MillingBit[] = [
  {
    id: '1',
    name: 'Topo reto 3mm',
    type: 'Topo reto',
    diameter: '3mm',
    imageUrl: getImageUrl('', 1),
    stock: 1,
    minStock: 2,
    material: 'Metal Duro (Tungstênio)',
    colletSize: '3',
    recommendedCollet: 'Usar Pinça 3.175mm',
    hasCollet: true,
    specs: { rpm: 18000, feedRate: 1500, plungeRate: 500, stepDown: 1.0, geometry: '2F' },
    application: { materials: ['MDF'], cutType: 'Up-cut' }
  }
];

export const mockCollets: Collet[] = [];
