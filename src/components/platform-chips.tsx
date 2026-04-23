"use client";

export const SOCIAL_PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Facebook",
  "Snapchat",
  "Twitter",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

interface PlatformChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function PlatformChips({ value, onChange, disabled }: PlatformChipsProps) {
  const toggle = (platform: string) => {
    if (disabled) return;
    if (value.includes(platform)) {
      onChange(value.filter((p) => p !== platform));
    } else {
      onChange([...value, platform]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {SOCIAL_PLATFORMS.map((platform) => {
        const selected = value.includes(platform);
        return (
          <button
            key={platform}
            type="button"
            onClick={() => toggle(platform)}
            disabled={disabled}
            className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors
              ${selected
                ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--primary)]"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {platform}
          </button>
        );
      })}
    </div>
  );
}
