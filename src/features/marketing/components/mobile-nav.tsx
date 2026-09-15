"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigation } from "../data/marketing";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const breakpoint = matchMedia("(min-width: 1024px)");
    const close = () => setOpen(false);

    breakpoint.addEventListener("change", close);

    return () => breakpoint.removeEventListener("change", close);
  }, []);

  return (
    <div
      className="mobile-nav"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <Button
        ref={trigger}
        variant="ghost"
        size="icon"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav__menu"
          aria-label="Mobile navigation"
        >
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <Link
            href="/login"
            className="mobile-nav__login"
            onClick={() => setOpen(false)}
          >
            Log in
          </Link>
          <Link
            className="button"
            href="/create"
            onClick={() => setOpen(false)}
          >
            Create free event
          </Link>
        </nav>
      )}
    </div>
  );
}
