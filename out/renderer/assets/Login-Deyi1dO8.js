import { u as ue, s as sanitizeUserSession, a as setUserSession, r as reactExports, j as jsxRuntimeExports, c as cn, b as useNavigate, B as Button, l as loginUserFn, d as routes, g as getUserSession } from "./index-Bzxp2TFY.js";
import { u as useForm, t, o as objectType, s as stringType } from "./types-eVLlK2xq.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
const getBootstrapStatusFn = async () => {
  try {
    const status = await window.api.auth.getBootstrapStatus();
    return {
      hasUsers: Boolean(status?.hasUsers)
    };
  } catch (error) {
    ue.error(error.message || "");
    return { hasUsers: true };
  }
};
const createInitialAdminFn = async (values, cb) => {
  try {
    const user = await window.api.auth.createInitialAdmin(values);
    const session = sanitizeUserSession(user);
    if (!session) {
      throw new Error("Invalid user session");
    }
    setUserSession(session);
    if (cb) ;
    return session;
  } catch (error) {
    ue.error(error.message || "");
    return null;
  }
};
const Card = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    ref,
    className: cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
const CardHeader = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
const CardTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "h3",
  {
    ref,
    className: cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
const CardDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "p",
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
const CardContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
const CardFooter = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";
const schema$1 = objectType({
  username: stringType().min(1, "Required"),
  password: stringType().min(1, "Required")
});
const LoginForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: t(schema$1)
  });
  const onSubmit = async (values) => {
    const session = await loginUserFn(values);
    if (!session) {
      return;
    }
    navigate(routes.INVOICE);
    reset();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm", children: "JV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "JoyVet Sales" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sign in to continue to the desktop workspace." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Login to your account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Enter your username and password below to access JoyVet Sales." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "username", children: "Username" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "username",
                placeholder: "Enter your username",
                type: "text",
                autoComplete: "username",
                ...register("username")
              }
            ),
            errors.username && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.username.message })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Internal access only" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "password",
                placeholder: "Enter your password",
                type: "password",
                autoComplete: "current-password",
                ...register("password")
              }
            ),
            errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.password.message })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardFooter, { className: "flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting, children: isSubmitting ? "Signing in..." : "Login" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "Use the staff credentials assigned to this workstation." })
        ] })
      ] })
    ] })
  ] });
};
const schema = objectType({
  fullName: stringType().min(3, "Required"),
  username: stringType().min(3, "Required"),
  password: stringType().min(3, "Required")
});
const InitialAdminSetupForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: t(schema),
    defaultValues: {
      fullName: "",
      username: "",
      password: ""
    }
  });
  const onSubmit = async (values) => {
    const session = await createInitialAdminFn(values);
    if (!session) {
      return;
    }
    navigate(routes.INVOICE);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm", children: "JV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Set Up JoyVet Sales" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Create the first administrator account for this workstation." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Create Initial Admin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "This runs once for a new database before standard staff sign-in is available." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: "Full Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "fullName",
                placeholder: "Enter the administrator name",
                type: "text",
                autoComplete: "name",
                ...register("fullName")
              }
            ),
            errors.fullName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.fullName.message })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "username", children: "Username" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "username",
                placeholder: "Choose a username",
                type: "text",
                autoComplete: "username",
                ...register("username")
              }
            ),
            errors.username && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.username.message })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "password",
                placeholder: "Create a password",
                type: "password",
                autoComplete: "new-password",
                ...register("password")
              }
            ),
            errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.password.message })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardFooter, { className: "flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting, children: isSubmitting ? "Creating admin..." : "Create Admin Account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "Save these credentials securely. Future access uses the normal login screen." })
        ] })
      ] })
    ] })
  ] });
};
const LoginScreen = () => {
  const navigate = useNavigate();
  const [hasUsers, setHasUsers] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let active = true;
    const hydrateBootstrapState = async () => {
      if (getUserSession()) {
        navigate(routes.INVOICE);
        return;
      }
      const status = await getBootstrapStatusFn();
      if (active) {
        setHasUsers(status.hasUsers);
      }
    };
    hydrateBootstrapState();
    return () => {
      active = false;
    };
  }, [navigate]);
  if (hasUsers === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-svh w-full items-center justify-center bg-muted/40 p-6 md:p-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading workspace..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-svh w-full items-center justify-center bg-muted/40 p-6 md:p-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-sm", children: hasUsers ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoginForm, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(InitialAdminSetupForm, {}) }) });
};
export {
  LoginScreen as default
};
