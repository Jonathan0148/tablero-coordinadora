"use client";

import Image from "next/image";
import { useBrandAssets } from "@/shared/hooks/use-brand-assets";

export function LoginBrand() {
  const { full } = useBrandAssets();

  return (
    <Image
      src={full}
      alt="Coltefinanciera"
      width={180}
      height={48}
      className="h-10 w-auto max-w-[180px] object-contain"
      priority
    />
  );
}
