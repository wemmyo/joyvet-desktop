import InvoiceAuditLog from '../models/invoiceAuditLog';

export const createInvoiceAuditLog = async ({
  invoiceId,
  action,
  details,
  performedBy,
  transaction,
}: {
  invoiceId?: number | null;
  action:
    | 'created'
    | 'deleted'
    | 'item_added'
    | 'item_deleted'
    | 'item_updated';
  details?: Record<string, unknown> | null;
  performedBy: string;
  transaction?: any;
}) => {
  return InvoiceAuditLog.create(
    {
      invoiceId: invoiceId ?? null,
      action,
      details: details ? JSON.stringify(details) : null,
      performedBy,
    },
    transaction ? { transaction } : {}
  );
};

export const getInvoiceAuditLogs = async (invoiceId?: number) => {
  const where: Record<string, unknown> = {};
  if (invoiceId !== undefined) {
    where.invoiceId = invoiceId;
  }
  const logs = await InvoiceAuditLog.findAll({
    where: Object.keys(where).length > 0 ? where : undefined,
    order: [['createdAt', 'DESC']],
    limit: 500,
  });
  return (logs as any[]).map((log: any) => (log.toJSON ? log.toJSON() : log));
};
