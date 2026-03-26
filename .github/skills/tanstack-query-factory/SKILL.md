---
name: tanstack-query-factory
description: 'Understand and apply reusable TanStack Query factories with zod-based types. Use when creating or reviewing queryOptions, mutationOptions, infiniteQueryOptions, TData/TError generics, select usage, or copy-pasteable query patterns.'
argument-hint: 'Describe the API shape or TanStack Query pattern you want to build or understand.'
user-invocable: true
---

# TanStack Query Factory

Use this skill when the goal is to understand or build reusable TanStack Query definitions that can be copied to other APIs with minimal changes.

## When to Use

- You want to understand why a `createXxxQueryOptions` factory is useful
- You are designing a reusable `queryOptions` pattern
- You need to understand `TData`, `TError`, and a reusable `XxxQueryOptions` alias
- You want the same reuse pattern for `mutationOptions`
- You want the same reuse pattern for `infiniteQueryOptions`
- You are using zod as the source of truth for API input or output types

## Core Idea

The important pattern is not just TanStack Query itself.

The important pattern is:

1. Define API input and output with zod
2. Parse API responses with zod in the request function
3. Wrap TanStack Query configuration in a reusable factory
4. Keep `queryKey` and `queryFn` fixed inside the factory
5. Accept a named options alias as overridable input
6. Reuse the same shape by copying it to new APIs

## Query Pattern

```ts
export type XxxQueryOptions<TData = XxxResponse, TError = Error> = Omit<
  UseQueryOptions<XxxResponse, TError, TData>,
  "queryKey" | "queryFn"
>

export default function createXxxQueryOptions<
  TData = XxxResponse,
  TError = Error
>(
  params?: XxxParams,
  queryOptions?: XxxQueryOptions<TData, TError>
) {
  return queryOptions({
    ...queryOptions,
    queryKey: ["xxx", params],
    queryFn: () => fetchXxx(params),
  })
}
```

## What Matters

- `XxxResponse` is the raw result returned by the query function
- `TData` is the final `data` shape the component receives
- `TError` is the error type
- `XxxQueryOptions` is the reusable extension point for `select`, `enabled`, `staleTime`, `retry`, and similar settings
- the underlying `UseQueryOptions` base is wrapped so the reusable template stays readable

## Procedure

1. Start from zod schemas for request and response
2. Build an API function that returns parsed data
3. Create a query factory with `TData`, `TError`, and a named options alias like `XxxQueryOptions`
4. Use `select` when the consumer needs a transformed result
5. Create a mutation factory when post-success cache updates should be reused
6. Create an infinite query factory when pagination is driven by `pageParam`

## References

- [Detailed pattern notes](./references/patterns.md)