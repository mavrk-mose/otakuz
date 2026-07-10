"use client";

import Link from 'next/link';
import { useI18n } from '@/components/i18n-provider';

export default function NotFound() {
    const { t } = useI18n();
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">{t("watch.notFound")}</p>
            <p className="mb-8 text-muted-foreground">{t("watch.notFoundDescription")}</p>
            <Link
                href="/"
                className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
            >
                {t("watch.backHome")}
            </Link>
        </div>
    );
}
