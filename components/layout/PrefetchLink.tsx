// components/layout/PrefetchLink.tsx
"use client";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function PrefetchLink(props: LinkProps & { children: React.ReactNode; className?: string }) {
  const { href, children, className, ...rest } = props;
  const router = useRouter();

  const onEnter = useCallback(() => {
    try {
      router.prefetch(typeof href === "string" ? href : href.toString());
    } catch {}
  }, [href, router]);

  return (
    <Link href={href} className={className} onMouseEnter={onEnter} {...rest}>
      {children}
    </Link>
  );
}
