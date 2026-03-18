import { u as ue, r as reactExports, e as useSidebarContext, j as jsxRuntimeExports, B as Button } from "./index-Bzxp2TFY.js";
import { D as DashboardLayout, T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CxVkuaOT.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { u as useForm, t, o as objectType, s as stringType } from "./types-eVLlK2xq.js";
import { P as Plus } from "./plus-DCxA-ihm.js";
const getStoreInfoFn = async () => {
  try {
    return await window.api.storeInfo.getAll();
  } catch (error) {
    ue.error(error.message || "");
    return [];
  }
};
const getSingleStoreInfoFn = async (id, cb) => {
  try {
    const response = await window.api.storeInfo.getById(id);
    if (cb) ;
    return response;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const deleteStoreInfoFn = async (id, cb) => {
  try {
    await window.api.storeInfo.delete(id);
    ue.success("Store Info successfully deleted");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const createStoreInfoFn = async (values, cb) => {
  try {
    await window.api.storeInfo.create(values);
    if (cb) cb();
  } catch (error) {
    ue.error(error.message || "");
  }
};
const updateStoreInfoFn = async (values, id, cb) => {
  try {
    await window.api.storeInfo.update(id, values);
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const EditStoreInfo = ({
  storeInfoId
}) => {
  const [storeInfo, setStoreInfo] = reactExports.useState({});
  const [values, setValues] = reactExports.useState({
    storeName: "",
    address: "",
    phoneNumber: ""
  });
  const { closeSideContent } = useSidebarContext();
  reactExports.useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleStoreInfoFn(Number(storeInfoId));
      setStoreInfo(response);
      setValues({
        storeName: response.storeName || "",
        address: response.address || "",
        phoneNumber: response.phoneNumber || ""
      });
    };
    fetchData();
  }, [storeInfoId]);
  const deleteStoreInfo = async () => {
    await deleteStoreInfoFn(Number(storeInfoId));
    await getStoreInfoFn();
    closeSideContent();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateStoreInfoFn(values, Number(storeInfoId));
    closeSideContent();
    await getStoreInfoFn();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "storeName", children: "Store name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "storeName",
          placeholder: "Store name",
          type: "text",
          value: values.storeName,
          onChange: (e) => setValues({ ...values, storeName: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "address", children: "Address" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "address",
          placeholder: "Address",
          type: "text",
          value: values.address,
          onChange: (e) => setValues({ ...values, address: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phoneNumber", children: "Phone number" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "phoneNumber",
          placeholder: "Phone number",
          type: "text",
          value: values.phoneNumber,
          onChange: (e) => setValues({ ...values, phoneNumber: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Update" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        className: "w-full mt-2",
        onClick: deleteStoreInfo,
        type: "button",
        variant: "destructive",
        children: "Delete"
      }
    )
  ] });
};
const schema = objectType({
  storeName: stringType().min(1, "Required"),
  address: stringType().min(1, "Required"),
  phoneNumber: stringType().min(1, "Required")
});
const CreateStoreInfo = ({
  createStoreInfoFn: createStoreInfoFn2
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: t(schema),
    defaultValues: {
      storeName: "",
      address: "",
      phoneNumber: ""
    }
  });
  const onSubmit = (values) => {
    createStoreInfoFn2(values);
    reset();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "storeName", children: "Store name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "storeName",
          placeholder: "Store name",
          type: "text",
          ...register("storeName")
        }
      ),
      errors.storeName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.storeName.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "address", children: "Address" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "address",
          placeholder: "Address",
          type: "text",
          ...register("address")
        }
      ),
      errors.address && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.address.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phoneNumber", children: "Phone number" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "phoneNumber",
          placeholder: "Phone number",
          type: "text",
          ...register("phoneNumber")
        }
      ),
      errors.phoneNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.phoneNumber.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Save" })
  ] });
};
const CONTENT_CREATE = "create";
const CONTENT_EDIT = "edit";
const StoreInfoScreen = () => {
  const [sideContent, setSideContent] = reactExports.useState("");
  const [storeInfoId, setStoreInfoId] = reactExports.useState("");
  const [storeInfos, setStoreInfos] = reactExports.useState([]);
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } = useSidebarContext();
  const fetchStoreInfos = async () => {
    const response = await getStoreInfoFn();
    setStoreInfos(response || []);
  };
  const openSideContent = (content) => {
    openSideBar();
    setSideContent(content);
  };
  reactExports.useEffect(() => {
    fetchStoreInfos();
    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent("");
        setStoreInfoId("");
      };
      closeSideContent();
    };
  }, []);
  const handleNewStoreInfo = (values) => {
    createStoreInfoFn(values, () => {
      fetchStoreInfos();
    });
  };
  const openSingleStoreInfo = (id) => {
    setStoreInfoId(id);
    openSideContent(CONTENT_EDIT);
  };
  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CreateStoreInfo, { createStoreInfoFn: handleNewStoreInfo });
    }
    if (sideContent === CONTENT_EDIT) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EditStoreInfo, { storeInfoId });
    }
    return null;
  };
  const headerContent = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "default",
        size: "sm",
        onClick: () => {
          openSideContent(CONTENT_CREATE);
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          "Create"
        ]
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DashboardLayout,
    {
      screenTitle: "StoreInfos",
      rightSidebar: renderSideContent(),
      headerContent: headerContent(),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Store Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Phone Number" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: storeInfos.map((each) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              onClick: () => openSingleStoreInfo(each.id),
              className: "cursor-pointer hover:bg-muted/50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.storeName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.address }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.phoneNumber })
              ]
            },
            each.id
          );
        }) })
      ] })
    }
  );
};
export {
  StoreInfoScreen as default
};
