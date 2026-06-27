export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function handleError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
