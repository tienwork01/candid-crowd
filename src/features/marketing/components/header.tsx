import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Brand } from "@/components/shared";
import { navigation } from "../data/marketing";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />
        <nav className="site-header__nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-header__actions">
          <Link href="/login" className="site-header__login">
            Log in
          </Link>
          <Link className="button button--small" href="/events/new">
            Create free event <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
