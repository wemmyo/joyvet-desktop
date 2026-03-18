import { r as reactExports, e as useSidebarContext, j as jsxRuntimeExports, B as Button, f as getSingleUserFn, h as updateUserFn, i as getUsersFn, k as deleteUserFn, m as createUserFn } from "./index-Bzxp2TFY.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { D as DashboardLayout, T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CxVkuaOT.js";
import { D as DEFAULT_PAGE, P as PaginationControls, a as DEFAULT_PAGE_SIZE } from "./pagination-p-wugHf2.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BYhGLuyS.js";
import { u as useForm, t, C as Controller, o as objectType, s as stringType } from "./types-eVLlK2xq.js";
import { P as Plus } from "./plus-DCxA-ihm.js";
import { R as RefreshCw } from "./refresh-cw-DEY85FrQ.js";
const EditUser = ({ userId }) => {
  const [user, setUser] = reactExports.useState({});
  const [values, setValues] = reactExports.useState({
    fullName: "",
    username: "",
    role: ""
  });
  const { closeSideContent } = useSidebarContext();
  reactExports.useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleUserFn(Number(userId));
      setUser(response);
      setValues({
        fullName: response.fullName || "",
        username: response.username || "",
        role: response.role || ""
      });
    };
    fetchData();
  }, [userId]);
  const deleteUser = async () => {
    await deleteUserFn(Number(userId));
    await getUsersFn();
    closeSideContent();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUserFn(values, Number(userId));
    closeSideContent();
    await getUsersFn();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: "Full Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "fullName",
          placeholder: "Full Name",
          type: "text",
          value: values.fullName,
          onChange: (e) => setValues({ ...values, fullName: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "username", children: "Username" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "username",
          placeholder: "Username",
          type: "text",
          value: values.username,
          onChange: (e) => setValues({ ...values, username: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "role", children: "Role" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: values.role,
          onValueChange: (val) => setValues({ ...values, role: val }),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Role" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "Admin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Manager" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "staff", children: "Staff" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "newbie", children: "Newbie" })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Update" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        className: "w-full mt-2",
        onClick: deleteUser,
        type: "button",
        variant: "destructive",
        children: "Delete"
      }
    )
  ] });
};
const schema = objectType({
  fullName: stringType().min(1, "Required"),
  username: stringType().optional().default(""),
  password: stringType().optional().default(""),
  role: stringType().optional().default("")
});
const CreateUser = ({
  createUserFn: createUserFn2
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: t(schema),
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
      role: ""
    }
  });
  const onSubmit = (values) => {
    createUserFn2({
      fullName: values.fullName,
      username: values.username || "",
      password: values.password || "",
      role: values.role || ""
    });
    reset();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: "Full Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "fullName",
          placeholder: "Full Name",
          type: "text",
          ...register("fullName")
        }
      ),
      errors.fullName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.fullName.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "username", children: "Username" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "username",
          placeholder: "Username",
          type: "text",
          ...register("username")
        }
      ),
      errors.username && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.username.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "password",
          placeholder: "Password",
          type: "password",
          ...register("password")
        }
      ),
      errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.password.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "role", children: "Role" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "role",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Role" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "Admin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Manager" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "staff", children: "Staff" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "newbie", children: "Newbie" })
            ] })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Save" })
  ] });
};
const CONTENT_CREATE = "create";
const CONTENT_EDIT = "edit";
const UserScreen = () => {
  const [sideContent, setSideContent] = reactExports.useState("");
  const [userId, setUserId] = reactExports.useState("");
  const [users, setUsers] = reactExports.useState([]);
  const [page, setPage] = reactExports.useState(DEFAULT_PAGE);
  const [total, setTotal] = reactExports.useState(0);
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } = useSidebarContext();
  const fetchUsers = async (nextPage = page) => {
    const response = await getUsersFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE
    });
    setUsers(response.rows ?? []);
    setTotal(response.total ?? 0);
  };
  const openSideContent = (content) => {
    openSideBar();
    setSideContent(content);
  };
  reactExports.useEffect(() => {
    void fetchUsers(page);
    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent("");
        setUserId("");
      };
      closeSideContent();
    };
  }, [page]);
  const handleNewUser = (values) => {
    createUserFn(values, () => {
      fetchUsers();
    });
  };
  const openSingleUser = (id) => {
    setUserId(id);
    openSideContent(CONTENT_EDIT);
  };
  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CreateUser, { createUserFn: handleNewUser });
    }
    if (sideContent === CONTENT_EDIT) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EditUser, { userId });
    }
    return null;
  };
  const headerContent = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => {
            void fetchUsers(page);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
            "Refresh"
          ]
        }
      )
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DashboardLayout,
    {
      screenTitle: "Users",
      rightSidebar: renderSideContent(),
      headerContent: headerContent(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Full Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Username" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Created" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: users.map((each) => {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TableRow,
              {
                onClick: () => openSingleUser(each.id),
                className: "cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.fullName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.username }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.role }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(each.createdAt).format("DD/MM/YYYY") })
                ]
              },
              each.id
            );
          }) })
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
      ]
    }
  );
};
export {
  UserScreen as default
};
