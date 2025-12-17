
export interface MillingBit {
  id: string;
  name: string;
  type: string; // e.g., "Flat End Mill", "V-Bit"
  diameter: string;
  imageUrl: string;
  stock: number;
  minStock: number;
  material: string; // e.g., "Metal Duro"
  colletSize: string; // e.g., "6mm", "3.175mm"
  hasCollet?: boolean;
  specs?: {
    rpm: number;
    feedRate: number; // mm/min
    plungeRate: number; // mm/min
    stepDown: number; // mm
    totalLength?: number;
    hardness?: string;
    geometry?: string;
  };
  application?: {
    materials: string[];
    cutType: string;
    advantage?: string;
  };
}

export interface Collet {
  id: string;
  name: string;
  size: string;
  type: string; // e.g., "ER11", "ER20"
  description: string;
  stock: number;
  minStock: number;
  isImperial?: boolean;
  imageUrl?: string;
}

export interface HistoryLog {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  type: 'usage' | 'restock'; // 'usage' = retirada, 'restock' = reposição
  quantity: number;
  timestamp: Date;
  user?: string;
  project?: string; // Opcional: para qual projeto foi usado
}