import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { getUserSession } from '../../../utils/session';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  TableEmptyRow,
  TableFrame,
} from '../../../components/ui/table-helpers';

interface InvoiceAuditLogProps {
  invoiceId: number;
}

const InvoiceAuditLog: React.FC<InvoiceAuditLogProps> = ({ invoiceId }) => {
  const session = getUserSession();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (session?.role !== 'admin') return;
    window.api.invoice
      .getAuditLog(invoiceId)
      .then((result: any[]) => {
        setLogs(result || []);
      })
      .catch(() => {});
  }, [invoiceId]);

  if (session?.role !== 'admin') {
    return null;
  }

  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold mb-2">Audit Log</h2>
      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {log.details
                      ? (() => {
                          try {
                            const parsed = JSON.parse(log.details);
                            return Object.entries(parsed)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ');
                          } catch {
                            return log.details;
                          }
                        })()
                      : '—'}
                  </TableCell>
                  <TableCell>{log.performedBy}</TableCell>
                  <TableCell>
                    {log.createdAt
                      ? dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')
                      : '—'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyRow colSpan={4} message="No audit log entries." />
            )}
          </TableBody>
        </Table>
      </TableFrame>
    </section>
  );
};

export default InvoiceAuditLog;
