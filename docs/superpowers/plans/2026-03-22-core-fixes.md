# Core Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three concrete correctness/performance issues in the JoyvetSales desktop app: safe-delete guards, expense endpoint pagination + date-range limits, and type-safety improvements on IPC handlers.

**Architecture:** All fixes are in the Electron main-process IPC layer (`app/main/ipc/`) and the shared type/listing modules. No schema or model changes are needed. Each task produces independently deployable, tested changes.

**Tech Stack:** Electron 28, Sequelize 6 (SQLite), TypeScript 5, Zod, Vitest

---

## Background

Three confirmed issues from the code review:

1. **Safe-delete missing** — `customer:delete`, `supplier:delete`, `product:delete` call `destroy` with no guard. Deleting a customer that owns invoices leaves those invoices with a stale `customerId`, silently corrupting the dataset.

2. **Expense endpoints unbounded** — `expense:getAll` returns every expense row in the DB with no pagination. `expense:filter` applies a date range but has no maximum-range limit (unlike `invoice:filter` which caps at 90 days). `expense:search` also returns all matches. Under load these will become slow and memory-heavy.

3. **Type-safety gaps** — `CoreModels` in `runtime.ts` types every model as `any`. Several IPC handlers accept `values: any` for their main input, bypassing TypeScript entirely. The most impactful places to fix are the shared handler types.

---

## File Map

| File | Change |
|------|--------|
| `app/main/ipc/customer.handlers.ts` | Add pre-delete check (invoices + receipts) |
| `app/main/ipc/supplier.handlers.ts` | Add pre-delete check (purchases + payments) |
| `app/main/ipc/product.handlers.ts` | Add pre-delete check (invoice items + purchase items) |
| `app/main/ipc/expense.handlers.ts` | Add 90-day limit to `expense:filter`; add pagination to `expense:getAll` and `expense:search` |
| `app/main/ipc/listing.ts` | Add `expenseListQuerySchema` |
| `app/types/pagination.ts` | Add `ExpenseListQuery` interface |
| `app/preload/index.ts` | Type `expense.getAll`, `expense.filter`, `expense.search` |
| `app/controllers/expense.controller.ts` | Update `searchExpenseFn` to pass object instead of string |
| `app/controllers/__tests__/expense.controller.test.ts` | Update `searchExpenseFn` test assertion |
| `app/main/runtime.ts` | Replace `any` in `CoreModels` with concrete Sequelize model types |
| `app/main/ipc/__tests__/customer.handlers.test.ts` | New — safe-delete tests |
| `app/main/ipc/__tests__/supplier.handlers.test.ts` | New — safe-delete tests |
| `app/main/ipc/__tests__/product.handlers.test.ts` | New — safe-delete tests |
| `app/main/ipc/__tests__/expense.handlers.test.ts` | New — pagination + date-limit tests |

---

## Task 1: Safe-Delete Guard — Customer

**Files:**
- Modify: `app/main/ipc/customer.handlers.ts:83-88`
- Create: `app/main/ipc/__tests__/customer.handlers.test.ts`

### Step 1.1: Write the failing test

Create `app/main/ipc/__tests__/customer.handlers.test.ts`:

```ts
const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
    on: vi.fn(),
  },
}));

vi.mock('../../runtime', () => ({
  withAppReady: (fn: Function) => fn,
}));

vi.mock('../../../models/customer', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
    increment: vi.fn(),
    decrement: vi.fn(),
  },
}));

vi.mock('../../../models/invoice', () => ({
  default: { count: vi.fn() },
}));

vi.mock('../../../models/receipt', () => ({
  default: { count: vi.fn() },
}));

vi.mock('../../../services/customer.service', () => ({
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  getCustomerById: vi.fn(),
}));

vi.mock('../../../services/receipt.service', () => ({
  getReceipts: vi.fn(),
}));

vi.mock('../../../services/invoice.service', () => ({
  getInvoices: vi.fn(),
}));

import InvoiceModel from '../../../models/invoice';
import ReceiptModel from '../../../models/receipt';
import * as customerService from '../../../services/customer.service';
import { registerCustomerHandlers } from '../customer.handlers';

const mockEvent = {} as any;

beforeEach(() => {
  vi.clearAllMocks();
  registerCustomerHandlers();
});

describe('customer:delete', () => {
  it('throws if customer has invoices', async () => {
    vi.mocked(InvoiceModel.count).mockResolvedValue(3 as any);
    vi.mocked(ReceiptModel.count).mockResolvedValue(0 as any);

    await expect(handlers['customer:delete'](mockEvent, 1)).rejects.toThrow(
      'Cannot delete customer with existing invoices'
    );
    expect(customerService.deleteCustomer).not.toHaveBeenCalled();
  });

  it('throws if customer has receipts', async () => {
    vi.mocked(InvoiceModel.count).mockResolvedValue(0 as any);
    vi.mocked(ReceiptModel.count).mockResolvedValue(2 as any);

    await expect(handlers['customer:delete'](mockEvent, 1)).rejects.toThrow(
      'Cannot delete customer with existing receipts'
    );
    expect(customerService.deleteCustomer).not.toHaveBeenCalled();
  });

  it('deletes successfully when no related records exist', async () => {
    vi.mocked(InvoiceModel.count).mockResolvedValue(0 as any);
    vi.mocked(ReceiptModel.count).mockResolvedValue(0 as any);
    vi.mocked(customerService.deleteCustomer).mockResolvedValue(undefined as any);

    await handlers['customer:delete'](mockEvent, 1);

    expect(customerService.deleteCustomer).toHaveBeenCalledWith(1);
  });
});
```

- [ ] **Step 1.1:** Create the test file above at `app/main/ipc/__tests__/customer.handlers.test.ts`

- [ ] **Step 1.2: Run test to verify it fails**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run app/main/ipc/__tests__/customer.handlers.test.ts
```

Expected: FAIL — `customer:delete` does not yet check for related records.

- [ ] **Step 1.3: Implement the guard in `customer:delete`**

In `app/main/ipc/customer.handlers.ts`, replace the `customer:delete` handler (lines 83–88):

```ts
ipcMain.handle(
  'customer:delete',
  withAppReady(async (_event, id: number) => {
    const invoiceCount = await Invoice.count({ where: { customerId: id } });
    if (invoiceCount > 0) {
      throw new Error(
        `Cannot delete customer with existing invoices (${invoiceCount} found). Remove invoices first.`
      );
    }

    const receiptCount = await Receipt.count({ where: { customerId: id } });
    if (receiptCount > 0) {
      throw new Error(
        `Cannot delete customer with existing receipts (${receiptCount} found). Remove receipts first.`
      );
    }

    await deleteCustomer(id);
  })
);
```

`Invoice` and `Receipt` are already imported at the top of the file.

- [ ] **Step 1.4: Run test to verify it passes**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run app/main/ipc/__tests__/customer.handlers.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 1.5: Commit**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop
git add app/main/ipc/customer.handlers.ts app/main/ipc/__tests__/customer.handlers.test.ts
git commit -m "fix: guard customer:delete against orphaned invoices and receipts"
```

---

## Task 2: Safe-Delete Guard — Supplier

**Files:**
- Modify: `app/main/ipc/supplier.handlers.ts:77-82`
- Create: `app/main/ipc/__tests__/supplier.handlers.test.ts`

- [ ] **Step 2.1: Create the test file** at `app/main/ipc/__tests__/supplier.handlers.test.ts`:

```ts
const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
    on: vi.fn(),
  },
}));

vi.mock('../../runtime', () => ({
  withAppReady: (fn: Function) => fn,
}));

vi.mock('../../../models/supplier', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
  },
}));

vi.mock('../../../models/purchase', () => ({
  default: { count: vi.fn() },
}));

vi.mock('../../../models/payment', () => ({
  default: { count: vi.fn() },
}));

vi.mock('../../../services/supplier.service', () => ({
  createSupplier: vi.fn(),
  updateSupplier: vi.fn(),
  deleteSupplier: vi.fn(),
  getSupplierById: vi.fn(),
}));

import PurchaseModel from '../../../models/purchase';
import PaymentModel from '../../../models/payment';
import * as supplierService from '../../../services/supplier.service';
import { registerSupplierHandlers } from '../supplier.handlers';

const mockEvent = {} as any;

beforeEach(() => {
  vi.clearAllMocks();
  registerSupplierHandlers();
});

describe('supplier:delete', () => {
  it('throws if supplier has purchases', async () => {
    vi.mocked(PurchaseModel.count).mockResolvedValue(5 as any);
    vi.mocked(PaymentModel.count).mockResolvedValue(0 as any);

    await expect(handlers['supplier:delete'](mockEvent, 1)).rejects.toThrow(
      'Cannot delete supplier with existing purchases'
    );
    expect(supplierService.deleteSupplier).not.toHaveBeenCalled();
  });

  it('throws if supplier has payments', async () => {
    vi.mocked(PurchaseModel.count).mockResolvedValue(0 as any);
    vi.mocked(PaymentModel.count).mockResolvedValue(1 as any);

    await expect(handlers['supplier:delete'](mockEvent, 1)).rejects.toThrow(
      'Cannot delete supplier with existing payments'
    );
    expect(supplierService.deleteSupplier).not.toHaveBeenCalled();
  });

  it('deletes successfully when no related records exist', async () => {
    vi.mocked(PurchaseModel.count).mockResolvedValue(0 as any);
    vi.mocked(PaymentModel.count).mockResolvedValue(0 as any);
    vi.mocked(supplierService.deleteSupplier).mockResolvedValue(undefined as any);

    await handlers['supplier:delete'](mockEvent, 1);

    expect(supplierService.deleteSupplier).toHaveBeenCalledWith(1);
  });
});
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run app/main/ipc/__tests__/supplier.handlers.test.ts
```

Expected: FAIL.

- [ ] **Step 2.3: Implement the guard in `supplier:delete`**

In `app/main/ipc/supplier.handlers.ts`, replace the `supplier:delete` handler (lines 77–82):

```ts
ipcMain.handle(
  'supplier:delete',
  withAppReady(async (_event, id: number) => {
    const purchaseCount = await Purchase.count({ where: { supplierId: id } });
    if (purchaseCount > 0) {
      throw new Error(
        `Cannot delete supplier with existing purchases (${purchaseCount} found). Remove purchases first.`
      );
    }

    const paymentCount = await Payment.count({ where: { supplierId: id } });
    if (paymentCount > 0) {
      throw new Error(
        `Cannot delete supplier with existing payments (${paymentCount} found). Remove payments first.`
      );
    }

    await deleteSupplier(id);
  })
);
```

`Purchase` and `Payment` are already imported at the top of the file.

- [ ] **Step 2.4: Run test to verify it passes**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run app/main/ipc/__tests__/supplier.handlers.test.ts
```

Expected: PASS.

- [ ] **Step 2.5: Commit**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop
git add app/main/ipc/supplier.handlers.ts app/main/ipc/__tests__/supplier.handlers.test.ts
git commit -m "fix: guard supplier:delete against orphaned purchases and payments"
```

---

## Task 3: Safe-Delete Guard — Product

**Files:**
- Modify: `app/main/ipc/product.handlers.ts:146-151`
- Create: `app/main/ipc/__tests__/product.handlers.test.ts`

- [ ] **Step 3.1: Create the test file** at `app/main/ipc/__tests__/product.handlers.test.ts`:

```ts
const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
    on: vi.fn(),
  },
}));

vi.mock('../../runtime', () => ({
  withAppReady: (fn: Function) => fn,
}));

vi.mock('../../database', () => ({
  default: { transaction: vi.fn((cb: Function) => cb({})) },
}));

vi.mock('../../../models/product', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../models/invoiceItem', () => ({
  default: { count: vi.fn() },
}));

vi.mock('../../../models/purchaseItem', () => ({
  default: { count: vi.fn() },
}));

vi.mock('../../../models/productAuditLog', () => ({
  default: { create: vi.fn(), findAll: vi.fn() },
}));

vi.mock('../../../services/product.service', () => ({
  createProduct: vi.fn(),
  getProductById: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock('../../../services/purchaseItem.service', () => ({
  getPurchaseItems: vi.fn(),
}));

vi.mock('../../../services/invoiceItem.service', () => ({
  getInvoiceItems: vi.fn(),
}));

import InvoiceItemModel from '../../../models/invoiceItem';
import PurchaseItemModel from '../../../models/purchaseItem';
import * as productService from '../../../services/product.service';
import { registerProductHandlers } from '../product.handlers';

const mockEvent = {} as any;

beforeEach(() => {
  vi.clearAllMocks();
  registerProductHandlers();
});

describe('product:delete', () => {
  it('throws if product has invoice items', async () => {
    vi.mocked(InvoiceItemModel.count).mockResolvedValue(4 as any);
    vi.mocked(PurchaseItemModel.count).mockResolvedValue(0 as any);

    await expect(handlers['product:delete'](mockEvent, 1)).rejects.toThrow(
      'Cannot delete product referenced by existing invoices'
    );
    expect(productService.deleteProduct).not.toHaveBeenCalled();
  });

  it('throws if product has purchase items', async () => {
    vi.mocked(InvoiceItemModel.count).mockResolvedValue(0 as any);
    vi.mocked(PurchaseItemModel.count).mockResolvedValue(2 as any);

    await expect(handlers['product:delete'](mockEvent, 1)).rejects.toThrow(
      'Cannot delete product referenced by existing purchases'
    );
    expect(productService.deleteProduct).not.toHaveBeenCalled();
  });

  it('deletes successfully when not referenced', async () => {
    vi.mocked(InvoiceItemModel.count).mockResolvedValue(0 as any);
    vi.mocked(PurchaseItemModel.count).mockResolvedValue(0 as any);
    vi.mocked(productService.deleteProduct).mockResolvedValue(undefined as any);

    await handlers['product:delete'](mockEvent, 1);

    expect(productService.deleteProduct).toHaveBeenCalledWith(1);
  });
});
```

- [ ] **Step 3.2: Run test to verify it fails**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run app/main/ipc/__tests__/product.handlers.test.ts
```

Expected: FAIL.

- [ ] **Step 3.3: Implement the guard in `product:delete`**

In `app/main/ipc/product.handlers.ts`, replace the `product:delete` handler (lines 146–151).

First, add imports for `InvoiceItem` and `PurchaseItem` at the top of the file (they are not currently imported):

```ts
import InvoiceItem from '../../models/invoiceItem';
import PurchaseItem from '../../models/purchaseItem';
```

Then replace the handler:

```ts
ipcMain.handle(
  'product:delete',
  withAppReady(async (_event, id: number) => {
    const invoiceItemCount = await InvoiceItem.count({ where: { productId: id } });
    if (invoiceItemCount > 0) {
      throw new Error(
        `Cannot delete product referenced by existing invoices (${invoiceItemCount} line items). Remove invoices first.`
      );
    }

    const purchaseItemCount = await PurchaseItem.count({ where: { productId: id } });
    if (purchaseItemCount > 0) {
      throw new Error(
        `Cannot delete product referenced by existing purchases (${purchaseItemCount} line items). Remove purchases first.`
      );
    }

    await deleteProduct(id);
  })
);
```

- [ ] **Step 3.4: Run test to verify it passes**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run app/main/ipc/__tests__/product.handlers.test.ts
```

Expected: PASS.

- [ ] **Step 3.5: Commit**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop
git add app/main/ipc/product.handlers.ts app/main/ipc/__tests__/product.handlers.test.ts
git commit -m "fix: guard product:delete against products in existing invoices and purchases"
```

---

## Task 4: Expense Endpoint — Date Limit + Pagination

**Problem:** `expense:filter` has no max date range limit. `expense:getAll` and `expense:search` return unbounded results. The `listing.ts` has no expense query schema.

**Files:**
- Modify: `app/types/pagination.ts`
- Modify: `app/main/ipc/listing.ts`
- Modify: `app/main/ipc/expense.handlers.ts`
- Modify: `app/preload/index.ts`
- Modify: `app/controllers/expense.controller.ts`
- Create: `app/main/ipc/__tests__/expense.handlers.test.ts`

### Step 4.1: Add `ExpenseListQuery` to `app/types/pagination.ts`

Append to the bottom of the file:

```ts
export interface ExpenseListQuery extends SearchPaginationQuery {
  startDate?: string;
  endDate?: string;
}
```

### Step 4.2: Add `expenseListQuerySchema` to `app/main/ipc/listing.ts`

Append to the bottom of the file. Use `searchPaginationSchema` as the base (it is already exported and includes the `search` field):

```ts
export const expenseListQuerySchema = searchPaginationSchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
```

### Step 4.3: Write the failing tests

Create `app/main/ipc/__tests__/expense.handlers.test.ts`:

```ts
const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
    on: vi.fn(),
  },
}));

vi.mock('../../runtime', () => ({
  withAppReady: (fn: Function) => fn,
}));

vi.mock('../../../models/expenseType', () => ({
  default: { findAll: vi.fn(), create: vi.fn() },
}));

vi.mock('../../../services/expense.service', () => ({
  getExpenseById: vi.fn(),
  getExpenses: vi.fn(),
  createExpense: vi.fn(),
  deleteExpense: vi.fn(),
  updateExpense: vi.fn(),
}));

vi.mock('../../../models/expense', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
  },
}));

import ExpenseModel from '../../../models/expense';
import * as expenseService from '../../../services/expense.service';
import { registerExpenseHandlers } from '../expense.handlers';

const mockEvent = {} as any;

beforeEach(() => {
  vi.clearAllMocks();
  registerExpenseHandlers();
});

describe('expense:getAll', () => {
  it('returns paginated results', async () => {
    vi.mocked(ExpenseModel.findAndCountAll).mockResolvedValue({
      rows: [{ id: 1, type: 'Fuel', amount: 500, toJSON: () => ({ id: 1 }) }],
      count: 1,
    } as any);

    const result = await handlers['expense:getAll'](mockEvent, { page: 1, pageSize: 25 });

    expect(result).toMatchObject({ rows: expect.any(Array), total: 1, page: 1, pageSize: 25 });
    expect(ExpenseModel.findAndCountAll).toHaveBeenCalled();
  });
});

describe('expense:filter', () => {
  it('throws when date range exceeds 90 days', async () => {
    await expect(
      handlers['expense:filter'](mockEvent, '2025-01-01', '2025-05-01')
    ).rejects.toThrow('Date range too large');
  });

  it('returns results for a valid date range', async () => {
    vi.mocked(expenseService.getExpenses).mockResolvedValue([
      { id: 1, toJSON: () => ({ id: 1 }) },
    ] as any);

    const result = await handlers['expense:filter'](mockEvent, '2025-01-01', '2025-01-31');
    expect(result).toHaveLength(1);
  });
});

describe('expense:search', () => {
  it('returns paginated search results', async () => {
    vi.mocked(ExpenseModel.findAndCountAll).mockResolvedValue({
      rows: [{ id: 1, toJSON: () => ({ id: 1 }) }],
      count: 1,
    } as any);

    const result = await handlers['expense:search'](mockEvent, { search: 'fuel', page: 1, pageSize: 25 });
    expect(result).toMatchObject({ rows: expect.any(Array), total: 1 });
  });
});
```

- [ ] **Step 4.3:** Create the test file above.

- [ ] **Step 4.4: Run test to verify it fails**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run app/main/ipc/__tests__/expense.handlers.test.ts
```

Expected: FAIL.

- [ ] **Step 4.5: Rewrite `expense.handlers.ts`**

Replace the contents of `app/main/ipc/expense.handlers.ts`:

```ts
import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import Expense from '../../models/expense';
import ExpenseType from '../../models/expenseType';
import {
  getExpenseById,
  getExpenses,
  createExpense,
  deleteExpense,
  updateExpense,
} from '../../services/expense.service';
import {
  expenseListQuerySchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';
import { withAppReady } from '../runtime';

const MAX_DATE_RANGE = 90;

const expenseInputSchema = z.object({
  type: z.string().min(1),
  amount: z.number().min(0),
  date: z.date(),
  note: z.string().optional().nullable(),
});

export function registerExpenseHandlers(): void {
  // Paginated list — replaces the old unbounded getAll
  ipcMain.handle('expense:getAll', withAppReady(async (_event, input: unknown = {}) => {
    const query = expenseListQuerySchema.parse(input);
    const { page, pageSize } = query;
    const { rows, count } = await Expense.findAndCountAll({
      ...toPaginationOptions({ page, pageSize }),
      order: [['date', 'DESC']],
    });
    return toPaginatedResult(
      rows.map((e: any) => (e.toJSON ? e.toJSON() : e)),
      count,
      page,
      pageSize
    );
  }));

  ipcMain.handle('expense:getById', withAppReady(async (_event, id: number) => {
    z.number().parse(id);
    const expense = await getExpenseById(id);
    if (!expense) throw new Error('Expense not found');
    return (expense as any).toJSON ? (expense as any).toJSON() : expense;
  }));

  ipcMain.handle('expense:create', withAppReady(async (_event, values: any) => {
    const parsedValues = z.object({
      type: z.string().min(1),
      amount: z.coerce.number(),
      date: z.string().min(1),
      note: z.string().optional().nullable(),
    }).parse(values);

    const expense = await createExpense({
      ...parsedValues,
      date: new Date(parsedValues.date),
      note: parsedValues.note || undefined,
      postedBy: values.postedBy || null,
    });
    return (expense as any).toJSON ? (expense as any).toJSON() : expense;
  }));

  ipcMain.handle('expense:update', withAppReady(async (_event, id: number, values: any) => {
    z.number().parse(id);
    const parsedValues = expenseInputSchema.parse(values);
    await updateExpense(id, { ...parsedValues, note: parsedValues.note || undefined });
  }));

  ipcMain.handle('expense:delete', withAppReady(async (_event, id: number) => {
    z.object({ id: z.number() }).parse({ id });
    await deleteExpense(id);
  }));

  // Date-filtered list — now enforces 90-day max like invoice:filter
  ipcMain.handle('expense:filter', withAppReady(async (_event, startDate: string, endDate: string) => {
    z.object({ startDate: z.string().min(1), endDate: z.string().min(1) }).parse({ startDate, endDate });

    const dateDifference = dayjs(endDate).diff(dayjs(startDate), 'days');
    if (dateDifference > MAX_DATE_RANGE) {
      throw new Error(
        `Date range too large. Please select a range smaller than ${MAX_DATE_RANGE} days.`
      );
    }

    const expenses = await getExpenses({
      where: {
        date: {
          [Op.between]: [
            `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
          ],
        },
      },
      order: [['date', 'DESC']],
    });
    return expenses.map((e: any) => (e.toJSON ? e.toJSON() : e));
  }));

  // Paginated search — replaces unbounded search
  ipcMain.handle('expense:search', withAppReady(async (_event, input: unknown = {}) => {
    const query = expenseListQuerySchema.parse(input);
    const { page, pageSize, search } = query;

    if (!search) {
      return toPaginatedResult([], 0, page, pageSize);
    }

    const { rows, count } = await Expense.findAndCountAll({
      ...toPaginationOptions({ page, pageSize }),
      where: {
        [Op.or]: [
          { type: { [Op.substring]: search } },
          { note: { [Op.substring]: search } },
        ],
      },
      order: [['date', 'DESC']],
    });

    return toPaginatedResult(
      rows.map((e: any) => (e.toJSON ? e.toJSON() : e)),
      count,
      page,
      pageSize
    );
  }));

  ipcMain.handle('expense:getTypes', withAppReady(async () => {
    const types = await ExpenseType.findAll();
    return (types as any[]).map((t: any) => (t.toJSON ? t.toJSON() : t));
  }));

  ipcMain.handle('expense:createType', withAppReady(async (_event, values: any) => {
    z.object({ type: z.string().min(1) }).parse(values);
    const expenseType = await (ExpenseType as any).create(values);
    return expenseType.toJSON ? expenseType.toJSON() : expenseType;
  }));
}
```

- [ ] **Step 4.6: Update `app/preload/index.ts` — expense API types**

In the `expense` section of `preload/index.ts`, the `getAll`, `filter`, and `search` entries need updated signatures. Find the expense block and update:

```ts
expense: {
  getAll: (query?: import('../types/pagination').ExpenseListQuery) =>
    ipcRenderer.invoke('expense:getAll', query),
  getById: (id: number) => ipcRenderer.invoke('expense:getById', id),
  create: (values: any) => ipcRenderer.invoke('expense:create', values),
  update: (id: number, values: any) => ipcRenderer.invoke('expense:update', id, values),
  delete: (id: number) => ipcRenderer.invoke('expense:delete', id),
  filter: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('expense:filter', startDate, endDate),
  search: (query: import('../types/pagination').ExpenseListQuery) =>
    ipcRenderer.invoke('expense:search', query),
  getTypes: () => ipcRenderer.invoke('expense:getTypes'),
  createType: (values: { type: string }) => ipcRenderer.invoke('expense:createType', values),
},
```

Also add `ExpenseListQuery` to the imports at the top of `preload/index.ts`:

```ts
import type {
  ExpenseListQuery,
  InvoiceListQuery,
  PaginationQuery,
  PaymentListQuery,
  ProductListQuery,
  PurchaseListQuery,
  ReceiptListQuery,
  SearchPaginationQuery,
} from '../types/pagination';
```

- [ ] **Step 4.7: Update `expense.controller.ts` — `searchExpenseFn` signature**

The `expense:search` handler now expects an object `{ search, page?, pageSize? }` instead of a plain string. Update `searchExpenseFn` in `app/controllers/expense.controller.ts`:

```ts
export const searchExpenseFn = async (value: string) => {
  try {
    return await window.api.expense.search({ search: value });
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};
```

- [ ] **Step 4.7b: Update the existing controller test for `searchExpenseFn`**

In `app/controllers/__tests__/expense.controller.test.ts`, line 46, update the assertion:

```ts
// Before:
expect(mockApi.expense.search).toHaveBeenCalledWith('Medicine');

// After:
expect(mockApi.expense.search).toHaveBeenCalledWith({ search: 'Medicine' });
```

Run the controller tests to confirm they still pass:

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run app/controllers/__tests__/expense.controller.test.ts
```

Expected: PASS.

- [ ] **Step 4.8: Run tests to verify passing**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run app/main/ipc/__tests__/expense.handlers.test.ts
```

Expected: PASS (3 test suites).

- [ ] **Step 4.9: Run full test suite**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run
```

Expected: All previously passing tests still pass.

- [ ] **Step 4.10: Commit**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop
git add app/types/pagination.ts app/main/ipc/listing.ts app/main/ipc/expense.handlers.ts \
  app/preload/index.ts app/controllers/expense.controller.ts \
  app/controllers/__tests__/expense.controller.test.ts \
  app/main/ipc/__tests__/expense.handlers.test.ts
git commit -m "fix: add date range limit and pagination to expense endpoints"
```

---

## Task 5: Type Safety — Replace `any` in `CoreModels`

**Goal:** Replace `any` in `runtime.ts` `CoreModels` type with concrete Sequelize model types. This is a targeted, high-value change that propagates type safety into the association setup.

**Files:**
- Modify: `app/main/runtime.ts`

No test needed — this is a compile-time fix. Verify with `tsc`.

- [ ] **Step 5.1: Replace `CoreModels` in `app/main/runtime.ts`**

Replace the `CoreModels` type definition (lines 3–20) with:

```ts
import type { ModelStatic, Model, Sequelize } from 'sequelize';

type AnyModel = ModelStatic<Model>;

type CoreModels = {
  database: Sequelize;
  Customer: AnyModel;
  Invoice: AnyModel;
  Payment: AnyModel;
  Product: AnyModel;
  Purchase: AnyModel;
  Receipt: AnyModel;
  Supplier: AnyModel;
  InvoiceItem: AnyModel;
  PurchaseItem: AnyModel;
  User: AnyModel;
  ProductAuditLog: AnyModel;
  InvoiceAuditLog: AnyModel;
  StoreInfo: AnyModel;
  Expense: AnyModel;
  ExpenseType: AnyModel;
};
```

Also update `registerAssociations` parameter type and the `authReadyPromise` / `appReadyPromise` result types to remove `any`:

```ts
let authReadyPromise: Promise<{ User: AnyModel }> | null = null;
let appReadyPromise: Promise<void> | null = null;
```

- [ ] **Step 5.2: Verify TypeScript compiles**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx tsc --noEmit 2>&1 | head -30
```

Expected: No new errors introduced (some pre-existing errors from `any` in handlers are acceptable at this stage).

- [ ] **Step 5.3: Commit**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop
git add app/main/runtime.ts
git commit -m "refactor: replace any in CoreModels with Sequelize ModelStatic types"
```

---

## Task 6: Full Test Suite Verification

- [ ] **Step 6.1: Run the full test suite**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx vitest run
```

Expected: All tests pass, including the 3 new test files (customer, supplier, product, expense handlers).

- [ ] **Step 6.2: TypeScript check**

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -40
```

Expected: No regression — same or fewer errors than before the changes.

- [ ] **Step 6.3: Final commit (if anything was missed)**

If any stray files remain staged:

```bash
cd /Users/davidoyedeji/workspace/joyvet-desktop && git status
```

Commit remaining changes:

```bash
git add <any-remaining-files>
git commit -m "chore: finalize core fixes"
```

---

## Summary of Changes

| Fix | Handler(s) Changed | Tests Added |
|-----|-------------------|-------------|
| Customer safe-delete | `customer:delete` | `customer.handlers.test.ts` (3 tests) |
| Supplier safe-delete | `supplier:delete` | `supplier.handlers.test.ts` (3 tests) |
| Product safe-delete | `product:delete` | `product.handlers.test.ts` (3 tests) |
| Expense date limit | `expense:filter` | `expense.handlers.test.ts` |
| Expense pagination | `expense:getAll`, `expense:search` | `expense.handlers.test.ts` |
| CoreModels types | `runtime.ts` | TypeScript compile check |
