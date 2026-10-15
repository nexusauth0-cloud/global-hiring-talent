import { ButtonLink } from "@/components/ui/Button";

export function CtaBand({
  title = "Let's talk about your workforce needs",
  description = "Whether you are hiring at scale or looking for your next role, our team will respond personally.",
  primary = { href: "/contact", label: "Contact our team" },
  secondary,
}: {
  title?: string;
  description?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="container-page py-20 sm:py-24">
      <div className="overflow-hidden rounded-2xl bg-brand-800 px-6 py-14 text-white sm:px-12">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-brand-100/90">{description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={primary.href} variant="accent" size="lg">
              {primary.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink
                href={secondary.href}
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/5 text-white hover:bg-white/10"
              >
                {secondary.label}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
