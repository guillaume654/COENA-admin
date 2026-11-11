import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { authMode } from "@/lib/auth/config";
import { getServerDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; expired?: string }>;
}) {
  const { t, locale } = await getServerDictionary();
  const { next, expired } = await searchParams;
  const unconfigured = authMode() === "unconfigured";

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <div className="flex justify-end p-4">
        <LocaleSwitcher locale={locale} label={t.app.language} />
      </div>
      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:items-center sm:pt-0">
        <div className="w-full max-w-sm">
          {/* The garnet logo has a white background: blend it in light mode, use the white logo in dark mode. */}
          <Image
            src="/brand/coena-logo.png"
            alt="COENA"
            width={400}
            height={131}
            priority
            className="mx-auto h-12 w-auto mix-blend-multiply dark:hidden"
          />
          <Image
            src="/brand/coena-logo-white.png"
            alt="COENA"
            width={2369}
            height={659}
            priority
            className="mx-auto hidden h-12 w-auto dark:block"
          />
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-muted">{t.app.tagline}</p>

          <div className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <h1 className="font-serif text-3xl font-semibold">{t.auth.title}</h1>
            <p className="mt-1 text-sm text-muted">{t.auth.subtitle}</p>
            <LoginForm
              t={t.auth}
              next={next}
              notice={expired ? t.auth.errors.expired : unconfigured ? t.auth.errors.unconfigured : undefined}
              disabled={unconfigured}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
