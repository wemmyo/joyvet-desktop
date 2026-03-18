import { o as useParams, r as reactExports, j as jsxRuntimeExports, B as Button } from "./index-Bzxp2TFY.js";
import { Z } from "./react-to-print-D67gl_J6.js";
import { u as useForm, t, C as Controller, o as objectType, s as stringType, c as coerce } from "./types-eVLlK2xq.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { b as TableRow, e as TableCell, D as DashboardLayout, T as Table, a as TableHeader, c as TableHead, d as TableBody } from "./table-CxVkuaOT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BYhGLuyS.js";
import { n as numberWithCommas } from "./helpers-D3c80cn_.js";
import { g as getSingleInvoiceFn, a as deleteInvoiceItemFn, R as ReceiptWrapper, b as addInvoiceItemFn } from "./invoice.controller-d7K8AFkH.js";
import { g as getProductsFn } from "./product.controller-SMDalRLo.js";
const invoiceItemSchema = objectType({
  quantity: coerce.number().min(1, "Quantity is required"),
  unitPrice: coerce.number().min(0, "Unit price is required"),
  product: stringType().min(1, "Product is required")
});
const InvoiceScreen = () => {
  const { id } = useParams();
  const invoiceId = Number(id);
  const hasValidInvoiceId = Number.isInteger(invoiceId) && invoiceId > 0;
  const componentRef = reactExports.useRef(null);
  const handlePrint = Z({});
  const [invoiceItems, setInvoiceItems] = reactExports.useState([]);
  const [invoice, setInvoice] = reactExports.useState({});
  const [printInvoice, setPrintInvoice] = reactExports.useState(false);
  const [singleCustomer, setSingleCustomer] = reactExports.useState({});
  const [products, setProducts] = reactExports.useState([]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: t(invoiceItemSchema),
    defaultValues: { quantity: 0, unitPrice: 0, product: "" }
  });
  const watchedProduct = watch("product");
  const fetchData = reactExports.useCallback(async () => {
    if (!hasValidInvoiceId) {
      setProducts([]);
      setInvoiceItems([]);
      setInvoice({});
      setSingleCustomer({});
      return;
    }
    const getproducts = getProductsFn({ filter: "inStock" });
    const getSingleInvoice = getSingleInvoiceFn(invoiceId);
    const [productsResponse, singleInvoiceResponse] = await Promise.all([
      getproducts,
      getSingleInvoice
    ]);
    if (!singleInvoiceResponse) {
      return;
    }
    setProducts(productsResponse.rows ?? []);
    setInvoice({
      ...singleInvoiceResponse,
      customerId: singleInvoiceResponse.customer.id,
      saleType: singleInvoiceResponse.saleType,
      id: singleInvoiceResponse.id,
      createdAt: singleInvoiceResponse.createdAt
    });
    const invoiceItemList = [];
    singleInvoiceResponse.products.forEach((product) => {
      const { invoiceItem } = product;
      const item = {
        id: invoiceItem.id,
        quantity: invoiceItem.quantity,
        unitPrice: invoiceItem.unitPrice,
        amount: invoiceItem.amount,
        profit: invoiceItem.profit,
        product
      };
      invoiceItemList.push(item);
    });
    setInvoiceItems(invoiceItemList);
    setSingleCustomer(singleInvoiceResponse.customer);
  }, [hasValidInvoiceId, invoiceId]);
  reactExports.useEffect(() => {
    fetchData();
  }, [invoiceId, fetchData]);
  const removeInvoiceItem = async (invoiceItemId, productId) => {
    await deleteInvoiceItemFn({
      productId,
      invoiceId,
      invoiceItemId
    });
    fetchData();
  };
  const renderPrices = (product) => {
    const productPrices = [
      { label: "Level 1", value: product.sellPrice, priceLevel: 1 },
      { label: "Level 2", value: product.sellPrice2, priceLevel: 2 },
      { label: "Level 3", value: product.sellPrice3, priceLevel: 3 },
      { label: "Level 4", value: product.buyPrice, priceLevel: 4 }
    ];
    let filteredPriceLevel = [];
    if (singleCustomer?.maxPriceLevel) {
      const availablePrices = productPrices.filter(
        (price) => singleCustomer.maxPriceLevel >= price.priceLevel
      );
      filteredPriceLevel = availablePrices;
    } else {
      const defaultPrices = productPrices.filter(
        (price) => price.priceLevel <= 2
      );
      filteredPriceLevel = defaultPrices;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "unitPrice", children: "Unit Price" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "unitPrice",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              onValueChange: (val) => field.onChange(Number(val)),
              value: field.value ? String(field.value) : "",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Price" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: filteredPriceLevel.map((price) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(price.value), children: `${price.label}: ₦${numberWithCommas(price.value)}` }, price.label)) })
              ]
            }
          )
        }
      ),
      errors.unitPrice && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.unitPrice.message })
    ] });
  };
  const renderOrders = invoiceItems.map((invoiceItem, index) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: index + 1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoiceItem.product?.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoiceItem.quantity }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(invoiceItem.unitPrice) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(invoiceItem.amount) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => {
            removeInvoiceItem(invoiceItem.id, invoiceItem.product.id);
          },
          variant: "destructive",
          size: "sm",
          children: "Remove"
        }
      ) })
    ] }, invoiceItem.id);
  });
  const renderInvoiceToPrint = () => {
    if (printInvoice) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptWrapper, { ref: componentRef, invoice }) });
    }
    return null;
  };
  const handlePrintInvoice = () => {
    setPrintInvoice(true);
  };
  reactExports.useEffect(() => {
    if (printInvoice) {
      handlePrint?.();
      setPrintInvoice(false);
    }
  }, [printInvoice, handlePrint]);
  const disabledAdditem = () => {
    const invoiceDate = dayjs(invoice?.createdAt).format("DD/MM/YYYY");
    const todaysDate = dayjs().format("DD/MM/YYYY");
    if (invoiceDate === todaysDate) {
      return false;
    }
    return true;
  };
  const onSubmit = async (values) => {
    if (!hasValidInvoiceId) {
      return;
    }
    const product = JSON.parse(values.product);
    const quantity = Number(values.quantity);
    const unitPrice = Number(values.unitPrice);
    const amount = unitPrice * quantity;
    const profit = (unitPrice - product.buyPrice) * quantity;
    const updatedItem = {
      quantity,
      unitPrice,
      amount,
      profit,
      product
    };
    await addInvoiceItemFn(invoice, updatedItem);
    await fetchData();
    reset({ quantity: 0, unitPrice: 0, product: "" });
  };
  if (!hasValidInvoiceId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, { screenTitle: "Edit Invoice", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Invalid invoice selected." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, { screenTitle: "Update Invoice", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold mb-3", children: [
        "Total: ₦",
        invoice?.amount ? numberWithCommas(invoice.amount) : 0
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "No" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Unit Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderOrders })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm font-semibold text-right", children: [
        "Total: ₦",
        invoice?.amount ? numberWithCommas(invoice.amount) : 0
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Note: Use same price level when updating existing product quantity" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-72 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(onSubmit), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "customer", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { disabled: true, value: singleCustomer.fullName || "", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: singleCustomer.fullName }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: singleCustomer.fullName && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: singleCustomer.fullName, children: singleCustomer.fullName }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "saleType", children: "Sale Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { disabled: true, value: invoice?.saleType || "", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: invoice?.saleType }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: invoice?.saleType && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: invoice.saleType, children: invoice.saleType }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "product", children: "Product" }),
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
                    setValue("unitPrice", 0);
                  },
                  value: field.value,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Product" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: products.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectItem,
                      {
                        value: JSON.stringify(product),
                        children: product.title
                      },
                      product.id
                    )) })
                  ]
                }
              )
            }
          ),
          errors.product && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.product.message })
        ] }),
        watchedProduct ? renderPrices(JSON.parse(watchedProduct)) : null,
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            className: "w-full",
            disabled: disabledAdditem(),
            children: "Add Item"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handlePrintInvoice,
          type: "button",
          className: "w-full",
          variant: "outline",
          children: "Print"
        }
      ),
      renderInvoiceToPrint()
    ] }) }) }) })
  ] }) });
};
export {
  InvoiceScreen as default
};
