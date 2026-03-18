interface ImportMeta {
  hot?: {
    accept: (callback?: () => void) => void;
  };
}

declare module 'react-to-print' {
  export interface UseReactToPrintOptions {
    content?: () => Element | Text | null;
  }

  export function useReactToPrint(
    options?: UseReactToPrintOptions
  ): (() => void) | undefined;
}
