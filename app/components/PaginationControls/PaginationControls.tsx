import type React from 'react';
import { PAGE_SIZE_OPTIONS } from '../../types/pagination';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const ALL_VALUE = 'all';

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (nextPage: number) => void;
  /** When provided, renders a results-per-page selector (including "All"). */
  onPageSizeChange?: (nextPageSize: number) => void;
  showAll?: boolean;
  onShowAllChange?: (showAll: boolean) => void;
  pageSizeOptions?: readonly number[];
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  showAll = false,
  onShowAllChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;
  const pageStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = total === 0 ? 0 : Math.min(page * pageSize, total);

  const showSizeSelector = Boolean(onPageSizeChange);

  const handleSizeChange = (value: string) => {
    if (value === ALL_VALUE) {
      onShowAllChange?.(true);
      return;
    }
    onShowAllChange?.(false);
    onPageSizeChange?.(Number(value));
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-3">
        {showSizeSelector ? (
          <div className="flex items-center gap-2">
            <span>Per page</span>
            <Select
              value={showAll ? ALL_VALUE : String(pageSize)}
              onValueChange={handleSizeChange}
            >
              <SelectTrigger className="h-8 w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value={ALL_VALUE}>All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <span>
          {showAll
            ? `${total} of ${total}`
            : `${pageStart}-${pageEnd} of ${total}`}
        </span>
      </div>
      {showAll ? null : (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoBack}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoForward}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaginationControls;
