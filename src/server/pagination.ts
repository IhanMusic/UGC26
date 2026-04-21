export function getPagination(searchParams: Record<string, string | string[] | undefined>) {
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const size = Math.min(50, Math.max(5, Number(searchParams.size ?? 10) || 10));
  const skip = (page - 1) * size;
  return { page, size, skip };
}

export function pageCount(total: number, size: number) {
  return Math.max(1, Math.ceil(total / size));
}
