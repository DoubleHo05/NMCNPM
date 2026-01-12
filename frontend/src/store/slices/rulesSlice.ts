import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Rule {
  id: string;
  name: string;
  description: string;
  maxBookBorrow?: number;
  borrowDays?: number;
  penaltyPerDay?: number;
  isActive: boolean;
  createdAt?: string;
}

interface RulesState {
  rules: Rule[];
  loading: boolean;
  error: string | null;
}

const initialState: RulesState = {
  rules: [],
  loading: false,
  error: null,
};

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    setRules: (state, action: PayloadAction<Rule[]>) => {
      state.rules = action.payload;
    },
    addRule: (state, action: PayloadAction<Rule>) => {
      state.rules.push(action.payload);
    },
    updateRule: (state, action: PayloadAction<Rule>) => {
      const index = state.rules.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.rules[index] = action.payload;
      }
    },
    deleteRule: (state, action: PayloadAction<string>) => {
      state.rules = state.rules.filter((r) => r.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setRules, addRule, updateRule, deleteRule, setLoading, setError } =
  rulesSlice.actions;
export default rulesSlice.reducer;
