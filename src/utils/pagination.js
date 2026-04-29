export const PAGE_ELLIPSIS = '…';

export function buildPageItems(current, total) {
  const items = [];
  let last = -1;
  for (let i = 0; i < total; i++) {
    if (i === 0 || i === total - 1 || Math.abs(i - current) <= 2) {
      if (last !== -1 && i - last > 1) items.push(PAGE_ELLIPSIS);
      items.push(i);
      last = i;
    }
  }
  return items;
}
