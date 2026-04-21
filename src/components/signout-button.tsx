"use client";

import { signOut } from "next-auth/react";
import { Button, type ButtonProps } from "@/components/ui/button";

export function SignOutButton(props: ButtonProps) {
  return (
    <Button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        void signOut({ callbackUrl: "/" });
      }}
    />
  );
}
