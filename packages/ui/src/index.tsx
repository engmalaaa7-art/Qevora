import React from "react";
import { getBilingualText } from "@qevora/shared";

// --- Base Prop Contract ---
export interface SectionProps {
  id: string;
  content: any;
  style?: any;
  direction: "ltr" | "rtl";
  language: "en" | "ar";
  activeLanguage: "en" | "ar";
}

// --- Layout Wrapper ---
export const SectionWrapper: React.FC<{
  id: string;
  style?: any;
  className?: string;
  children: React.ReactNode;
}> = ({ id, style, className = "", children }) => {
  const paddingY = style?.paddingTop === "xl" ? "py-24" : style?.paddingTop === "lg" ? "py-16" : "py-12";
  const bg = style?.backgroundColor ? `bg-[${style.backgroundColor}]` : "bg-[var(--color-background)]";
  const containerClass = style?.containerWidth === "narrow" ? "max-w-3xl" : style?.containerWidth === "wide" ? "max-w-7xl" : "max-w-5xl";

  return (
    <section id={id} className={`w-full ${paddingY} ${bg} ${className}`}>
      <div className={`mx-auto px-4 ${containerClass}`}>
        {children}
      </div>
    </section>
  );
};

// --- Primtive Button ---
export const Button: React.FC<{
  label: string;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
}> = ({ label, href, variant = "primary" }) => {
  const baseClass = "px-6 py-2.5 rounded-[var(--radius-md)] font-medium transition duration-200 inline-block text-center";
  const variantClass =
    variant === "primary"
      ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-text-inverse)]"
      : variant === "secondary"
      ? "bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-[var(--color-text-inverse)]"
      : "border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text)]";

  if (href) {
    return <a href={href} className={`${baseClass} ${variantClass}`}>{label}</a>;
  }
  return <button className={`${baseClass} ${variantClass}`}>{label}</button>;
};

// --- Navbar Component ---
export const Navbar: React.FC<SectionProps> = ({ id, content, direction, activeLanguage }) => {
  const logo = getBilingualText(content.logoText, activeLanguage);
  const links = content.links || [];

  return (
    <header id={id} className="w-full bg-[var(--color-background)] border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-[var(--navbar-height)] flex items-center justify-between">
        <div className="text-xl font-bold text-[var(--color-text)]">{logo}</div>
        <nav className={`flex items-center gap-6 ${direction === "rtl" ? "flex-row-reverse" : "flex-row"}`}>
          {links.map((link: any) => (
            <a
              key={link.id}
              href={link.href}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium"
            >
              {getBilingualText(link.label, activeLanguage)}
            </a>
          ))}
          {content.ctaButton && (
            <Button
              label={getBilingualText(content.ctaButton.label, activeLanguage)}
              href={content.ctaButton.href}
            />
          )}
        </nav>
      </div>
    </header>
  );
};

// --- Hero Component ---
export const Hero: React.FC<SectionProps> = ({ id, content, direction, activeLanguage }) => {
  const headline = getBilingualText(content.headline, activeLanguage);
  const subheadline = getBilingualText(content.subheadline, activeLanguage);

  return (
    <section id={id} className="py-20 bg-[var(--color-background-alt)] text-[var(--color-text)]">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className={direction === "rtl" ? "md:order-2" : "md:order-1"}>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            {headline}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8">
            {subheadline}
          </p>
          <div className="flex gap-4">
            {content.primaryCta && (
              <Button
                label={getBilingualText(content.primaryCta.label, activeLanguage)}
                href={content.primaryCta.href}
              />
            )}
            {content.secondaryCta && (
              <Button
                label={getBilingualText(content.secondaryCta.label, activeLanguage)}
                href={content.secondaryCta.href}
                variant="outline"
              />
            )}
          </div>
        </div>
        {content.imageUrl && (
          <div className={`rounded-xl overflow-hidden shadow-lg ${direction === "rtl" ? "md:order-1" : "md:order-2"}`}>
            <img src={content.imageUrl} alt={headline} className="w-full h-96 object-cover" />
          </div>
        )}
      </div>
    </section>
  );
};

// --- Features Component ---
export const Features: React.FC<SectionProps> = ({ id, content, activeLanguage }) => {
  const heading = getBilingualText(content.heading, activeLanguage);
  const items = content.items || [];

  return (
    <SectionWrapper id={id}>
      <h2 className="text-3xl font-bold text-center text-[var(--color-text)] mb-12">{heading}</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {items.map((item: any) => (
          <div key={item.id} className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
              {getBilingualText(item.title, activeLanguage)}
            </h3>
            <p className="text-[var(--color-text-secondary)]">
              {getBilingualText(item.description, activeLanguage)}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

// --- Testimonials Component ---
export const Testimonials: React.FC<SectionProps> = ({ id, content, activeLanguage }) => {
  const heading = getBilingualText(content.heading, activeLanguage);
  const items = content.items || [];

  return (
    <SectionWrapper id={id} className="bg-[var(--color-background-alt)]">
      <h2 className="text-3xl font-bold text-center text-[var(--color-text)] mb-12">{heading}</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {items.map((item: any) => (
          <div key={item.id} className="p-8 bg-[var(--color-surface)] rounded-xl shadow-md border border-[var(--color-border)]">
            <p className="italic text-lg text-[var(--color-text)] mb-6">
              " {getBilingualText(item.quote, activeLanguage)} "
            </p>
            <div className="flex items-center gap-4">
              {item.avatarUrl && <img src={item.avatarUrl} className="w-12 h-12 rounded-full" alt={item.authorName} />}
              <div>
                <h4 className="font-bold text-[var(--color-text)]">{item.authorName}</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {getBilingualText(item.authorTitle, activeLanguage)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

// --- Contact Form Component ---
export const ContactForm: React.FC<SectionProps> = ({ id, content, activeLanguage }) => {
  const heading = getBilingualText(content.heading, activeLanguage);
  const fields = content.fields || [];

  return (
    <SectionWrapper id={id}>
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-bold text-center text-[var(--color-text)] mb-8">{heading}</h2>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {fields.map((field: any) => (
            <div key={field.id} className="flex flex-col gap-2">
              <label htmlFor={field.id} className="text-sm font-semibold text-[var(--color-text)]">
                {getBilingualText(field.label, activeLanguage)}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.id}
                  rows={4}
                  className="p-3 border border-[var(--color-border-strong)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text)]"
                />
              ) : (
                <input
                  type={field.type}
                  id={field.id}
                  className="p-3 border border-[var(--color-border-strong)] rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text)]"
                />
              )}
            </div>
          ))}
          <Button label={getBilingualText(content.submitLabel, activeLanguage)} />
        </form>
      </div>
    </SectionWrapper>
  );
};

// --- Pricing Component ---
export const Pricing: React.FC<SectionProps> = ({ id, content, activeLanguage }) => {
  const heading = getBilingualText(content.heading, activeLanguage);
  const plans = content.plans || [];

  return (
    <SectionWrapper id={id}>
      <h2 className="text-3xl font-bold text-center text-[var(--color-text)] mb-12">{heading}</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan: any) => (
          <div
            key={plan.id}
            className={`p-8 rounded-xl shadow-lg border flex flex-col justify-between ${
              plan.isHighlighted
                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] bg-[var(--color-surface)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)]"
            }`}
          >
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                {getBilingualText(plan.name, activeLanguage)}
              </h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-[var(--color-text)]">{plan.price}</span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {getBilingualText(plan.period, activeLanguage)}
                </span>
              </div>
              <p className="text-[var(--color-text-secondary)] mb-6">
                {getBilingualText(plan.description, activeLanguage)}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-[var(--color-text)]">
                    <span className="text-[var(--color-success)]">✓</span>
                    <span>{getBilingualText(feat, activeLanguage)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              label={getBilingualText(plan.ctaLabel, activeLanguage)}
              href={plan.ctaHref}
              variant={plan.isHighlighted ? "primary" : "outline"}
            />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

// --- Footer Component ---
export const Footer: React.FC<SectionProps> = ({ id, content, activeLanguage }) => {
  const logo = getBilingualText(content.logoText, activeLanguage);
  const copyright = getBilingualText(content.copyrightText, activeLanguage);

  return (
    <footer id={id} className="w-full bg-[var(--color-background)] border-t border-[var(--color-border)] py-12 text-[var(--color-text-secondary)]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="text-xl font-bold text-[var(--color-text)] mb-2">{logo}</div>
          <p className="text-sm">{getBilingualText(content.tagline, activeLanguage)}</p>
        </div>
        <div className="text-sm">{copyright}</div>
      </div>
    </footer>
  );
};

// --- Cookie Banner Component ---
export const CookieBanner: React.FC<SectionProps> = ({ id, content, activeLanguage }) => {
  return (
    <div
      id={id}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md p-6 bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-xl shadow-2xl z-50 flex flex-col gap-4"
    >
      <p className="text-[var(--color-text-secondary)] text-sm">
        {getBilingualText(content.consentText, activeLanguage)}
      </p>
      <div className="flex justify-end gap-2">
        <Button label={getBilingualText(content.acceptLabel, activeLanguage)} variant="primary" />
      </div>
    </div>
  );
};

// --- Fallback Component ---
export const UnknownComponent: React.FC<{ type: string }> = ({ type }) => {
  return (
    <div className="p-8 border-2 border-dashed border-[var(--color-error)] text-center rounded-lg bg-[var(--color-surfaceElevated)]">
      <p className="text-[var(--color-error)] font-semibold">
        ⚠ Component type [{type}] is not registered. Please check component registry specifications.
      </p>
    </div>
  );
};
