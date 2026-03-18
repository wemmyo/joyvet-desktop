import { e as useSidebarContext, g as getUserSession, j as jsxRuntimeExports, S as SidebarInset, K as SidebarTrigger, B as Button, r as reactExports, c as cn } from "./index-Bzxp2TFY.js";
const layoutShell = "_layoutShell_tg2ex_1";
const mainContainer = "_mainContainer_tg2ex_8";
const header = "_header_tg2ex_19";
const rightSidebar = "_rightSidebar_tg2ex_23";
const rightSidebar__open = "_rightSidebar__open_tg2ex_35";
const rightSidebar__close = "_rightSidebar__close_tg2ex_45";
const rightSidebarInner = "_rightSidebarInner_tg2ex_53";
const rightSidebarClose = "_rightSidebarClose_tg2ex_59";
const headerSection1__title = "_headerSection1__title_tg2ex_63";
const headerSection1__leading = "_headerSection1__leading_tg2ex_67";
const headerSection1__user = "_headerSection1__user_tg2ex_74";
const headerSection1 = "_headerSection1_tg2ex_63";
const headerSection1__avatar = "_headerSection1__avatar_tg2ex_87";
const headerSection1__name = "_headerSection1__name_tg2ex_99";
const headerSection2 = "_headerSection2_tg2ex_104";
const main = "_main_tg2ex_8";
const styles = {
  layoutShell,
  mainContainer,
  header,
  rightSidebar,
  rightSidebar__open,
  rightSidebar__close,
  rightSidebarInner,
  rightSidebarClose,
  headerSection1__title,
  headerSection1__leading,
  headerSection1__user,
  headerSection1,
  headerSection1__avatar,
  headerSection1__name,
  headerSection2,
  main
};
const DashboardLayout = ({
  children,
  screenTitle,
  rightSidebar: rightSidebar2,
  headerContent
}) => {
  const { sideContentisOpen, closeSideContent } = useSidebarContext();
  const user = getUserSession();
  const userFullName = user?.fullName ?? "";
  const avatarLabel = userFullName.slice(0, 2).toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarInset, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.layoutShell, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.mainContainer, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: styles.header, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.headerSection1, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.headerSection1__leading, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarTrigger, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: styles.headerSection1__title, children: screenTitle })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.headerSection1__user, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles.headerSection1__avatar, children: avatarLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: styles.headerSection1__name, children: userFullName })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles.headerSection2, children: headerContent })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: styles.main, children })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "aside",
      {
        className: `${styles.rightSidebar} ${sideContentisOpen ? styles.rightSidebar__open : styles.rightSidebar__close}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.rightSidebarInner, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: styles.rightSidebarClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => {
                closeSideContent();
              },
              children: "Close"
            }
          ) }),
          rightSidebar2
        ] })
      }
    )
  ] }) });
};
const Table = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  "table",
  {
    ref,
    className: cn("w-full caption-bottom text-sm", className),
    ...props
  }
) }));
Table.displayName = "Table";
const TableHeader = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }));
TableHeader.displayName = "TableHeader";
const TableBody = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tbody",
  {
    ref,
    className: cn("[&_tr:last-child]:border-0", className),
    ...props
  }
));
TableBody.displayName = "TableBody";
const TableFooter = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tfoot",
  {
    ref,
    className: cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    ),
    ...props
  }
));
TableFooter.displayName = "TableFooter";
const TableRow = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "tr",
  {
    ref,
    className: cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    ),
    ...props
  }
));
TableRow.displayName = "TableRow";
const TableHead = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "th",
  {
    ref,
    className: cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    ),
    ...props
  }
));
TableHead.displayName = "TableHead";
const TableCell = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "td",
  {
    ref,
    className: cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className),
    ...props
  }
));
TableCell.displayName = "TableCell";
const TableCaption = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "caption",
  {
    ref,
    className: cn("mt-4 text-sm text-muted-foreground", className),
    ...props
  }
));
TableCaption.displayName = "TableCaption";
export {
  DashboardLayout as D,
  Table as T,
  TableHeader as a,
  TableRow as b,
  TableHead as c,
  TableBody as d,
  TableCell as e
};
