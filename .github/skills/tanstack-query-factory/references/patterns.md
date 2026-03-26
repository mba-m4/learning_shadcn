# TanStack Query Factory Notes

## Source of Truth: zod

In this pattern, types should start from zod.

1. Define the schema
2. Infer the TypeScript type from the schema
3. Parse the API response with that schema
4. Use the parsed return type as the query function result type

```ts
const usersResponseSchema = z.object({
  users: z.array(userSchema),
  total: z.number(),
})

type GetUsersResponse = z.infer<typeof usersResponseSchema>

async function getUsers(params?: GetUsersOptions): Promise<GetUsersResponse> {
  const response = await api.get("/users", { params })
  return usersResponseSchema.parse(response.data)
}
```

The main point is that `GetUsersResponse` should not be an arbitrary handwritten type. It should be backed by zod.

## Why `TData` Matters

`TData` is not the raw API response type.

`TData` is the final `data` type that the caller receives from TanStack Query.

Default case:

```tsx
const { data } = useQuery(createUsersQueryOptions())
```

Then `data` is `GetUsersResponse | undefined`.

Transformed case with `select`:

```tsx
const { data } = useQuery(
  createUsersQueryOptions<string[]>({}, {
    select: (response) => response.users.map((user) => user.name),
  })
)
```

Then `data` is `string[] | undefined`.

That is the main reason the generic exists.

## Why `TError` Exists

`TError` allows the caller to specialize the error shape.

In many codebases, `Error` is enough. But the pattern stays reusable because a custom error type can still be plugged in.

```ts
type ApiError = {
  message: string
  status: number
}
```

## Why `XxxQueryOptions` Matters

This is the most important part of the reusable pattern.

It means:

- Allow most query options to be customized
- Do not allow callers to replace the core query identity

The alias is usually built on top of `UseQueryOptions`.

```ts
export type XxxQueryOptions<TData = XxxResponse, TError = Error> = Omit<
  UseQueryOptions<XxxResponse, TError, TData>,
  "queryKey" | "queryFn"
>
```

Allowed examples:

- `enabled`
- `select`
- `staleTime`
- `gcTime`
- `retry`
- `placeholderData`

Not allowed:

- `queryKey`
- `queryFn`

This is what makes the factory copy-pasteable without becoming fragile.

The important point is not to hide TanStack Query types completely. The point is to wrap them in a named alias so the reusable template reads clearly.

## Query Factory Template

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

The point is not the names. The point is the reusable structure.

Using a named alias like `XxxQueryOptions` is often clearer than inlining `Omit<UseQueryOptions<...>>` every time.

That makes the pattern easier to copy because the abstraction is visible in both places:

- the factory name: `createXxxQueryOptions`
- the options type: `XxxQueryOptions`

The underlying base type is still `UseQueryOptions`, but the alias makes the reusable shape easier to read, copy, and explain.

## Mutation Factory Pattern

The same idea applies to mutations.

What gets reused in mutations is slightly different:

- the input type
- the return type
- the common cache update behavior

If the mutation also needs caller-provided options, the same alias pattern can be used.

```ts
export type XxxMutationOptions<TError = Error> = Omit<
  UseMutationOptions<XxxResponse, TError, XxxInput>,
  "mutationFn" | "onSuccess"
>

export default function createXxxMutationOptions<
  TError = Error
>(
  queryClient: QueryClient
) {
  return mutationOptions({
    mutationFn: (payload: XxxInput) => createXxx(payload),
    onSuccess: (createdXxx) => {
      queryClient.invalidateQueries({ queryKey: ["xxx"] })
      queryClient.setQueryData(["xxx", createdXxx.id], createdXxx)
    },
  })
}
```

If mutation-level options need to be merged in, the pattern becomes:

```ts
type CreateXxxMutationConfig<TError = Error> = {
  queryClient: QueryClient
  mutationOptions?: XxxMutationOptions<TError>
  afterSuccess?: (createdXxx: XxxResponse) => void | Promise<void>
}

export default function createXxxMutationOptions<
  TError = Error
>({
  queryClient,
  mutationOptions,
  afterSuccess,
}: CreateXxxMutationConfig<TError>) {
  return mutationOptions({
    ...mutationOptions,
    mutationFn: (payload: XxxInput) => createXxx(payload),
    onSuccess: async (createdXxx) => {
      await afterSuccess?.(createdXxx)
      await queryClient.invalidateQueries({ queryKey: ["xxx"] })
      queryClient.setQueryData(["xxx", createdXxx.id], createdXxx)
    },
  })
}
```

This version avoids re-implementing the full TanStack Query `onSuccess` callback signature in the template while still leaving room for caller-specific success handling.

Here too, the input type should come from zod.

```ts
const xxxInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

type XxxInput = z.infer<typeof xxxInputSchema>
```

So the mutation pattern is still reusable by copy-paste. Only the concrete API pieces change.

## Infinite Query Factory Pattern

Infinite queries are still the same reuse idea.

The only extra moving parts are:

- `pageParam`
- `initialPageParam`
- `getNextPageParam`

The abstraction should stay consistent here too.

```ts
export type XxxInfiniteQueryOptions<
  TData = InfiniteData<XxxPageResponse>,
  TError = Error
> = Omit<
  UseInfiniteQueryOptions<XxxPageResponse, TError, TData>,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
>

export default function createXxxInfiniteQueryOptions<
  TData = InfiniteData<XxxPageResponse>,
  TError = Error
>(
  infiniteQueryOptionsOverride?: XxxInfiniteQueryOptions<TData, TError>
) {
  return infiniteQueryOptions({
    ...infiniteQueryOptionsOverride,
    queryKey: ["xxx", "infinite"],
    queryFn: ({ pageParam }) => fetchXxxPage({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined
    },
  })
}
```

The reusable idea does not change.

Build one stable shape, then reuse it for other paginated APIs.

If `select` is needed for infinite queries too, `TData` plays the same role as in regular queries: it describes the final `data` shape the caller receives.

## What to Remember

If only a few things need to be remembered, remember these:

1. zod defines the trusted input and output types
2. `TData` is the final `data` shape after `select`
3. `TError` is the error shape
4. named option aliases like `XxxQueryOptions`, `XxxMutationOptions`, and `XxxInfiniteQueryOptions` are the extension points
5. `queryKey` and `queryFn` stay fixed in the factory
6. The same reusable pattern applies to query, mutation, and infinite query