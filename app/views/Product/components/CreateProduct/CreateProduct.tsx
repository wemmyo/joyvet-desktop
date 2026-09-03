import { zodResolver } from '@hookform/resolvers/zod';
import type * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { IProduct } from '../../../../models/product';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  sellPrice: z.string().optional().default(''),
  sellPrice2: z.string().optional().default(''),
  sellPrice3: z.string().optional().default(''),
  buyPrice: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

export interface CreateProductProps {
  createProductFn: (values: Partial<IProduct>) => Promise<unknown>;
  refreshProducts: () => void;
}

const CreateProduct: React.FC<CreateProductProps> = ({
  createProductFn,
  refreshProducts,
}: CreateProductProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      sellPrice: '',
      sellPrice2: '',
      sellPrice3: '',
      buyPrice: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const created = await createProductFn({
      ...values,
      sellPrice: Number(values.sellPrice),
      sellPrice2: Number(values.sellPrice2),
      sellPrice3: Number(values.sellPrice3),
      buyPrice: Number(values.buyPrice),
    });
    if (!created) return;
    refreshProducts();
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="title">Product Name</Label>
        <Input
          id="title"
          placeholder="Product Name"
          type="text"
          {...register('title')}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">
            {errors.title.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="buyPrice">Buy Price</Label>
        <Input
          id="buyPrice"
          placeholder="Buy Price"
          type="number"
          step="any"
          {...register('buyPrice')}
          className={errors.buyPrice ? 'border-destructive' : ''}
        />
        {errors.buyPrice && (
          <p className="text-sm text-destructive mt-1">
            {errors.buyPrice.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="sellPrice">Sell Price</Label>
        <Input
          id="sellPrice"
          placeholder="Sell Price"
          type="number"
          step="any"
          {...register('sellPrice')}
          className={errors.sellPrice ? 'border-destructive' : ''}
        />
        {errors.sellPrice && (
          <p className="text-sm text-destructive mt-1">
            {errors.sellPrice.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="sellPrice2">Sell Price 2</Label>
        <Input
          id="sellPrice2"
          placeholder="Sell Price 2"
          type="number"
          step="any"
          {...register('sellPrice2')}
          className={errors.sellPrice2 ? 'border-destructive' : ''}
        />
        {errors.sellPrice2 && (
          <p className="text-sm text-destructive mt-1">
            {errors.sellPrice2.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="sellPrice3">Sell Price 3</Label>
        <Input
          id="sellPrice3"
          placeholder="Sell Price 3"
          type="number"
          step="any"
          {...register('sellPrice3')}
          className={errors.sellPrice3 ? 'border-destructive' : ''}
        />
        {errors.sellPrice3 && (
          <p className="text-sm text-destructive mt-1">
            {errors.sellPrice3.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
};
export default CreateProduct;
