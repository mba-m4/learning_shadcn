import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { Link } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { documentInputSchema } from "@/schema/documents"
import {
  documentCategoryOptions,
  documentStatusOptions,
  type DocumentInput,
} from "@/types/documents"

type DocumentFormProps = {
  title: string
  description: string
  initialValues: DocumentInput
  projectOptions: Array<{
    value: string
    label: string
  }>
  submitLabel: string
  cancelTo: string
  errorMessage?: string | null
  onSubmit: (values: DocumentInput) => Promise<void> | void
}

export function DocumentForm({
  title,
  description,
  initialValues,
  projectOptions,
  submitLabel,
  cancelTo,
  errorMessage,
  onSubmit,
}: DocumentFormProps) {
  const formId = React.useId()
  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onBlur: documentInputSchema,
      onSubmit: documentInputSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id={formId}
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="title"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>タイトル</FieldLabel>
                    <Input
                      autoComplete="off"
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="例: 障害対応チェックリスト"
                      value={field.state.value}
                    />
                    <FieldDescription>
                      一覧や詳細で識別しやすい短いタイトルを入力します。
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )
              }}
            />

            <form.Field
              name="projectId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>プロジェクト</FieldLabel>
                    <select
                      aria-invalid={isInvalid}
                      className="h-11 rounded-md border border-input bg-background px-3 text-sm transition outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value as DocumentInput["projectId"]
                        )
                      }
                      value={field.state.value}
                    >
                      {projectOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FieldDescription>
                      このドキュメントが属する project を選択します。
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )
              }}
            />

            <form.Field
              name="category"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>カテゴリ</FieldLabel>
                    <select
                      aria-invalid={isInvalid}
                      className="h-11 rounded-md border border-input bg-background px-3 text-sm transition outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value as DocumentInput["category"]
                        )
                      }
                      value={field.state.value}
                    >
                      {documentCategoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FieldDescription>
                      runbook、incident など、一覧で見分けやすい分類を選びます。
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )
              }}
            />

            <form.Field
              name="status"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>ステータス</FieldLabel>
                    <select
                      aria-invalid={isInvalid}
                      className="h-11 rounded-md border border-input bg-background px-3 text-sm transition outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value as DocumentInput["status"]
                        )
                      }
                      value={field.state.value}
                    >
                      {documentStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FieldDescription>
                      下書き、レビュー中、公開済みなどの状態を管理します。
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )
              }}
            />

            <form.Field
              name="description"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>説明</FieldLabel>
                    <Textarea
                      aria-invalid={isInvalid}
                      className="min-h-36"
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="このドキュメントで伝えたい内容を書きます"
                      value={field.state.value}
                    />
                    <FieldDescription>
                      本文の要点や利用目的を書いておくと後から再利用しやすくなります。
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )
              }}
            />

            <form.Subscribe
              selector={(state) => ({
                submitError: state.errorMap.onSubmit,
              })}
            >
              {({ submitError }) =>
                errorMessage || submitError ? (
                  <Field data-invalid>
                    <FieldError
                      errors={errorMessage ? [errorMessage] : submitError}
                    />
                  </Field>
                ) : null
              }
            </form.Subscribe>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <Link
          className={cn(
            buttonVariants({ size: "default", variant: "outline" })
          )}
          to={cancelTo}
        >
          キャンセル
        </Link>
        <form.Subscribe
          selector={(state) => ({ isSubmitting: state.isSubmitting })}
        >
          {({ isSubmitting }) => (
            <Button disabled={isSubmitting} form={formId} type="submit">
              {isSubmitting ? "保存中..." : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </CardFooter>
    </Card>
  )
}
