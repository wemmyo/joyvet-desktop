import { r as reactExports, j as jsxRuntimeExports, B as Button } from "./index-Bzxp2TFY.js";
import { u as useForm, C as Controller, t, o as objectType, c as coerce, s as stringType } from "./types-eVLlK2xq.js";
import { D as DashboardLayout, T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CxVkuaOT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BYhGLuyS.js";
import { a as getSuppliersFn } from "./supplier.controller-C7GcSgos.js";
import { g as getProductsFn } from "./product.controller-SMDalRLo.js";
import { n as numberWithCommas } from "./helpers-D3c80cn_.js";
import { c as createPurchaseFn } from "./purchase.controller-DIv4x-U5.js";
const itemSchema = objectType({
  supplierId: stringType().min(1, "Supplier is required"),
  invoiceNumber: stringType().min(1, "Invoice number is required"),
  product: stringType().min(1, "Product is required"),
  unitPrice: coerce.number().min(0, "Unit price is required"),
  quantity: coerce.number().min(1, "Quantity is required"),
  newSellPrice: coerce.number().min(0),
  newSellPrice2: coerce.number().min(0),
  newSellPrice3: coerce.number().min(0)
});
const PurchaseScreen = () => {
  const [orders, setOrders] = reactExports.useState([]);
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: t(itemSchema),
    defaultValues: {
      supplierId: "",
      invoiceNumber: "",
      product: "",
      unitPrice: 0,
      quantity: 0,
      newSellPrice: 0,
      newSellPrice2: 0,
      newSellPrice3: 0
    }
  });
  const watchedValues = watch();
  reactExports.useEffect(() => {
    const fetchData = async () => {
      const getSuppliers = getSuppliersFn();
      const getProducts = getProductsFn();
      const [suppliersResponse, productsResponse] = await Promise.all([
        getSuppliers,
        getProducts
      ]);
      setSuppliers(suppliersResponse.rows ?? []);
      setProducts(productsResponse.rows ?? []);
    };
    fetchData();
  }, []);
  const amount = (item) => item.amount;
  const sum = (prev, next) => prev + next;
  const addToOrders = (value) => {
    setOrders([...orders, value]);
  };
  const sumOfOrders = () => {
    if (orders.length === 0) return 0;
    return orders.map(amount).reduce(sum);
  };
  const removeOrder = (orderId) => {
    const filteredOrders = orders.filter(
      (item) => item.orderId !== orderId
    );
    setOrders(filteredOrders);
  };
  const renderOrders = () => {
    return orders.map((order, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: index + 1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: order.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: order.quantity }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(order.unitPrice) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(order.amount) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => removeOrder(order.orderId),
          variant: "destructive",
          size: "sm",
          children: "Remove"
        }
      ) })
    ] }, order.orderId));
  };
  const onAddItem = (values) => {
    addToOrders({
      ...JSON.parse(values.product),
      quantity: values.quantity,
      amount: Number(values.unitPrice) * Number(values.quantity),
      unitPrice: values.unitPrice,
      newSellPrice: values.newSellPrice,
      newSellPrice2: values.newSellPrice2,
      newSellPrice3: values.newSellPrice3,
      orderId: (/* @__PURE__ */ new Date()).getUTCMilliseconds()
    });
    reset({
      supplierId: values.supplierId,
      invoiceNumber: values.invoiceNumber,
      product: "",
      unitPrice: 0,
      quantity: 0,
      newSellPrice: 0,
      newSellPrice2: 0,
      newSellPrice3: 0
    });
  };
  const createPurchase = async () => {
    await createPurchaseFn(orders, {
      supplierId: Number(watchedValues.supplierId),
      invoiceNumber: watchedValues.invoiceNumber,
      amount: sumOfOrders(),
      products: orders
    });
    reset();
    setOrders([]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, { screenTitle: "Create Purchase", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold mb-3", children: [
        "Total: ₦",
        numberWithCommas(sumOfOrders())
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "No" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderOrders() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm font-semibold text-right", children: [
        "Total: ₦",
        numberWithCommas(sumOfOrders())
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-72 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(onAddItem), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "supplierId", children: "Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "supplierId",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                onValueChange: field.onChange,
                value: field.value,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Supplier" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.fullName }, s.id)) })
                ]
              }
            )
          }
        ),
        errors.supplierId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.supplierId.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "invoiceNumber", children: "Invoice Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "invoiceNumber",
            placeholder: "Invoice Number",
            ...register("invoiceNumber")
          }
        ),
        errors.invoiceNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.invoiceNumber.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "product", children: "Item" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "product",
              control,
              render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  onValueChange: (val) => {
                    field.onChange(val);
                    if (val) {
                      const parsed = JSON.parse(val);
                      setValue("newSellPrice", parsed.sellPrice);
                      setValue("newSellPrice2", parsed.sellPrice2);
                      setValue("newSellPrice3", parsed.sellPrice3);
                    }
                  },
                  value: field.value,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Item" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: JSON.stringify(p), children: p.title }, p.id)) })
                  ]
                }
              )
            }
          ),
          errors.product && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.product.message })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "unitPrice", children: "Unit Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "unitPrice",
              type: "number",
              placeholder: "Unit Price",
              ...register("unitPrice")
            }
          ),
          errors.unitPrice && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.unitPrice.message })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "quantity", children: "Quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "quantity",
              type: "number",
              placeholder: "Quantity",
              ...register("quantity")
            }
          ),
          errors.quantity && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.quantity.message })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "newSellPrice", children: "Selling Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "newSellPrice",
              type: "number",
              placeholder: "Selling Price",
              ...register("newSellPrice")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "newSellPrice2", children: "Selling Price 2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "newSellPrice2",
              type: "number",
              placeholder: "Selling Price 2",
              ...register("newSellPrice2")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "newSellPrice3", children: "Selling Price 3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "newSellPrice3",
              type: "number",
              placeholder: "Selling Price 3",
              ...register("newSellPrice3")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Add Item" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: createPurchase,
          type: "button",
          className: "w-full",
          variant: "default",
          children: "Save"
        }
      )
    ] }) }) }) })
  ] }) });
};
export {
  PurchaseScreen as default
};
