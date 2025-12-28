"use client"

import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div>

      <Card className="relative w-full max-w-2xl border-border/60 bg-card/95 shadow-xl backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Image src="/logo.svg" alt="Logo" width={44} height={44} priority />
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                Global error
              </Badge>
              <CardTitle className="text-3xl sm:text-4xl">
                We hit a snag
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Something went wrong on our side. Try again or head back to
                safety.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-muted/70 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">What you can do</p>
            <div className="mt-2 space-y-1">
              <p>Refresh the page to retry the request.</p>
              <p>Return home and pick a different path.</p>
              <p>If this keeps happening, share the error code below.</p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => reset()} className="min-w-35">
              Try again
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/">Go home</Link>
            </Button>
          </div>

          {error?.digest ? (
            <p className="text-xs text-muted-foreground">
              Error code: {error.digest}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
