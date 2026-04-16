import dayjs from 'dayjs';
import type React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import {
  TableEmptyRow,
  TableFrame,
} from '../../../../components/ui/table-helpers';
import { numberWithCommas } from '../../../../utils/helpers';

interface PriceChange {
  field: string;
  before: number;
  after: number;
}

interface AuditEntry {
  id: number;
  createdAt: string;
  changeType: string;
  reason: string;
  postedBy: string;
  delta?: number | null;
  stockBefore?: number | null;
  stockAfter?: number | null;
  priceChanges?: string | null;
  referenceType?: string | null;
  referenceId?: number | null;
}

interface AuditLogProps {
  data: AuditEntry[];
}

const changeTypeLabel: Record<string, string> = {
  stock_change: 'Stock Change',
  price_change: 'Price Change',
  details_change: 'Details Change',
};

const reasonLabel: Record<string, string> = {
  invoice_create: 'Invoice Created',
  invoice_delete: 'Invoice Deleted',
  invoice_add_item: 'Item Added to Invoice',
  invoice_delete_item: 'Item Removed from Invoice',
  invoice_update_item: 'Invoice Item Updated',
  purchase_create: 'Purchase Created',
  purchase_delete: 'Purchase Deleted',
  purchase_update: 'Purchase Updated',
  manual_edit: 'Manual Edit',
};

const AuditLog: React.FC<AuditLogProps> = ({ data }) => {
  const renderDetails = (entry: AuditEntry) => {
    const parts: string[] = [];

    if (entry.delta !== null && entry.delta !== undefined) {
      const sign = entry.delta > 0 ? '+' : '';
      parts.push(`Stock: ${sign}${entry.delta}`);
    }

    if (entry.stockBefore !== null && entry.stockAfter !== null) {
      parts.push(`(${entry.stockBefore} → ${entry.stockAfter})`);
    }

    if (entry.priceChanges) {
      try {
        const changes = JSON.parse(entry.priceChanges) as PriceChange[];
        for (const c of changes) {
          parts.push(
            `${c.field}: ₦${numberWithCommas(c.before)} → ₦${numberWithCommas(c.after)}`
          );
        }
      } catch {
        // ignore parse errors
      }
    }

    return parts.join(' | ') || '—';
  };

  const renderReference = (entry: AuditEntry) => {
    if (!entry.referenceType || entry.referenceType === 'manual') return '—';
    if (entry.referenceId) {
      return `${entry.referenceType} #${entry.referenceId}`;
    }
    return entry.referenceType;
  };

  return (
    <TableFrame>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date / Time</TableHead>
            <TableHead>Change Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Posted By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap">
                  {dayjs(entry.createdAt).format('DD/MM/YYYY HH:mm')}
                </TableCell>
                <TableCell>
                  {changeTypeLabel[entry.changeType] ?? entry.changeType}
                </TableCell>
                <TableCell className="text-sm">
                  {renderDetails(entry)}
                </TableCell>
                <TableCell>
                  {reasonLabel[entry.reason] ?? entry.reason}
                </TableCell>
                <TableCell>{renderReference(entry)}</TableCell>
                <TableCell>{entry.postedBy}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableEmptyRow colSpan={6} message="No audit log entries found." />
          )}
        </TableBody>
      </Table>
    </TableFrame>
  );
};

export default AuditLog;
