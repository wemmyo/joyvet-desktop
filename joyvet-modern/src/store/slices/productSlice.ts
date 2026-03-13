import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, PaginationParams, PaginatedResponse } from '@/types';

// Mock data matching original structure
const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Product A',
    stock: 100,
    sellPrice: 25,
    sellPrice2: 30,
    sellPrice3: 35,
    buyPrice: 20,
    reorderLevel: 10,
    productCode: 'PROD001',
    numberInPack: 1,
    postedBy: 'admin',
  },
  {
    id: 2,
    title: 'Product B',
    stock: 50,
    sellPrice: 15,
    sellPrice2: 18,
    sellPrice3: 20,
    buyPrice: 12,
    reorderLevel: 5,
    productCode: 'PROD002',
    numberInPack: 1,
    postedBy: 'admin',
  },
  {
    id: 3,
    title: 'Product C',
    stock: 75,
    sellPrice: 40,
    sellPrice2: 45,
    sellPrice3: 50,
    buyPrice: 35,
    reorderLevel: 15,
    productCode: 'PROD003',
    numberInPack: 1,
    postedBy: 'admin',
  },
];

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: PaginationParams) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const { page, limit, search } = params;
    let filteredProducts = mockProducts;

    if (search) {
      filteredProducts = mockProducts.filter(product =>
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.productCode.toLowerCase().includes(search.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit),
    } as PaginatedResponse<Product>;
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: Omit<Product, 'id'>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const newProduct: Product = {
      ...productData,
      id: Math.max(...mockProducts.map(p => p.id)) + 1,
    };

    mockProducts.push(newProduct);
    return newProduct;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (productData: Partial<Product> & { id: number }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockProducts.findIndex(p => p.id === productData.id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...productData };
      return mockProducts[index];
    }
    throw new Error('Product not found');
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: number) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return productId;
    }
    throw new Error('Product not found');
  }
);

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Product> | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  pagination: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      });
  },
});

export const { clearError, setProducts } = productSlice.actions;
export default productSlice.reducer;
