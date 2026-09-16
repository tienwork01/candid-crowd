"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { navigation } from "../data/marketing";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);

  useEffect(() => {
    const breakpoint = matchMedia("(min-width: 1024px)");

    const close = () => {
      if (menu.current) menu.current.open = false;
      setOpen(false);
    };

    if (breakpoint.addEventListener) {
      breakpoint.addEventListener("change", close);

      return () => breakpoint.removeEventListener("change", close);
    }

    breakpoint.addListener(close);

    return () => breakpoint.removeListener(close);
  }, []);

  function close() {
    if (menu.current) menu.current.open = false;
    setOpen(false);
  }

  return (
    <details
      ref={menu}
      className="mobile-nav"
      onToggle={(event) => setOpen(event.currentTarget.open)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          close();
          trigger.current?.focus();
        }
      }}
    >
      <summary
        ref={trigger}
        className="mobile-nav__trigger"
        role="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        <List
          className="mobile-nav__icon mobile-nav__icon--open"
          aria-hidden="true"
        />
        <X
          className="mobile-nav__icon mobile-nav__icon--close"
          aria-hidden="true"
        />
      </summary>
      <nav
        id="mobile-nav"
        className="mobile-nav__menu"
        aria-label="Mobile navigation"
      >
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={close}>
            {item.label}
          </Link>
        ))}
        <Link href="/login" className="mobile-nav__login" onClick={close}>
          Log in
        </Link>
        <Link className="button" href="/events/new" onClick={close}>
          Create free event
        </Link>
      </nav>
    </details>
  );
}
