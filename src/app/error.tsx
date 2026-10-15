"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        An unexpected error occurred. Please try again, and if the problem
        persists, contact us.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Go to homepage
        </ButtonLink>
      </div>
    </main>
  );
}
