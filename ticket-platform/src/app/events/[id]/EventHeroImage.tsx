"use client";

import Image from "next/image";
import { useState } from "react";

export function EventHeroImage({ src, alt }: { src: string; alt: string }) {
  const [isPortrait, setIsPortrait] = useState(false);

  return (
    <div
      className={`relative mb-8 w-full overflow-hidden rounded-xl bg-gray-200 ${
        isPortrait ? "mx-auto aspect-[2/3] max-w-sm" : "aspect-[21/9]"
      }`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        unoptimized
        sizes={isPortrait ? "(max-width: 384px) 100vw, 384px" : "(max-width: 896px) 100vw, 896px"}
        className="object-cover"
        onLoad={(e) => {
          const img = e.currentTarget;
          setIsPortrait(img.naturalHeight > img.naturalWidth);
        }}
      />
    </div>
  );
}
