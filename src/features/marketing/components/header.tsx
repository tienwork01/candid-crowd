import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { navigation } from "../data/marketing";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />
        <nav className="site-header__nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="site-header__actions">
          <Link href="/login" className="site-header__login">
            Log in
          </Link>
          <Link className="button button--small" href="/create">
            Create free event <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
