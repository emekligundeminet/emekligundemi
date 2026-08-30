"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import Login1 from "@/components/ui/login-1";

type Props = {
  nextPath: string;
  siteName: string;
  logoUrl: string | null;
  primaryColor: string;
  tagline: string;
};

export function AdminLoginForm({
  nextPath,
  siteName,
  logoUrl,
  primaryColor,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signError) {
        setError("E-posta veya şifre hatalı.");
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Giriş yapılamadı.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Login1
      siteName={siteName}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      email={email}
      password={password}
      saving={saving}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={onSubmit}
    />
  );
}
