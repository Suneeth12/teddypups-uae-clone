"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/data/site";
import MobileMenu from "@/components/MobileMenu";
import { PAW_PATH } from "@/components/pup-svg-paths";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let lastY = window.scrollY;
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const y = window.scrollY;
      header.dataset.scrolled = String(y > 8);
      if (Math.abs(y - lastY) > 6) {
        header.dataset.hidden = String(y > lastY && y > 220);
        lastY = y;
      }
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    const onFocusIn = () => {
      header.dataset.hidden = "false";
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    header.addEventListener("focusin", onFocusIn);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      header.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      id="site-header"
      data-scrolled="false"
      data-hidden="false"
      data-home={isHome ? "true" : undefined}
      className="tp-header fixed inset-x-0 top-0 z-50"
    >
      <div className="tp-header__bar gutter">
        <Link
          href="/"
          className="tp-header__brand"
          aria-label="TeddyPups U.A.E. — home"
        >
          <Image
            src="/brand/logo.png"
            alt=""
            width={56}
            height={56}
            priority
            className="tp-header__logo"
          />
          <span className="font-plush tp-header__name">TeddyPups</span>
        </Link>

        <nav aria-label="Main" className="tp-header__nav">
          <ul>
            {SITE_CONFIG.navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    data-active={isActive ? "true" : "false"}
                    className="tp-nav-link"
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

        <div className="tp-header__end">
          <a
            href={SITE_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp tp-header__wa"
          >
            WhatsApp us
          </a>
          <MobileMenu />
        </div>
      </div>

      <svg
        aria-hidden="true"
        className="tp-header__hem"
        width="100%"
        height="14"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="tp-hem"
            width="44"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 0H44V2A22 11 0 0 1 0 2Z"
              className="tp-header__hem-fill"
            />
            <path
              d="M0 2A22 11 0 0 0 44 2"
              className="tp-header__hem-line"
            />
          </pattern>
        </defs>
        <rect width="100%" height="14" fill="url(#tp-hem)" />
      </svg>
    </header>
  );
}
