"use client";

import { BRAND_MARK_SRC, BRAND_NAME } from "@/shared/branding/brand-assets";

export function useBrandAssets() {
  return {
    mark: BRAND_MARK_SRC,
    name: BRAND_NAME,
  };
}
