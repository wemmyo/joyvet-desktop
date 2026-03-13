// Base entity interface
export interface BaseEntity {
  id: number;
}

// User interface
export interface User extends BaseEntity {
  fullName: string;
  username: string;
  password: string;
  role: string;
}

// Customer interface
export interface Customer extends BaseEntity {
  fullName: string;
  address: string;
  phoneNumber: string;
  balance: number;
  postedBy: string;
  maxPriceLevel: number;
}

// Product interface
export interface Product extends BaseEntity {
  title: string;
  stock: number;
  sellPrice: number;
  sellPrice2: number;
  sellPrice3: number;
  buyPrice: number;
  reorderLevel: number;
  productCode: string;
  numberInPack: number;
  postedBy: string;
}

// Invoice interface
export interface Invoice extends BaseEntity {
  saleType: string;
  amount: number;
  profit: number;
  postedBy: string;
}

// InvoiceItem interface
export interface InvoiceItem extends BaseEntity {
  quantity: number;
  unitPrice: number;
  amount: number;
  profit: number;
}

// Payment interface
export interface Payment extends BaseEntity {
  amount: number;
  paymentType: string;
  paymentMethod: string;
  bank: string;
  note: string;
  postedBy: string;
}

// Purchase interface
export interface Purchase extends BaseEntity {
  invoiceNumber: string;
  amount: number;
  postedBy: string;
}

// PurchaseItem interface
export interface PurchaseItem extends BaseEntity {
  quantity: number;
  unitPrice: number;
  amount: number;
  sellPrice: number;
  sellPrice2: number;
  sellPrice3: number;
  oldBuyPrice: number;
  oldSellPrice: number;
  oldSellPrice2: number;
  oldSellPrice3: number;
  oldStockLevel: number;
}

// Supplier interface
export interface Supplier extends BaseEntity {
  fullName: string;
  address: string;
  phoneNumber: string;
  balance: number;
  postedBy: string;
}

// Receipt interface
export interface Receipt extends BaseEntity {
  amount: number;
  paymentType: string;
  paymentMethod: string;
  bank: string;
  note: string;
  postedBy: string;
}

// Expense interface
export interface Expense extends BaseEntity {
  date: Date;
  amount: number;
  type: string;
  note: string;
  postedBy: string;
}

// ExpenseType interface
export interface ExpenseType extends BaseEntity {
  type: string;
}

// StoreInfo interface
export interface StoreInfo extends BaseEntity {
  storeName: string;
  address: string;
  phoneNumber: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Login credentials interface
export interface LoginCredentials {
  username: string;
  password: string;
}

// API response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination parameters interface
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form field interface
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: any;
}
