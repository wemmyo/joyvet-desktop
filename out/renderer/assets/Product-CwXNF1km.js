import { j as jsxRuntimeExports, B as Button, r as reactExports, e as useSidebarContext, L as Link, d as routes } from "./index-Bzxp2TFY.js";
import { Z } from "./react-to-print-D67gl_J6.js";
import { D as DashboardLayout, T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CxVkuaOT.js";
import { D as DEFAULT_PAGE, P as PaginationControls, a as DEFAULT_PAGE_SIZE } from "./pagination-p-wugHf2.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { u as useForm, t, o as objectType, s as stringType, c as coerce } from "./types-eVLlK2xq.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { i as isAdmin, n as numberWithCommas } from "./helpers-D3c80cn_.js";
import { a as getSingleProductFn, d as deleteProductFn, u as updateProductFn, s as searchProductFn, g as getProductsFn, c as createProductFn } from "./product.controller-SMDalRLo.js";
import { P as Plus } from "./plus-DCxA-ihm.js";
import { P as Printer } from "./printer-BxDK0O1H.js";
import { R as RefreshCw } from "./refresh-cw-DEY85FrQ.js";
const schema = objectType({
  title: stringType().min(1, "Required"),
  sellPrice: stringType().optional().default(""),
  sellPrice2: stringType().optional().default(""),
  sellPrice3: stringType().optional().default(""),
  buyPrice: stringType().optional().default("")
});
const CreateProduct = ({
  createProductFn: createProductFn2,
  refreshProducts
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: t(schema),
    defaultValues: {
      title: "",
      sellPrice: "",
      sellPrice2: "",
      sellPrice3: "",
      buyPrice: ""
    }
  });
  const onSubmit = (values) => {
    createProductFn2({
      ...values,
      sellPrice: Number(values.sellPrice),
      sellPrice2: Number(values.sellPrice2),
      sellPrice3: Number(values.sellPrice3),
      buyPrice: Number(values.buyPrice)
    });
    refreshProducts();
    reset();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Product Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "title",
          placeholder: "Product Name",
          type: "text",
          ...register("title"),
          className: errors.title ? "border-destructive" : ""
        }
      ),
      errors.title && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive mt-1", children: errors.title.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "buyPrice", children: "Buy Price" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "buyPrice",
          placeholder: "Buy Price",
          type: "number",
          ...register("buyPrice"),
          className: errors.buyPrice ? "border-destructive" : ""
        }
      ),
      errors.buyPrice && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive mt-1", children: errors.buyPrice.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sellPrice", children: "Sell Price" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "sellPrice",
          placeholder: "Sell Price",
          type: "number",
          ...register("sellPrice"),
          className: errors.sellPrice ? "border-destructive" : ""
        }
      ),
      errors.sellPrice && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive mt-1", children: errors.sellPrice.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sellPrice2", children: "Sell Price 2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "sellPrice2",
          placeholder: "Sell Price 2",
          type: "number",
          ...register("sellPrice2"),
          className: errors.sellPrice2 ? "border-destructive" : ""
        }
      ),
      errors.sellPrice2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive mt-1", children: errors.sellPrice2.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sellPrice3", children: "Sell Price 3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "sellPrice3",
          placeholder: "Sell Price 3",
          type: "number",
          ...register("sellPrice3"),
          className: errors.sellPrice3 ? "border-destructive" : ""
        }
      ),
      errors.sellPrice3 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive mt-1", children: errors.sellPrice3.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Save" })
  ] });
};
const editProductSchema = objectType({
  title: stringType().min(1, "Title is required"),
  stock: coerce.number().min(0, "Stock is required"),
  sellPrice: coerce.number().min(0, "Sell price is required"),
  sellPrice2: coerce.number().min(0),
  sellPrice3: coerce.number().min(0),
  buyPrice: coerce.number().min(0, "Buy price is required")
});
const EditProduct = ({
  productId,
  refreshProducts
}) => {
  const [product, setProduct] = reactExports.useState({});
  const { closeSideContent } = useSidebarContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: t(editProductSchema),
    defaultValues: {
      title: "",
      stock: 0,
      sellPrice: 0,
      sellPrice2: 0,
      sellPrice3: 0,
      buyPrice: 0
    }
  });
  reactExports.useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleProductFn(Number(productId));
      setProduct(response);
      reset({
        title: response.title || "",
        stock: response.stock || 0,
        sellPrice: response.sellPrice || 0,
        sellPrice2: response.sellPrice2 || 0,
        sellPrice3: response.sellPrice3 || 0,
        buyPrice: response.buyPrice || 0
      });
    };
    fetchData();
  }, [productId, reset]);
  const onDeleteProduct = async () => {
    await deleteProductFn(Number(productId));
    closeSideContent();
    refreshProducts();
  };
  const onSubmit = async (values) => {
    await updateProductFn(
      {
        ...values,
        stock: Number(values.stock),
        sellPrice: Number(values.sellPrice),
        sellPrice2: Number(values.sellPrice2),
        sellPrice3: Number(values.sellPrice3),
        buyPrice: Number(values.buyPrice)
      },
      Number(productId)
    );
    closeSideContent();
    refreshProducts();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(onSubmit), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Title" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "title",
          type: "text",
          placeholder: "Title",
          ...register("title")
        }
      ),
      errors.title && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.title.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "stock", children: "Number In Stock" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "stock",
          type: "number",
          placeholder: "Number In Stock",
          disabled: !isAdmin(),
          ...register("stock")
        }
      ),
      errors.stock && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.stock.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "buyPrice", children: "Buy Price" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "buyPrice",
          type: "number",
          placeholder: "Buy Price",
          ...register("buyPrice")
        }
      ),
      errors.buyPrice && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.buyPrice.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sellPrice", children: "Sell Price" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "sellPrice",
          type: "number",
          placeholder: "Sell Price",
          ...register("sellPrice")
        }
      ),
      errors.sellPrice && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.sellPrice.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sellPrice2", children: "Sell Price 2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "sellPrice2",
          type: "number",
          placeholder: "Sell Price 2",
          ...register("sellPrice2")
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sellPrice3", children: "Sell Price 3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "sellPrice3",
          type: "number",
          placeholder: "Sell Price 3",
          ...register("sellPrice3")
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Update" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full mt-2", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `${routes.PRODUCT}/${productId}`, children: "History" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "destructive",
        className: "w-full mt-2",
        type: "button",
        onClick: onDeleteProduct,
        children: "Delete"
      }
    )
  ] }) });
};
const CONTENT_CREATE = "create";
const CONTENT_EDIT = "edit";
const ProductsScreen = () => {
  const [sideContent, setSideContent] = reactExports.useState("");
  const [productId, setProductId] = reactExports.useState("");
  const [searchValue, setSearchValue] = reactExports.useState("");
  const [appliedSearch, setAppliedSearch] = reactExports.useState("");
  const [products, setProducts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(DEFAULT_PAGE);
  const [total, setTotal] = reactExports.useState(0);
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } = useSidebarContext();
  const componentRef = reactExports.useRef(null);
  const handlePrint = Z({});
  const fetchProducts = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    const response = search ? await searchProductFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE,
      search
    }) : await getProductsFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE
    });
    setProducts(response.rows ?? []);
    setTotal(response.total ?? 0);
    setLoading(false);
  };
  const openSideContent = (content) => {
    openSideBar();
    setSideContent(content);
  };
  reactExports.useEffect(() => {
    void fetchProducts(page, appliedSearch);
    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent("");
        setProductId("");
      };
      closeSideContent();
    };
  }, [appliedSearch, page]);
  const handleNewProduct = async (values) => {
    await createProductFn(values);
    await fetchProducts();
  };
  const openSingleProduct = (id) => {
    setProductId(id);
    openSideContent(CONTENT_EDIT);
  };
  const sum = (prev, next) => {
    return prev + next;
  };
  const sumOfStockValue = () => {
    if (products.length === 0) {
      return 0;
    }
    return products.map((item) => {
      return item.stock * item.buyPrice;
    }).reduce(sum);
  };
  const renderRows = () => {
    const rows = products.map((each, index) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          onClick: () => openSingleProduct(each.id),
          className: "cursor-pointer hover:bg-muted/50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: index + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.stock }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(each.buyPrice) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(each.sellPrice) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(each.sellPrice2) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(each.sellPrice3) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(each.stock * each.buyPrice) })
          ]
        },
        each.id
      );
    });
    return rows;
  };
  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        CreateProduct,
        {
          createProductFn: handleNewProduct,
          refreshProducts: fetchProducts
        }
      );
    }
    if (sideContent === CONTENT_EDIT) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EditProduct, { productId, refreshProducts: fetchProducts });
    }
    return null;
  };
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };
  const headerContent = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            openSideContent(CONTENT_CREATE);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
            "Create"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: handlePrint, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          onClick: () => {
            void fetchProducts(page, appliedSearch);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-1 h-4 w-4" }),
            "Refresh"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "form",
        {
          onSubmit: (e) => {
            e.preventDefault();
            setAppliedSearch(searchValue.trim());
            setPage(DEFAULT_PAGE);
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search Product",
              onChange: (event) => {
                handleSearchChange(event);
                if (event.target.value.trim() === "" && appliedSearch !== "") {
                  setAppliedSearch("");
                  setPage(DEFAULT_PAGE);
                }
              },
              value: searchValue
            }
          )
        }
      )
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DashboardLayout,
    {
      screenTitle: "Products",
      rightSidebar: renderSideContent(),
      headerContent: headerContent(),
      children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: componentRef, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "No" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Buy Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sell Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sell Price 2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sell Price 3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Stock Value" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderRows() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm font-semibold text-right", children: [
          "Total: ₦",
          numberWithCommas(sumOfStockValue())
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PaginationControls,
          {
            page,
            pageSize: DEFAULT_PAGE_SIZE,
            total,
            onPageChange: setPage
          }
        )
      ] })
    }
  );
};
export {
  ProductsScreen as default
};
