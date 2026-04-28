"use client";

/**
 * MobileMenu — Aesop-tier left-side drawer for primary nav on small screens.
 *
 * Why this exists:
 *   The main `<nav>` in SiteHeader uses `hidden md:block`, so on screens
 *   under 768px the 5 primary links (Shop / Current drop / Guides / Our
 *   story / Shipping) and any CMS-supplied nav items are completely
 *   inaccessible. Mobile users could only reach search / sign-in / cart /
 *   theme / locale via the icon row — there was no way to browse the
 *   storefront. Audit-blocker for launch.
 *
 * Design:
 *   • Hamburger button (3 hairlines) sits LEFT of the wordmark, only
 *     visible on `md:hidden`. Aesop-style: pure typography icon, no
 *     background pill, no animated morph to X (those scream early SaaS).
 *   • Drawer slides in from the left, 85vw width, paper background.
 *   • Each nav item is large (28px) low-weight type with a hairline
 *     divider between. Mega menu's secondary links are exposed as
 *     indented sub-items so visitors don't lose category discovery.
 *   • Footer of the drawer carries quick links to Account, Wishlist,
 *     and Cart for symmetry with the desktop icon row.
 *
 * Why vaul:
 *   Already in the project for the right-side cart drawer. Reusing keeps
 *   the gesture/animation grammar consistent across the storefront.
 */

import { useState } from "react";
import Link from "next/link";
import { Drawer } from "vaul";
import { useTranslations } from "next-intl";
import type { MegaMenuItem } from "./MegaMenu";

export default function MobileMenu({ items }: { items: MegaMenuItem[] }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  function handleNavigate() {
    // Close the drawer after a link click — the route change is async,
    // but we close immediately so the user sees the page transition
    // and not the drawer animating away over the destination.
    setOpen(false);
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="left">
      <Drawer.Trigger
        aria-label={t("open_menu")}
        aria-expanded={open}
        className="md:hidden p-1.5 hover:text-sericia-ink transition-colors"
      >
        {/* Three-hairline icon — pure svg, no fill, matches header icon weight */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="square"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="19" y2="6" />
          <line x1="3" y1="11" x2="19" y2="11" />
          <line x1="3" y1="16" x2="19" y2="16" />
        </svg>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[90] bg-sericia-ink/30 backdrop-blur-[2px]" />
        <Drawer.Content
          className="fixed left-0 top-0 bottom-0 z-[100] flex flex-col bg-sericia-paper border-r border-sericia-line outline-none w-[85vw] max-w-[420px]"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">{t("primary_navigation")}</Drawer.Title>

          {/* Header strip with close button */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-sericia-line">
            <p className="text-[10px] tracking-[0.3em] uppercase text-sericia-ink-mute">
              {t("menu_eyebrow")}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close_menu")}
              className="p-1.5 -mr-1.5 hover:text-sericia-ink-soft transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                aria-hidden="true"
              >
                <line x1="3" y1="3" x2="15" y2="15" />
                <line x1="15" y1="3" x2="3" y2="15" />
              </svg>
            </button>
          </div>

          {/* Primary nav list */}
          <nav className="flex-1 overflow-y-auto px-6 py-4">
            <ul className="divide-y divide-sericia-line">
              {items.map((item, i) => (
                <li key={`${item.label}-${i}`}>
                  <Link
                    href={item.url}
                    onClick={handleNavigate}
                    className="block py-5 text-[24px] leading-tight font-light text-sericia-ink hover:text-sericia-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                  {/* Surface a couple of mega-menu sub-links so mobile
                      visitors don't lose category discovery. We only
                      render the first column's first 4 entries to keep
                      the drawer scannable; the parent link still routes
                      to the full collection / index page. */}
                  {item.mega?.enabled && item.mega.columns?.[0]?.links?.length ? (
                    <ul className="-mt-3 mb-5 ml-1 space-y-2">
                      {item.mega.columns[0].links.slice(0, 4).map((sub, j) => (
                        <li key={`${sub.label}-${j}`}>
                          <Link
                            href={sub.url}
                            onClick={handleNavigate}
                            className="text-[14px] text-sericia-ink-mute hover:text-sericia-ink-soft transition-colors"
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick-link footer — mirrors the desktop icon row */}
          <div className="border-t border-sericia-line px-6 py-5 grid grid-cols-3 gap-3 text-[12px] tracking-wider uppercase text-sericia-ink-soft">
            <Link href="/account" onClick={handleNavigate} className="hover:text-sericia-ink transition-colors">
              {t("account")}
            </Link>
            <Link href="/account/wishlist" onClick={handleNavigate} className="hover:text-sericia-ink transition-colors">
              {t("wishlist")}
            </Link>
            <Link href="/cart" onClick={handleNavigate} className="hover:text-sericia-ink transition-colors">
              {t("cart")}
            </Link>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
