
import { MillingBit } from '../types';

export const MATERIALS_LIST = [
  'MDF',
  'Madeira Maciça',
  'Compensado',
  'Acrílico',
  'Policarbonato',
  'ACM',
  'PVC Expandido',
  'Alumínio',
  'Latão',
  'Cobre'
];

export interface CNCPreset {
  rpm: number;
  feedRate: number;
  plungeRate: number;
  stepDown: number;
  description: string;
}

// Helper to extract number from "6mm" string
const getDiameter = (diaString: string): number => {
  const match = diaString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 3.175; // Default to 1/8" if fail
};

export const calculatePreset = (bit: MillingBit, targetMaterial: string): CNCPreset => {
  const d = getDiameter(bit.diameter);
  const isVBit = bit.type.toLowerCase().includes('v-bit') || bit.type.toLowerCase().includes('vbit');

  // Base Logic per Material
  // Formulas are approximations based on standard chip loads for hobby/semi-pro routers
  
  switch (targetMaterial) {
    case 'MDF':
    case 'Compensado':
      return {
        rpm: 18000,
        feedRate: Math.min(3500, d * 800), // Larger bits = faster
        plungeRate: Math.min(1000, d * 300),
        stepDown: isVBit ? d * 0.8 : d * 0.9, // MDF allows deep cuts
        description: 'Corte agressivo. Use máscara.'
      };

    case 'Madeira Maciça':
      return {
        rpm: 18000,
        feedRate: Math.min(3000, d * 600),
        plungeRate: Math.min(800, d * 250),
        stepDown: d * 0.6, // Harder than MDF
        description: 'Cuidado com nós na madeira.'
      };

    case 'Acrílico':
    case 'Policarbonato':
      return {
        rpm: 16000, // Lower RPM to prevent melting
        feedRate: Math.min(2000, d * 500),
        plungeRate: Math.min(400, d * 150), // Slow plunge to prevent cracking
        stepDown: d * 0.4,
        description: 'RPM médio para não derreter.'
      };

    case 'PVC Expandido':
      return {
        rpm: 18000,
        feedRate: Math.min(3500, d * 900),
        plungeRate: 1000,
        stepDown: d * 1.0, // Very soft
        description: 'Material macio, corte rápido.'
      };

    case 'ACM':
      return {
        rpm: 18000,
        feedRate: Math.min(2500, d * 600),
        plungeRate: 600,
        stepDown: d * 0.5, // Thin layers usually
        description: 'Cuidado com a fixação da chapa.'
      };

    case 'Alumínio':
      return {
        rpm: 14000, // Needs torque, lower RPM usually helps prevent rubbing if feed is low
        feedRate: Math.min(1200, d * 250), // Slow feed
        plungeRate: 200, // Very slow plunge
        stepDown: Math.min(0.5, d * 0.15), // Very shallow passes
        description: 'Use refrigeração ou WD-40.'
      };

    case 'Latão':
    case 'Cobre':
      return {
        rpm: 14000,
        feedRate: Math.min(1000, d * 200),
        plungeRate: 150,
        stepDown: Math.min(0.3, d * 0.1),
        description: 'Requer rigidez da máquina.'
      };

    default:
      // Fallback to whatever is in the DB
      return {
        rpm: bit.specs?.rpm || 0,
        feedRate: bit.specs?.feedRate || 0,
        plungeRate: bit.specs?.plungeRate || 0,
        stepDown: bit.specs?.stepDown || 0,
        description: 'Configuração original do banco de dados.'
      };
  }
};
