import { startTransition, useCallback, useMemo, useRef, useState } from 'react';

import type { AsyncComboboxOption } from '@/components/ui/async-combobox';

interface AsyncComboboxResult<T> {
  rows?: T[];
}

interface UseAsyncComboboxOptionsParams<T> {
  getInitialOptions: () => Promise<AsyncComboboxResult<T>>;
  searchOptions: (search: string) => Promise<AsyncComboboxResult<T>>;
  getOptionValue: (item: T) => string;
  getOptionLabel: (item: T) => string;
}

interface UseAsyncComboboxOptionsReturn<T> {
  options: AsyncComboboxOption[];
  loading: boolean;
  onSearchChange: (search: string) => void;
  getItemByValue: (value: string) => T | null;
  getLabelByValue: (value: string) => string;
  primeItems: (items: T[]) => void;
}

export function useAsyncComboboxOptions<T>({
  getInitialOptions,
  searchOptions,
  getOptionValue,
  getOptionLabel,
}: UseAsyncComboboxOptionsParams<T>): UseAsyncComboboxOptionsReturn<T> {
  const [options, setOptions] = useState<AsyncComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);
  const itemCacheRef = useRef(new Map<string, T>());
  const requestSequenceRef = useRef(0);

  const mergeItems = useCallback(
    (items: T[]) => {
      items.forEach((item) => {
        itemCacheRef.current.set(getOptionValue(item), item);
      });
    },
    [getOptionValue]
  );

  const mapOptions = useCallback(
    (items: T[]) =>
      items.map((item) => ({
        value: getOptionValue(item),
        label: getOptionLabel(item),
      })),
    [getOptionLabel, getOptionValue]
  );

  const runQuery = useCallback(
    async (search: string) => {
      const requestId = requestSequenceRef.current + 1;
      requestSequenceRef.current = requestId;
      setLoading(true);

      try {
        const response = search.trim()
          ? await searchOptions(search.trim())
          : await getInitialOptions();

        if (requestId !== requestSequenceRef.current) {
          return;
        }

        const rows = response.rows ?? [];
        mergeItems(rows);
        startTransition(() => {
          setOptions(mapOptions(rows));
        });
      } finally {
        if (requestId === requestSequenceRef.current) {
          setLoading(false);
        }
      }
    },
    [getInitialOptions, mapOptions, mergeItems, searchOptions]
  );

  const getItemByValue = useCallback((value: string) => {
    return itemCacheRef.current.get(value) ?? null;
  }, []);

  const getLabelByValue = useCallback(
    (value: string) =>
      itemCacheRef.current.get(value)
        ? getOptionLabel(itemCacheRef.current.get(value) as T)
        : '',
    [getOptionLabel]
  );

  const primeItems = useCallback(
    (items: T[]) => {
      mergeItems(items);
    },
    [mergeItems]
  );

  return useMemo(
    () => ({
      options,
      loading,
      onSearchChange: runQuery,
      getItemByValue,
      getLabelByValue,
      primeItems,
    }),
    [getItemByValue, getLabelByValue, loading, options, primeItems, runQuery]
  );
}
