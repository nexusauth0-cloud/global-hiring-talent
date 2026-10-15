import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { company } from "@/lib/config";
import { services, industries } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-brand-900/10 bg-brand-950 text-brand-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo variant="light" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-100/80">
            {company.name} is a workforce solutions and recruitment partner,
            connecting organisations with qualified professionals through
            permanent, contract and executive hiring.
          </p>
        </div>

        <FooterColumn title="Services">
          {services.slice(0, 5).map((s) => (
            <FooterLink key={s.slug} href={`/services/${s.slug}`}>
              {s.title}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Industries">
          {industries.slice(0, 5).map((i) => (
            <FooterLink key={i.slug} href="/industries">
              {i.title}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Company">
          <FooterLink href="/about">About us</FooterLink>
          <FooterLink href="/jobs">Browse jobs</FooterLink>
          <FooterLink href="/employers">For employers</FooterLink>
          <FooterLink href="/candidates">For candidates</FooterLink>
          <FooterLink href="/reviews">Reviews</FooterLink>
          <FooterLink href="/insights">Insights</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-brand-100/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
        <div className="container-page pb-6 text-xs text-brand-100/50">
          <p>
            Contact:{" "}
            {company.hasRealContactEmail ? (
              <a href={`mailto:${company.email}`} className="hover:text-white">
                {company.email}
              </a>
            ) : (
              <span>Email address to be confirmed</span>
            )}
            {" · "}
            {company.hasRealContactPhone ? (
              <span>{company.phone}</span>
            ) : (
              <span>Telephone to be confirmed</span>
            )}
          </p>
          {!company.hasRealAddress && (
            <p className="mt-1">
              Registered office: address to be confirmed before public launch.
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-white">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="text-brand-100/80 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
