import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { TableCell, TableRow } from './table';

interface TableFrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const TableFrame = ({ children, className, ...props }: TableFrameProps) => {
  return (
    <div
      className={cn('overflow-hidden rounded-md border', className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface TableEmptyRowProps {
  colSpan: number;
  message?: string;
}

const TableEmptyRow = ({
  colSpan,
  message = 'No results found.',
}: TableEmptyRowProps) => {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="h-24 text-center text-muted-foreground"
      >
        {message}
      </TableCell>
    </TableRow>
  );
};

export { TableFrame, TableEmptyRow };
