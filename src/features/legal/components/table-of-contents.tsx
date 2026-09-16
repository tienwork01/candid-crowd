"use client";

import { useEffect, useState } from "react";
import { CaretDown, ListBullets, ArrowUp } from "@phosphor-icons/react";

export interface TocItem {
  id: string;
  number?: string | number;
  title: string;
}

interface TableOfContentsProps {
  items: TocItem[];
  title?: string;
}

export function TableOfContents({
  items,
  title = "Table of Contents",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140; // Offset for fixed navbar + spacing

      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const element = document.getElementById(item.id);

        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(item.id);

          return;
        }
      }

      if (items.length > 0 && window.scrollY < 200) {
        setActiveId(items[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();

    const element = document.getElementById(id);

    if (element) {
      const yOffset = -96; // Header clearance
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
      setIsOpenMobile(false);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <>
      {/* Mobile Table of Contents Accordion */}
      <div className="legal-toc-mobile">
        <details
          open={isOpenMobile}
          onToggle={(e) => setIsOpenMobile(e.currentTarget.open)}
        >
          <summary className="legal-toc-mobile__summary">
            <span className="legal-toc-mobile__badge">
              <ListBullets size={16} aria-hidden="true" />
              <span>
                {activeItem
                  ? `${activeItem.number ? `${activeItem.number}. ` : ""}${activeItem.title}`
                  : title}
              </span>
            </span>
            <CaretDown className="legal-toc-mobile__icon" aria-hidden="true" />
          </summary>
          <div className="legal-toc-mobile__content">
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`legal-toc-mobile__link ${
                  activeId === item.id ? "legal-toc__link--active" : ""
                }`}
                onClick={(e) => handleLinkClick(e, item.id)}
              >
                {item.number ? `${item.number}. ` : ""}
                {item.title}
              </a>
            ))}
          </div>
        </details>
      </div>

      {/* Desktop Sticky Table of Contents */}
      <nav className="legal-toc" aria-label={title}>
        <div className="legal-toc__header">
          <span className="legal-toc__title">{title}</span>
          <span className="legal-toc__count">{items.length} sections</span>
        </div>
        <ol className="legal-toc__list">
          {items.map((item) => {
            const isActive = activeId === item.id;

            return (
              <li key={item.id} className="legal-toc__item">
                <a
                  href={`#${item.id}`}
                  className={`legal-toc__link ${
                    isActive ? "legal-toc__link--active" : ""
                  }`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={(e) => handleLinkClick(e, item.id)}
                >
                  {item.number && (
                    <span className="legal-toc__num">{item.number}.</span>
                  )}
                  <span>{item.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export function BackToTop() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="legal-page__back-top"
      aria-label="Scroll back to top of page"
    >
      <ArrowUp size={16} aria-hidden="true" />
      <span>Back to top</span>
    </button>
  );
}
