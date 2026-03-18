import * as React from 'react';
import { Check, ChevronDown, LoaderCircle, Search } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface AsyncComboboxOption {
  value: string;
  label: string;
}

interface AsyncComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  disabled?: boolean;
  selectedLabel?: string;
  options: AsyncComboboxOption[];
  loading: boolean;
  emptyMessage: string;
  onSearchChange: (search: string) => void;
}

const AsyncCombobox: React.FC<AsyncComboboxProps> = ({
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  disabled = false,
  selectedLabel,
  options,
  loading,
  emptyMessage,
  onSearchChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const onSearchChangeRef = React.useRef(onSearchChange);

  React.useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  React.useEffect(() => {
    if (!open) {
      setSearchValue('');
      return;
    }

    onSearchChangeRef.current('');
  }, [open]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setSearchValue(nextValue);
    onSearchChangeRef.current(nextValue);
  };

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setOpen(false);
  };

  const triggerLabel = value ? selectedLabel || placeholder : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={triggerLabel}
          disabled={disabled}
          className={cn(
            'w-full justify-between px-3 font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <div className="border-b p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : options.length > 0 ? (
            <div className="space-y-1" role="listbox">
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground',
                      isSelected && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className="truncate">{option.label}</span>
                    <Check
                      className={cn(
                        'ml-2 h-4 w-4 shrink-0',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AsyncCombobox;
