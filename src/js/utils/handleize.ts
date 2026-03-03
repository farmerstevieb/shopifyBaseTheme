export function handleize(value: string): string {
  return value.replaceAll(" ", "-").toLowerCase();
}
