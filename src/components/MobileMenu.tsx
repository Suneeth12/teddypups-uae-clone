"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/data/site";
import { PAW_PATH } from "@/components/pup-svg-paths";
import { prefersReducedMotion } from "@/lib/media-queries";

export default function MobileMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingTimerRef = useRef<number | null>(null);
  const animHandlerRef = useRef<((e: AnimationEvent) => void) | null>(null);
  const pathname = usePathname();

  const clearPendingClose = useCallback((dialog?: HTMLDialogElement | null) => {
    if (closingTimerRef.current) {
      clearTimeout(closingTimerRef.current);
      closingTimerRef.current = null;
    }
    if (dialog && animHandlerRef.current) {
      dialog.removeEventListener("animationend", animHandlerRef.current);
      animHandlerRef.current = null;
    }
  }, []);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    clearPendingClose(dialog);
    delete dialog.dataset.closing;
    if (!dialog.open) dialog.showModal();
  }, [clearPendingClose]);

  const close = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open || dialog.dataset.closing === "true") return;
    if (prefersReducedMotion()) {
      dialog.close();
      return;
    }
    dialog.dataset.closing = "true";
    const finish = () => {
      clearPendingClose(dialog);
      if (dialog.dataset.closing && dialog.open) dialog.close();
    };
    const onAnimEnd = (e: AnimationEvent) => {
      if (e.target === dialog) finish();
    };
    animHandlerRef.current = onAnimEnd;
    dialog.addEventListener("animationend", onAnimEnd);
    closingTimerRef.current = window.setTimeout(finish, 600);
  }, [clearPendingClose]);

  useEffect(() => {
    const dialogEl = dialogRef.current;
    const onNavigate = () => {
      const dialog = dialogRef.current;
      clearPendingClose(dialog);
      if (dialog?.open) {
        delete dialog.dataset.closing;
        dialog.close();
      }
    };
    window.addEventListener("tp:navigate", onNavigate);
    return () => {
      window.removeEventListener("tp:navigate", onNavigate);
      clearPendingClose(dialogEl);
    };
  }, [clearPendingClose]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-cocoa bg-milk px-4 text-[0.95rem] font-semibold lg:hidden"
        aria-haspopup="dialog"
      >
        <svg
          viewBox="0 0 64 64"
          className="size-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={PAW_PATH} />
        </svg>
        Menu
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        className="tp-menu m-0 h-dvh max-h-none w-screen max-w-none bg-honey p-0 text-cocoa backdrop:bg-cocoa/40"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        onClose={() => {
          const dialog = dialogRef.current;
          clearPendingClose(dialog);
          if (dialog) delete dialog.dataset.closing;
        }}
      >
        <div className="flex h-full flex-col gutter pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5">
          <div className="flex items-center justify-between">
            <span className="font-scrawl text-lg">where to, friend?</span>
            <button
              type="button"
              onClick={close}
              className="h-11 rounded-full bg-cocoa px-5 font-semibold text-milk"
            >
              Close
            </button>
          </div>

          <nav aria-label="Mobile" className="mt-10 flex-1">
            <ul className="space-y-1">
              {SITE_CONFIG.navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={isActive ? "page" : undefined}
                      data-active={isActive ? "true" : "false"}
                      className="tp-menu-link font-plush block py-2 text-[clamp(2.4rem,11vw,3.4rem)]"
                    >
                      <span>{link.label}</span>
                      <svg
                        viewBox="0 0 64 64"
                        className="tp-nav-link__paw"
                        aria-hidden="true"
                        fill="currentColor"
                      >
                        <path d={PAW_PATH} />
                      </svg>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-3">
            <a
              href={SITE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp w-full"
            >
              WhatsApp us
            </a>
            <p className="text-center text-sm font-medium">{SITE_CONFIG.phone}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
