import disposableDomainsList from "disposable-email-domains" with { type: "json" };
import wildcardDomainsList from "disposable-email-domains/wildcard.json" with { type: "json" };

const disposableDomainsSet = new Set(disposableDomainsList as string[]);
const wildcardDomainsSet = new Set(wildcardDomainsList as string[]);

/**
 * Checks whether an email address uses a disposable, temporary, or burner email domain.
 *
 * Checks exact domain match, wildcards, and parent domains (e.g. subdomains of mailinator).
 *
 * @param email - The email address to check
 * @returns true if the email domain is detected as disposable/temporary
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;

  const atIndex = email.lastIndexOf("@");

  if (atIndex === -1 || atIndex === email.length - 1) return false;

  const domain = email
    .slice(atIndex + 1)
    .toLowerCase()
    .trim();

  if (!domain) return false;

  // Direct match against known disposable domains and wildcards
  if (disposableDomainsSet.has(domain) || wildcardDomainsSet.has(domain)) {
    return true;
  }

  // Check parent domains for subdomains (e.g., user@temp.mailinator.com)
  const parts = domain.split(".");

  for (let i = 1; i < parts.length - 1; i++) {
    const parentDomain = parts.slice(i).join(".");

    if (
      disposableDomainsSet.has(parentDomain) ||
      wildcardDomainsSet.has(parentDomain)
    ) {
      return true;
    }
  }

  return false;
}
