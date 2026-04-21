"use client";

import Image from "next/image";
import { useState } from "react";

export function ProofImage({
  src,
  alt,
  className = "h-56 w-full rounded-xl object-cover",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);

  // For data URLs or relative paths, fall back to native img
  if (src.startsWith("data:") || error) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-xl"
        sizes="(max-width: 768px) 100vw, 50vw"
        onError={() => setError(true)}
      />
    </div>
  );
}
