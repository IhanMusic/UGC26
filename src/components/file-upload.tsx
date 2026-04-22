"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { cn } from "@/components/ui/utils";

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  accept = "image/*",
  label,
  className,
}: FileUploadProps) {
  const t = useTranslations("fileUpload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayLabel = label ?? t("label");

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? t("error"));
      onChange(data.url!);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 transition-colors hover:border-violet-500/40 hover:bg-violet-500/5"
      >
        {value ? (
          <div className="relative h-24 w-full overflow-hidden rounded-lg">
            <Image src={value} alt="preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
          </div>
        ) : (
          <>
            <svg
              className="h-8 w-8 text-[#64748B]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <span className="text-sm text-[#64748B]">
              {uploading ? t("uploading") : displayLabel}
            </span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      {error && <p className="text-xs text-[#F43F5E]">{error}</p>}
    </div>
  );
}
