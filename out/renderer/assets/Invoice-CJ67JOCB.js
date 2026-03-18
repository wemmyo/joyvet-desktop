import { r as reactExports, j as jsxRuntimeExports, B as Button, u as ue } from "./index-Bzxp2TFY.js";
import { Z } from "./react-to-print-D67gl_J6.js";
import { u as useForm, C as Controller, t, o as objectType, s as stringType } from "./types-eVLlK2xq.js";
import { b as TableRow, e as TableCell, D as DashboardLayout, T as Table, a as TableHeader, c as TableHead, d as TableBody } from "./table-CxVkuaOT.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BYhGLuyS.js";
import { n as numberWithCommas } from "./helpers-D3c80cn_.js";
import { c as createInvoiceFn, R as ReceiptWrapper, g as getSingleInvoiceFn } from "./invoice.controller-d7K8AFkH.js";
import { g as getSingleCustomerFn, a as getCustomersFn } from "./customer.controller-CcI8DpcE.js";
import { g as getProductsFn } from "./product.controller-SMDalRLo.js";
import "./dayjs.min-CRuwFbol.js";
const schema = objectType({
  quantity: stringType().optional().default(""),
  unitPrice: stringType().optional().default(""),
  product: stringType().optional().default(""),
  id: stringType().optional().default(""),
  amount: stringType().optional().default(""),
  profit: stringType().optional().default("")
});
const InvoiceScreen = () => {
  const componentRef = reactExports.useRef(null);
  const handlePrint = Z({});
  const [invoiceItems, setInvoiceItems] = reactExports.useState([]);
  const [invoice, setInvoice] = reactExports.useState();
  const [printInvoice, setPrintInvoice] = reactExports.useState(false);
  const [singleCustomer, setSingleCustomer] = reactExports.useState({});
  const [customers, setCustomers] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [createdInvoice, setCreatedInvoice] = reactExports.useState(
    {}
  );
  const { register, handleSubmit, control, reset, watch, setValue } = useForm({
    resolver: t(schema),
    defaultValues: {
      quantity: "",
      unitPrice: "",
      product: "",
      id: "",
      amount: "",
      profit: ""
    }
  });
  const watchedProduct = watch("product");
  const removeInvoiceItem = (id) => {
    const filteredItems = invoiceItems.filter((item) => item.id !== id);
    setInvoiceItems(filteredItems);
  };
  const updateInvoiceItem = (updatedItem) => {
    if (updatedItem.product?.stock < updatedItem.quantity || updatedItem.product?.reorderLevel < updatedItem.quantity) {
      ue.error(`${updatedItem.product?.title}: Re-order level`, {
        duration: 5e3
      });
    }
    setInvoiceItems((currentItems) => {
      const itemIndex = currentItems.findIndex(
        (item) => item.product?.id === updatedItem.product.id
      );
      if (itemIndex !== -1) {
        const updatedItems = [...currentItems];
        const existingItem = updatedItems[itemIndex];
        const updatedQuantity = existingItem.quantity + updatedItem.quantity;
        const updatedAmount = updatedItem.unitPrice * updatedQuantity;
        const updatedProfit = (updatedItem.unitPrice - updatedItem.product.buyPrice) * updatedQuantity;
        updatedItems[itemIndex] = {
          ...existingItem,
          quantity: updatedQuantity,
          amount: updatedAmount,
          profit: updatedProfit
        };
        return updatedItems;
      }
      return [...currentItems, updatedItem];
    });
  };
  reactExports.useEffect(() => {
    const fetchData = async () => {
      const getCustomers = getCustomersFn();
      const getproducts = getProductsFn({ filter: "inStock" });
      const [customersResponse, productsResponse] = await Promise.all([
        getCustomers,
        getproducts
      ]);
      setCustomers(customersResponse.rows ?? []);
      setProducts(productsResponse.rows ?? []);
    };
    fetchData();
  }, []);
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
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Price" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: filteredPriceLevel.map((price) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(price.value), children: `${price.label}: ₦${numberWithCommas(price.value)}` }, price.label)) })
          ] })
        }
      )
    ] });
  };
  reactExports.useEffect(() => {
    const totalAmount = invoiceItems.reduce(
      (acc, item) => acc + item.amount,
      0
    );
    const totalProfit = invoiceItems.reduce(
      (acc, item) => acc + item.profit,
      0
    );
    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      amount: totalAmount,
      profit: totalProfit
    }));
  }, [invoiceItems]);
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
            removeInvoiceItem(invoiceItem.id);
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
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptWrapper, { ref: componentRef, invoice: createdInvoice }) });
    }
    return null;
  };
  const createInvoice = async () => {
    await createInvoiceFn(invoiceItems, invoice, async (id) => {
      const response = await getSingleInvoiceFn(id);
      setCreatedInvoice(response);
      setPrintInvoice(true);
      handlePrint?.();
      reset();
      setInvoiceItems([]);
      setInvoice(void 0);
      setCreatedInvoice({});
    });
  };
  const onSubmit = (values) => {
    const product = JSON.parse(values.product);
    const quantity = Number(values.quantity);
    const unitPrice = Number(values.unitPrice);
    const amount = unitPrice * quantity;
    const profit = (unitPrice - product.buyPrice) * quantity;
    updateInvoiceItem({
      id: (/* @__PURE__ */ new Date()).getUTCMilliseconds(),
      quantity,
      unitPrice,
      amount,
      profit,
      product
    });
    reset();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, { screenTitle: "Create Invoice", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
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
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-72 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded p-4 space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "customer", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            onValueChange: async (val) => {
              const customerId = Number(val);
              setInvoice({ ...invoice, customerId });
              const response = await getSingleCustomerFn(customerId);
              setSingleCustomer(response);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Customer" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.map((customer) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(customer.id), children: customer.fullName }, customer.id)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "saleType", children: "Sale Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            onValueChange: (val) => setInvoice({ ...invoice, saleType: val }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Sale" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cash", children: "Cash Sales" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "credit", children: "Credit Sales" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "transfer", children: "Transfer" })
              ] })
            ]
          }
        )
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
                    setValue("unitPrice", "");
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
          )
        ] }),
        watchedProduct ? renderPrices(
          JSON.parse(watchedProduct)
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "quantity", children: "Quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "quantity",
              placeholder: "Quantity",
              type: "number",
              ...register("quantity")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Add Item" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          disabled: invoiceItems.length < 1,
          onClick: createInvoice,
          type: "button",
          className: "w-full",
          variant: "default",
          children: "Save"
        }
      ),
      renderInvoiceToPrint()
    ] }) }) })
  ] }) });
};
export {
  InvoiceScreen as default
};
