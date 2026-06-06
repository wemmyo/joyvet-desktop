import { useCallback, useState } from 'react';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../types/pagination';

/**
 * Shared pagination state for list views: current page, page size, and a
 * "show all" toggle. Changing the page size or toggling "show all" resets to
 * the first page so the view never lands on an out-of-range page.
 */
export const usePagination = (initialPageSize: number = DEFAULT_PAGE_SIZE) => {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [showAll, setShowAll] = useState(false);

  const onPageSizeChange = useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(DEFAULT_PAGE);
  }, []);

  const onShowAllChange = useCallback((nextShowAll: boolean) => {
    setShowAll(nextShowAll);
    setPage(DEFAULT_PAGE);
  }, []);

  return {
    page,
    setPage,
    pageSize,
    showAll,
    onPageSizeChange,
    onShowAllChange,
  };
};
