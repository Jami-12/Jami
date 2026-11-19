"use client";

import * as React from "react";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/utils";

/**
 * Shared mutation convention:
 *   1. cancel in-flight fetches for the optimistic keys
 *   2. snapshot those caches
 *   3. apply an optimistic patch immediately
 *   4. on error: restore the snapshot and show a toast
 *   5. on success: show a toast and run caller callbacks (close dialog / navigate)
 *   6. on settle: invalidate every related key (lists, details, counts, stats…)
 *
 * Every field is optional except `mutationFn`, so existing server-first
 * mutations can adopt the helper in small steps: pass only `invalidateKeys`
 * and `successMessage` and the data refresh is handled for you.
 */
export interface OptimisticMutationOptions<TData, TError, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;

  /** Caches that are cancelled + snapshotted before the request. */
  optimisticKeys?: QueryKey[] | ((variables: TVariables) => QueryKey[]);
  /** Transform the current cache value into its optimistic value. */
  applyOptimistic?: (current: unknown, variables: TVariables) => unknown;

  /** Caches refreshed after the request. Defaults to the optimistic keys. */
  invalidateKeys?: QueryKey[] | ((variables: TVariables, data: TData) => QueryKey[]);

  /** Success toast. A function receives the response and the variables. */
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  /** Fallback text used when the error payload has no readable message. */
  errorMessage?: string;
  toastOnSuccess?: boolean;
  toastOnError?: boolean;

  /** Lifecycle hooks run before the built-in toast/invalidation behaviour. */
  onMutate?: (variables: TVariables) => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
  ) => void;
}

interface Snapshot {
  key: QueryKey;
  data: unknown;
  exists: boolean;
}

interface MutationContext {
  snapshots: Snapshot[];
}

export function useOptimisticMutation<TData, TError = Error, TVariables = void>(
  options: OptimisticMutationOptions<TData, TError, TVariables>,
): UseMutationResult<TData, TError, TVariables, MutationContext> {
  const queryClient = useQueryClient();

  const resolveOptimisticKeys = React.useCallback(
    (variables: TVariables): QueryKey[] => {
      const value = options.optimisticKeys;
      if (typeof value === "function") return value(variables);
      return value ?? [];
    },
    [options.optimisticKeys],
  );

  const resolveInvalidateKeys = React.useCallback(
    (variables: TVariables, data: TData | undefined): QueryKey[] => {
      const value = options.invalidateKeys;
      if (typeof value === "function") return value(variables, data as TData);
      return value ?? [];
    },
    [options.invalidateKeys],
  );

  return useMutation<TData, TError, TVariables, MutationContext>({
    mutationFn: options.mutationFn,

    onMutate: async (variables) => {
      options.onMutate?.(variables);

      const keys = resolveOptimisticKeys(variables);
      if (keys.length === 0 || !options.applyOptimistic) {
        return { snapshots: [] };
      }

      await Promise.all(keys.map((key) => queryClient.cancelQueries({ queryKey: key })));

      const snapshots: Snapshot[] = keys.map((key) => {
        const data = queryClient.getQueryData(key);
        return { key, data, exists: data !== undefined };
      });

      const patch = options.applyOptimistic;
      keys.forEach((key) => {
        queryClient.setQueryData(key, (current: unknown) => patch(current, variables));
      });

      return { snapshots };
    },

    onError: (error, variables, context) => {
      context?.snapshots.forEach(({ key, data, exists }) => {
        if (exists) {
          queryClient.setQueryData(key, data);
        } else {
          queryClient.removeQueries({ queryKey: key });
        }
      });

      options.onError?.(error, variables);
      if (options.toastOnError !== false) {
        toast.error(getErrorMessage(error, options.errorMessage));
      }
    },

    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables);
      if (options.toastOnSuccess === false || !options.successMessage) return;

      const message =
        typeof options.successMessage === "function"
          ? options.successMessage(data, variables)
          : options.successMessage;
      if (message) toast.success(message);
    },

    onSettled: (data, error, variables) => {
      options.onSettled?.(data, error, variables);

      const invalidated = resolveInvalidateKeys(variables, data);
      const keys = invalidated.length > 0 ? invalidated : resolveOptimisticKeys(variables);
      keys.forEach((key) => {
        void queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

/** Imperative version for non-hook code (store actions, auth callbacks). */
export function invalidateKeys(
  queryClient: { invalidateQueries: (filters: { queryKey: QueryKey }) => unknown },
  keys: QueryKey | QueryKey[],
): void {
  const list = Array.isArray(keys) && keys.every(Array.isArray) ? (keys as QueryKey[]) : [keys as QueryKey];
  list.forEach((key) => {
    void queryClient.invalidateQueries({ queryKey: key });
  });
}

/**
 * Clamps a 1-based page number to the available page count. Call this after a
 * delete so an emptied last page does not leave the list blank.
 */
export function clampPage(page: number, totalItems: number, pageSize: number): number {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return Math.min(Math.max(1, page), totalPages);
}
