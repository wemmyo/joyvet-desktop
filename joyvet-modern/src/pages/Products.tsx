import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/store/slices/productSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

const Products: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, pagination } = useAppSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 100, search: searchTerm }));
  }, [dispatch, searchTerm]);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch(createProduct(data));
    setIsCreateDialogOpen(false);
  };

  const handleEditProduct = (data: Partial<Product> & { id: number }) => {
    dispatch(updateProduct(data));
    setIsEditDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(productId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Enter product information</DialogDescription>
            </DialogHeader>
            <ProductForm onSubmit={handleCreateProduct} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            {pagination?.total || 0} products found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Buy Price</TableHead>
                <TableHead>Sell Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.productCode}</TableCell>
                  <TableCell className={product.stock <= product.reorderLevel ? 'text-red-600 font-medium' : ''}>
                    {product.stock}
                  </TableCell>
                  <TableCell>{formatCurrency(product.buyPrice)}</TableCell>
                  <TableCell>{formatCurrency(product.sellPrice)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSubmit={handleEditProduct}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: any) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: product || {
      title: '',
      stock: 0,
      sellPrice: 0,
      sellPrice2: 0,
      sellPrice3: 0,
      buyPrice: 0,
      reorderLevel: 0,
      productCode: '',
      numberInPack: 1,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Product Title</Label>
        <Input
          id="title"
          {...register('title', { required: 'Product title is required' })}
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="productCode">Product Code</Label>
        <Input
          id="productCode"
          {...register('productCode', { required: 'Product code is required' })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            {...register('stock', { valueAsNumber: true, min: 0 })}
          />
        </div>
        <div>
          <Label htmlFor="reorderLevel">Reorder Level</Label>
          <Input
            id="reorderLevel"
            type="number"
            {...register('reorderLevel', { valueAsNumber: true, min: 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buyPrice">Buy Price</Label>
          <Input
            id="buyPrice"
            type="number"
            {...register('buyPrice', { valueAsNumber: true, min: 0 })}
          />
        </div>
        <div>
          <Label htmlFor="sellPrice">Sell Price</Label>
          <Input
            id="sellPrice"
            type="number"
            {...register('sellPrice', { valueAsNumber: true, min: 0 })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">
          {product ? 'Update' : 'Create'} Product
        </Button>
      </div>
    </form>
  );
};

export default Products;
