import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WarehouseItem {
  id: string;
  bookId: string;
  bookTitle?: string;
  quantity: number;
  minStock: number;
  location: string;
  lastUpdated?: string;
}

export interface WarehouseImport {
  id: string;
  bookId: string;
  bookTitle?: string;
  quantity: number;
  importDate: string;
  supplier?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt?: string;
}

interface WarehouseState {
  items: WarehouseItem[];
  imports: WarehouseImport[];
  loading: boolean;
  error: string | null;
}

const initialState: WarehouseState = {
  items: [],
  imports: [],
  loading: false,
  error: null,
};

const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<WarehouseItem[]>) => {
      state.items = action.payload;
    },
    addItem: (state, action: PayloadAction<WarehouseItem>) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action: PayloadAction<WarehouseItem>) => {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    setImports: (state, action: PayloadAction<WarehouseImport[]>) => {
      state.imports = action.payload;
    },
    addImport: (state, action: PayloadAction<WarehouseImport>) => {
      state.imports.push(action.payload);
    },
    updateImport: (state, action: PayloadAction<WarehouseImport>) => {
      const index = state.imports.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.imports[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setItems,
  addItem,
  updateItem,
  deleteItem,
  setImports,
  addImport,
  updateImport,
  setLoading,
  setError,
} = warehouseSlice.actions;
export default warehouseSlice.reducer;
