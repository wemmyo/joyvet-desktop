import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import {
  deleteProductFn,
  getSingleProductFn,
  updateProductFn,
} from '../../../../controllers/product.controller';
import type { IProduct } from '../../../../models/product';
import routes from '../../../../routing/routes';
import { isAdmin } from '../../../../utils/helpers';

export interface EditProductProps {
  productId: string | number;
  refreshProducts: () => void;
}

const editProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  stock: z.coerce.number().min(0, 'Stock is required'),
  sellPrice: z.coerce.number().min(0, 'Sell price is required'),
  sellPrice2: z.coerce.number().min(0),
  sellPrice3: z.coerce.number().min(0),
  buyPrice: z.coerce.number().min(0, 'Buy price is required'),
});

type EditProductFormValues = z.infer<typeof editProductSchema>;

const EditProduct: React.FC<EditProductProps> = ({
  productId,
  refreshProducts,
}: EditProductProps) => {
  const [product, setProduct] = useState<IProduct>({} as IProduct);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { closeSideContent } = useSidebarContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      title: '',
      stock: 0,
      sellPrice: 0,
      sellPrice2: 0,
      sellPrice3: 0,
      buyPrice: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleProductFn(Number(productId));
      if (!response) return;
      setProduct(response);
      reset({
        title: response.title || '',
        stock: response.stock || 0,
        sellPrice: response.sellPrice || 0,
        sellPrice2: response.sellPrice2 || 0,
        sellPrice3: response.sellPrice3 || 0,
        buyPrice: response.buyPrice || 0,
      });
    };
    fetchData();
  }, [productId, reset]);

  const onSuccess = () => {
    closeSideContent();
    refreshProducts();
  };

  const onDeleteProduct = async () => {
    await deleteProductFn(Number(productId), onSuccess);
  };

  const onConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    await onDeleteProduct();
  };

  const onRestoreProduct = async () => {
    await updateProductFn(
      { discontinued: false },
      Number(productId),
      onSuccess
    );
  };

  const onSubmit = async (values: EditProductFormValues) => {
    await updateProductFn(
      {
        ...values,
        stock: Number(values.stock),
        sellPrice: Number(values.sellPrice),
        sellPrice2: Number(values.sellPrice2),
        sellPrice3: Number(values.sellPrice3),
        buyPrice: Number(values.buyPrice),
      },
      Number(productId),
      onSuccess
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="Title"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="stock">Number In Stock</Label>
          <Input
            id="stock"
            type="number"
            step="any"
            placeholder="Number In Stock"
            disabled={!isAdmin()}
            {...register('stock')}
          />
          {errors.stock && (
            <p className="text-sm text-destructive">{errors.stock.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="buyPrice">Buy Price</Label>
          <Input
            id="buyPrice"
            type="number"
            step="any"
            placeholder="Buy Price"
            {...register('buyPrice')}
          />
          {errors.buyPrice && (
            <p className="text-sm text-destructive">
              {errors.buyPrice.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="sellPrice">Sell Price</Label>
          <Input
            id="sellPrice"
            type="number"
            step="any"
            placeholder="Sell Price"
            {...register('sellPrice')}
          />
          {errors.sellPrice && (
            <p className="text-sm text-destructive">
              {errors.sellPrice.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="sellPrice2">Sell Price 2</Label>
          <Input
            id="sellPrice2"
            type="number"
            step="any"
            placeholder="Sell Price 2"
            {...register('sellPrice2')}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="sellPrice3">Sell Price 3</Label>
          <Input
            id="sellPrice3"
            type="number"
            step="any"
            placeholder="Sell Price 3"
            {...register('sellPrice3')}
          />
        </div>

        <Button type="submit" className="w-full">
          Update
        </Button>
        <Button className="w-full mt-2" variant="outline" asChild>
          <Link to={`${routes.PRODUCT}/${productId}`}>History</Link>
        </Button>
        {product.discontinued ? (
          <Button
            variant="outline"
            className="w-full mt-2"
            type="button"
            onClick={onRestoreProduct}
          >
            Restore to catalog
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="w-full mt-2"
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};

export default EditProduct;
