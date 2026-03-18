import { j as jsxRuntimeExports, B as Button } from "./index-Bzxp2TFY.js";
const PaginationControls = ({
  page,
  pageSize,
  total,
  onPageChange
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;
  const pageStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = total === 0 ? 0 : Math.min(page * pageSize, total);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      pageStart,
      "-",
      pageEnd,
      " of ",
      total
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          onClick: () => onPageChange(page - 1),
          disabled: !canGoBack,
          children: "Previous"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Page ",
        page,
        " of ",
        totalPages
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          onClick: () => onPageChange(page + 1),
          disabled: !canGoForward,
          children: "Next"
        }
      )
    ] })
  ] });
};
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
export {
  DEFAULT_PAGE as D,
  PaginationControls as P,
  DEFAULT_PAGE_SIZE as a
};
