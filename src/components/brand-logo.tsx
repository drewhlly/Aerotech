"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { routeRole, workspaceHomes } from "@/lib/portal-policy";
export default function BrandLogo({
  light = false,
  compact = false,
  href,
}: {
  light?: boolean;
  compact?: boolean;
  href?: string;
}) {
  const role = routeRole(usePathname()),
    target = href || (role ? workspaceHomes[role] : "/");
  return (
    <Link
      href={target}
      aria-label="Aerotech home"
      className="inline-flex min-h-11 shrink-0 items-center"
    >
      <Image
        src={
          light ? "/brand/aerotech-logo-white.svg" : "/brand/aerotech-logo.svg"
        }
        alt="Aerotech"
        width={204}
        height={44}
        priority
        unoptimized
        style={{
          width: compact ? 112 : 180,
          height: compact ? 30 : 40,
          objectFit: "contain",
        }}
      />
    </Link>
  );
}
