import dayjs from 'dayjs';
import { ChevronDown, ChevronRight, FileText, Receipt } from 'lucide-react';
import React, { useState } from 'react';
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

interface ActivityTimelineProps {
  data: any[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ data }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (data.length === 0) {
    return (
      <TableFrame>
        <Table>
          <TableBody>
            <TableEmptyRow
              colSpan={6}
              message="No activity found for this period."
            />
          </TableBody>
        </Table>
      </TableFrame>
    );
  }

  return (
    <TableFrame>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Date / Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Balance After</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry: any) => {
            const key = `${entry._type}-${entry.id}`;
            const isExpanded = expandedIds.has(key);
            const isInvoice = entry._type === 'invoice';

            return (
              <React.Fragment key={key}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleExpand(key)}
                >
                  <TableCell>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {dayjs(entry.createdAt).format('DD/MM/YYYY HH:mm')}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      {isInvoice ? (
                        <FileText className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Receipt className="h-4 w-4 text-green-500" />
                      )}
                      {isInvoice ? `Invoice (${entry.saleType})` : 'Receipt'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {isInvoice
                      ? `Invoice #${entry.id}`
                      : entry.paymentMethod || entry.paymentType || '—'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {isInvoice ? (
                      <span className="text-red-600">
                        +₦{numberWithCommas(entry.amount)}
                      </span>
                    ) : (
                      <span className="text-green-600">
                        -₦{numberWithCommas(entry.amount)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₦{numberWithCommas(entry.balanceAfter)}
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0 bg-muted/20">
                      <div className="p-4">
                        {isInvoice && entry.products?.length > 0 ? (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-muted-foreground border-b">
                                <th className="text-left py-1 pr-4">Product</th>
                                <th className="text-right py-1 pr-4">Qty</th>
                                <th className="text-right py-1 pr-4">
                                  Unit Price
                                </th>
                                <th className="text-right py-1">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.products.map((product: any) => (
                                <tr
                                  key={product.id}
                                  className="border-b border-muted"
                                >
                                  <td className="py-1 pr-4">{product.title}</td>
                                  <td className="text-right py-1 pr-4">
                                    {product.invoiceItem?.quantity}
                                  </td>
                                  <td className="text-right py-1 pr-4">
                                    ₦
                                    {numberWithCommas(
                                      product.invoiceItem?.unitPrice
                                    )}
                                  </td>
                                  <td className="text-right py-1">
                                    ₦
                                    {numberWithCommas(
                                      product.invoiceItem?.amount
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : !isInvoice ? (
                          <p className="text-sm text-muted-foreground">
                            {entry.note
                              ? `Note: ${entry.note}`
                              : 'No additional details'}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No items found
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableFrame>
  );
};

export default ActivityTimeline;
