import * as React from "react"

import { cn } from "@/lib/utils"

type FieldOrientation = "vertical" | "horizontal" | "responsive"

function normalizeErrors(errors: unknown): string[] {
  if (!errors) {
    return []
  }

  if (Array.isArray(errors)) {
    return errors.flatMap((error) => normalizeErrors(error))
  }

  if (typeof errors === "string") {
    return [errors]
  }

  if (typeof errors === "object") {
    if ("message" in errors && typeof errors.message === "string") {
      return [errors.message]
    }

    return Object.values(errors).flatMap((error) => normalizeErrors(error))
  }

  return [String(errors)]
}

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-group"
    className={cn("flex flex-col gap-6", className)}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    data-slot="field-set"
    className={cn("grid gap-3", className)}
    {...props}
  />
))
FieldSet.displayName = "FieldSet"

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: FieldOrientation }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field"
    data-orientation={orientation}
    className={cn(
      "grid gap-2",
      orientation === "horizontal" && "grid-cols-[auto_1fr] items-start gap-3",
      orientation === "responsive" &&
        "gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start",
      "data-[invalid=true]:text-destructive",
      className
    )}
    {...props}
  />
))
Field.displayName = "Field"

const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-content"
    className={cn("grid gap-1", className)}
    {...props}
  />
))
FieldContent.displayName = "FieldContent"

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    data-slot="field-label"
    className={cn("text-sm leading-none font-medium", className)}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement> & { variant?: "default" | "label" }
>(({ className, variant = "default", ...props }, ref) => (
  <legend
    ref={ref}
    data-slot="field-legend"
    className={cn(
      variant === "label"
        ? "text-sm leading-none font-medium"
        : "font-semibold",
      className
    )}
    {...props}
  />
))
FieldLegend.displayName = "FieldLegend"

const FieldTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-title"
    className={cn("text-sm leading-none font-medium", className)}
    {...props}
  />
))
FieldTitle.displayName = "FieldTitle"

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

function FieldError({
  className,
  errors,
}: React.HTMLAttributes<HTMLUListElement> & { errors: unknown }) {
  const messages = Array.from(new Set(normalizeErrors(errors).filter(Boolean)))

  if (messages.length === 0) {
    return null
  }

  return (
    <ul
      data-slot="field-error"
      className={cn("grid gap-1 text-sm text-destructive", className)}
    >
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  )
}

const FieldSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    data-slot="field-separator"
    className={cn("border-border", className)}
    {...props}
  />
))
FieldSeparator.displayName = "FieldSeparator"

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}
