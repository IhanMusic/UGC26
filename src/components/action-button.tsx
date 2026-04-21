"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useConfirm } from "@/components/confirm-modal";

export function ActionButton({
  url,
  method = "POST",
  confirm: confirmMessage,
  onDone,
  body,
  ...props
}: ButtonProps & {
  url: string;
  method?: "POST" | "PATCH" | "DELETE";
  confirm?: string;
  body?: unknown;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const confirmDialog = useConfirm();

  return (
    <Button
      {...props}
      disabled={loading || props.disabled}
      onClick={async (e) => {
        props.onClick?.(e);
        if (confirmMessage) {
          const ok = await confirmDialog({
            title: "Confirmation",
            message: confirmMessage,
            variant: "destructive",
          });
          if (!ok) return;
        }
        setLoading(true);
        await fetch(url, {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        }).catch(() => null);
        setLoading(false);
        onDone?.();
        window.location.reload();
      }}
    />
  );
}
