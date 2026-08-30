"use client";

import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Loader2 } from "lucide-react";

const LOGIN_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=80";

type AppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: ReactNode;
};

export function AppInput({ label, placeholder, icon, className, ...rest }: AppInputProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="relative w-full min-w-[200px]">
      {label ? <label className="mb-2 block text-sm text-[var(--color-heading)]">{label}</label> : null}
      <div className="relative w-full">
        <input
          className={`peer relative z-10 h-12 w-full rounded-md border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-thin text-[var(--color-heading)] outline-none drop-shadow-sm transition-all duration-200 ease-in-out placeholder:font-medium placeholder:text-[var(--color-text-secondary)] focus:border-[var(--brand)] focus:bg-[var(--color-bg)] ${className ?? ""}`}
          placeholder={placeholder}
          {...rest}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        />
        {isHovering ? (
          <>
            <div
              className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-[2px] overflow-hidden rounded-t-md"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 0px, var(--color-text-primary) 0%, transparent 70%)`,
              }}
            />
            <div
              className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-[2px] overflow-hidden rounded-b-md"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 2px, var(--color-text-primary) 0%, transparent 70%)`,
              }}
            />
          </>
        ) : null}
        {icon ? <div className="absolute top-1/2 right-3 z-20 -translate-y-1/2">{icon}</div> : null}
      </div>
    </div>
  );
}

const SOCIAL = [
  { icon: Instagram, label: "Instagram" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Facebook, label: "Facebook" },
] as const;

export type Login1Props = {
  siteName?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  email?: string;
  password?: string;
  saving?: boolean;
  error?: string | null;
  onEmailChange?: (value: string) => void;
  onPasswordChange?: (value: string) => void;
  onSubmit?: (e: FormEvent) => void;
};

export default function Login1({
  siteName,
  logoUrl,
  primaryColor,
  email,
  password,
  saving = false,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: Login1Props) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [localEmail, setLocalEmail] = useState("");
  const [localPassword, setLocalPassword] = useState("");

  const emailValue = email ?? localEmail;
  const passwordValue = password ?? localPassword;

  function handleSubmit(e: FormEvent) {
    if (onSubmit) {
      onSubmit(e);
      return;
    }
    e.preventDefault();
  }

  return (
    <div
      className="login-1 flex h-screen w-full items-center justify-center bg-[var(--color-bg)] p-4"
      style={
        primaryColor
          ? {
              ["--brand" as string]: primaryColor,
              ["--primary" as string]: primaryColor,
              ["--ring" as string]: primaryColor,
            }
          : undefined
      }
    >
      <div className="card flex h-[min(600px,90vh)] w-[80%] justify-between md:w-[70%] lg:w-[70%]">
        <div
          className="left relative h-full w-full overflow-hidden px-4 lg:w-1/2 lg:px-16"
          onMouseMove={(e) => {
            const leftSection = e.currentTarget.getBoundingClientRect();
            setMousePosition({
              x: e.clientX - leftSection.left,
              y: e.clientY - leftSection.top,
            });
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div
            className={`pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-gradient-to-r from-purple-300/30 via-blue-300/30 to-pink-300/30 blur-3xl transition-opacity duration-200 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
              transition: "transform 0.1s ease-out",
            }}
          />
          <div className="form-container sign-in-container relative z-10 h-full overflow-y-auto">
            <form
              className="grid h-full gap-2 py-10 text-center md:py-16"
              onSubmit={handleSubmit}
            >
              <div className="mb-2 grid gap-4 md:gap-6">
                {logoUrl ? (
                  <div className="flex justify-center">
                    {/* SVG wordmark — next/image gerekmez */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoUrl}
                      alt=""
                      width={160}
                      height={40}
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                ) : null}
                <h1 className="text-3xl font-extrabold text-[var(--color-heading)] md:text-4xl">
                  Giriş yapın
                </h1>
                {siteName ? (
                  <p className="text-sm text-[var(--color-text-secondary)]">{siteName}</p>
                ) : null}
                <div className="social-container">
                  <ul className="flex items-center justify-center gap-3 md:gap-4">
                    {SOCIAL.map((social) => {
                      const Icon = social.icon;
                      return (
                        <li key={social.label} className="list-none">
                          <span
                            aria-hidden
                            className="group relative z-[1] flex h-[2.5rem] w-[2.5rem] items-center justify-center overflow-hidden rounded-full border-3 border-[var(--color-text-primary)] bg-[var(--color-bg-2)] md:h-[3rem] md:w-[3rem]"
                          >
                            <div className="absolute inset-0 h-full w-full origin-bottom scale-y-0 bg-[var(--color-bg)] transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
                            <Icon className="relative z-[2] size-5 text-[hsl(203,92%,8%)] transition-colors duration-500 group-hover:text-[var(--color-text-primary)]" />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  veya hesabınızla devam edin
                </span>
              </div>
              <div className="grid items-center gap-4">
                <AppInput
                  placeholder="E-posta"
                  type="email"
                  autoComplete="email"
                  required
                  value={emailValue}
                  onChange={(e) =>
                    onEmailChange ? onEmailChange(e.target.value) : setLocalEmail(e.target.value)
                  }
                  aria-invalid={error ? true : undefined}
                />
                <AppInput
                  placeholder="Şifre"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={passwordValue}
                  onChange={(e) =>
                    onPasswordChange
                      ? onPasswordChange(e.target.value)
                      : setLocalPassword(e.target.value)
                  }
                  aria-invalid={error ? true : undefined}
                />
              </div>
              {error ? (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex items-center justify-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="group/button relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-md bg-[var(--brand)] px-4 py-1.5 text-xs font-normal text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-[color-mix(in_srgb,var(--brand)_45%,transparent)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="flex items-center gap-2 px-2 py-1 text-sm">
                    {saving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Giriş yapılıyor...
                      </>
                    ) : (
                      "Giriş yap"
                    )}
                  </span>
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                    <div className="relative h-full w-8 bg-white/20" />
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="right hidden h-full w-1/2 overflow-hidden lg:block">
          <Image
            src={LOGIN_IMAGE}
            alt=""
            width={1000}
            height={1000}
            priority
            className="h-full w-full object-cover opacity-30 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
}
