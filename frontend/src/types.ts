export interface Book {
  id: string;
  title: string;
  category: string;
  author: string;
  stock: number;
  price: number;
  publisher: string;
  publishYear: number;
  imageUrl?: string;
  // Additional fields for detailed view
  weight?: number; // gram
  pages?: number;
  dimensions?: string;
  description?: string; // New field
  supplier?: string;    // New field (Nhà cung cấp)
  coverForm?: string;   // New field (Hình thức bìa)
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  currentDebt: number;
}

export interface ImportTicket {
  id: string;
  date: string;
  items: {
    bookId: string;
    quantity: number;
  }[];
}

export interface Invoice {
  id: string;
  date: string;
  customerId: string;
  items: {
    bookId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
}

export interface PaymentReceipt {
  id: string;
  date: string;
  customerId: string;
  amount: number;
}

export interface SystemRules {
  minImportQuantity: number; // QĐ1: Số lượng nhập ít nhất
  maxStockBeforeImport: number; // QĐ1: Chỉ nhập các đầu sách có lượng tồn ít hơn X
  maxCustomerDebt: number; // QĐ2: Chỉ bán cho khách nợ không quá X
  minStockAfterSale: number; // QĐ2: Lượng tồn sau khi bán ít nhất là X
  usePaymentRule: boolean; // QĐ4: Sử dụng quy định số tiền thu không vượt quá nợ
}

// Notification System Type
export interface Notification {
  id: string;
  type: 'import' | 'invoice' | 'payment' | 'settings' | 'info';
  title: string;
  message: string;
  timestamp: string; // ISO String
  isRead: boolean;
}


// Report Data Structures
export interface InventoryReportItem {
  bookId: string;
  bookName: string;
  initialStock: number;
  incurredStock: number; // Import - Export
  finalStock: number;
}

export interface DebtReportItem {
  customerId: string;
  customerName: string;
  initialDebt: number;
  incurredDebt: number; // New Debt - Paid
  finalDebt: number;
}