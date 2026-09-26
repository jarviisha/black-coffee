import { brand } from "@/config/brand"

/**
 * Sets document.title for a page. React 19 hoists a rendered <title> into
 * <head>, so no effect or helmet library is involved.
 */
export function PageTitle({ title }: { title?: string }) {
  return <title>{title ? `${title} · ${brand.name}` : brand.name}</title>
}
