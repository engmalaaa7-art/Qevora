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
  const paddingY = style?.paddingTop === "xl" ? "py-24 md:py-32" : style?.paddingTop === "lg" ? "py-16 md:py-24" : style?.paddingTop === "none" ? "py-0" : "py-12 md:py-16";
  const containerClass = style?.containerWidth === "narrow" ? "max-w-3xl" : style?.containerWidth === "wide" ? "max-w-7xl" : "max-w-6xl";
  
  const customStyle: React.CSSProperties = {};
  if (style?.backgroundColor) {
    customStyle.backgroundColor = style.backgroundColor;
  }
  if (style?.backgroundImage) {
    customStyle.backgroundImage = `url(${style.backgroundImage})`;
    customStyle.backgroundSize = "cover";
    customStyle.backgroundPosition = "center";
  }
  if (style?.backgroundGradient) {
    customStyle.background = style.backgroundGradient;
  }

  return (
    <section 
      id={id} 
      style={customStyle} 
      className={`w-full ${paddingY} relative overflow-hidden transition-all duration-300 ${style?.backgroundColor ? "" : "bg-[var(--color-background)]"} ${className}`}
    >
      <div className={`mx-auto px-6 md:px-8 relative z-10 ${containerClass}`}>
        {children}
      </div>
    </section>
  );
};

// --- Primitive Button ---
export const Button: React.FC<{
  label: string;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "gradient";
}> = ({ label, href, variant = "primary" }) => {
  const baseClass = "px-6 py-3 rounded-[var(--radius-md)] font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center text-center cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]";
  
  const variantClass =
    variant === "primary"
      ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-text-inverse)] hover:shadow-lg hover:shadow-[var(--color-primary)]/20"
      : variant === "secondary"
      ? "glass-effect text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
      : variant === "gradient"
      ? "bg-gradient-premium text-white hover:opacity-95 hover:shadow-lg hover:shadow-[var(--color-primary)]/20"
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
    <header 
      id={id} 
      dir={direction}
      className="w-full glass-effect border-b sticky top-0 z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-[var(--navbar-height)] flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-premium bg-clip-text text-transparent text-glow-primary tracking-tight">
          {logo}
        </div>
        <nav className="flex items-center gap-6 md:gap-8">
          <div className="hidden md:flex items-center gap-6">
            {links.map((link: any) => (
              <a
                key={link.id}
                href={link.href}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium text-sm transition-colors duration-200"
              >
                {getBilingualText(link.label, activeLanguage)}
              </a>
            ))}
          </div>
          {content.ctaButton && (
            <Button
              label={getBilingualText(content.ctaButton.label, activeLanguage)}
              href={content.ctaButton.href}
              variant="gradient"
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
    <section 
      id={id} 
      dir={direction}
      className="py-20 md:py-32 bg-[var(--color-background-alt)] text-[var(--color-text)] relative overflow-hidden"
    >
      {/* Premium ambient glow background */}
      <div className="absolute inset-0 bg-glow-radial pointer-events-none" />
      <div className="absolute top-1/4 start-1/4 w-[400px] h-[400px] bg-[var(--color-primary-light)]/10 dark:bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
        <div className="text-start">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15] md:leading-[1.1] ${activeLanguage === "ar" ? "leading-relaxed" : ""}`}>
            {headline}
          </h1>
          <p className={`text-lg md:text-xl text-[var(--color-text-secondary)] mb-8 leading-relaxed max-w-xl ${activeLanguage === "ar" ? "leading-loose" : ""}`}>
            {subheadline}
          </p>
          <div className="flex flex-wrap gap-4">
            {content.primaryCta && (
              <Button
                label={getBilingualText(content.primaryCta.label, activeLanguage)}
                href={content.primaryCta.href}
                variant="gradient"
              />
            )}
            {content.secondaryCta && (
              <Button
                label={getBilingualText(content.secondaryCta.label, activeLanguage)}
                href={content.secondaryCta.href}
                variant="secondary"
              />
            )}
          </div>
        </div>
        {content.imageUrl && (
          <div className="relative group animate-float">
            <div className="absolute -inset-1.5 bg-gradient-premium rounded-2xl blur opacity-30 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <img 
                src={content.imageUrl} 
                alt={headline} 
                className="w-full h-[400px] object-cover transform transition-transform duration-700 group-hover:scale-105" 
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// --- Features Component ---
export const Features: React.FC<SectionProps> = ({ id, content, direction, activeLanguage }) => {
  const heading = getBilingualText(content.heading, activeLanguage);
  const items = content.items || [];

  return (
    <SectionWrapper id={id} className="relative">
      <div className="text-center max-w-3xl mx-auto mb-16" dir={direction}>
        <h2 className={`text-3xl md:text-4xl font-extrabold text-[var(--color-text)] tracking-tight ${activeLanguage === "ar" ? "leading-relaxed" : ""}`}>
          {heading}
        </h2>
        <div className="w-16 h-1 bg-gradient-premium mx-auto mt-4 rounded-full" />
      </div>
      <div className="grid md:grid-cols-3 gap-8" dir={direction}>
        {items.map((item: any) => (
          <div 
            key={item.id} 
            className="group p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:border-[var(--color-primary)]/50 hover:shadow-xl hover:shadow-[var(--color-primary)]/5 transition-all duration-300 hover:-translate-y-1 text-start"
          >
            <div className="w-12 h-12 bg-[var(--color-primary-light)]/20 dark:bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 group-hover:text-[var(--color-primary)] transition-colors duration-200">
              {getBilingualText(item.title, activeLanguage)}
            </h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">
              {getBilingualText(item.description, activeLanguage)}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

// --- Testimonials Component ---
export const Testimonials: React.FC<SectionProps> = ({ id, content, direction, activeLanguage }) => {
  const heading = getBilingualText(content.heading, activeLanguage);
  const items = content.items || [];

  return (
    <SectionWrapper id={id} className="bg-[var(--color-background-alt)] relative">
      <div className="text-center max-w-3xl mx-auto mb-16" dir={direction}>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
          {heading}
        </h2>
        <div className="w-16 h-1 bg-gradient-premium mx-auto mt-4 rounded-full" />
      </div>
      <div className="grid md:grid-cols-2 gap-8" dir={direction}>
        {items.map((item: any) => (
          <div 
            key={item.id} 
            className="p-8 bg-[var(--color-surface)] rounded-2xl shadow-md border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-start relative overflow-hidden"
          >
            {/* Elegant massive quote mark in the background */}
            <div className="absolute top-4 end-4 text-[var(--color-primary-light)]/20 dark:text-[var(--color-primary)]/5 text-7xl font-serif select-none pointer-events-none">
              “
            </div>
            <p className="italic text-base md:text-lg text-[var(--color-text)] mb-6 leading-relaxed relative z-10">
              "{getBilingualText(item.quote, activeLanguage)}"
            </p>
            <div className="flex items-center gap-4 relative z-10">
              {item.avatarUrl ? (
                <img src={item.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-border)]" alt={item.authorName} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-premium flex items-center justify-center text-white font-bold">
                  {item.authorName?.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-bold text-[var(--color-text)]">{item.authorName}</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
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
export const ContactForm: React.FC<SectionProps> = ({ id, content, direction, activeLanguage }) => {
  const heading = getBilingualText(content.heading, activeLanguage);
  const fields = content.fields || [];

  return (
    <SectionWrapper id={id}>
      <div className="max-w-2xl mx-auto glass-effect border rounded-3xl p-8 md:p-12 shadow-xl" dir={direction}>
        <h2 className="text-3xl font-extrabold text-center text-[var(--color-text)] mb-2 tracking-tight">
          {heading}
        </h2>
        <div className="w-12 h-1 bg-gradient-premium mx-auto mb-8 rounded-full" />
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid md:grid-cols-2 gap-6">
            {fields.filter((_: any, idx: number) => idx < 2).map((field: any) => (
              <div key={field.id} className="flex flex-col gap-2 text-start">
                <label htmlFor={field.id} className="text-sm font-semibold text-[var(--color-text)]">
                  {getBilingualText(field.label, activeLanguage)}
                </label>
                <input
                  type={field.type}
                  id={field.id}
                  className="p-3.5 border border-[var(--color-border-strong)] rounded-xl bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition duration-200"
                />
              </div>
            ))}
          </div>
          {fields.filter((_: any, idx: number) => idx >= 2).map((field: any) => (
            <div key={field.id} className="flex flex-col gap-2 text-start">
              <label htmlFor={field.id} className="text-sm font-semibold text-[var(--color-text)]">
                {getBilingualText(field.label, activeLanguage)}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.id}
                  rows={4}
                  className="p-3.5 border border-[var(--color-border-strong)] rounded-xl bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition duration-200"
                />
              ) : (
                <input
                  type={field.type}
                  id={field.id}
                  className="p-3.5 border border-[var(--color-border-strong)] rounded-xl bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition duration-200"
                />
              )}
            </div>
          ))}
          <div className="pt-2 text-start">
            <Button 
              label={getBilingualText(content.submitLabel, activeLanguage)} 
              variant="gradient"
            />
          </div>
        </form>
      </div>
    </SectionWrapper>
  );
};

// --- Pricing Component ---
export const Pricing: React.FC<SectionProps> = ({ id, content, direction, activeLanguage }) => {
  const heading = getBilingualText(content.heading, activeLanguage);
  const plans = content.plans || [];

  return (
    <SectionWrapper id={id}>
      <div className="text-center max-w-3xl mx-auto mb-16" dir={direction}>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
          {heading}
        </h2>
        <div className="w-16 h-1 bg-gradient-premium mx-auto mt-4 rounded-full" />
      </div>
      <div className="grid md:grid-cols-3 gap-8 items-stretch" dir={direction}>
        {plans.map((plan: any) => (
          <div
            key={plan.id}
            className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative text-start ${
              plan.isHighlighted
                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] bg-[var(--color-surface)] shadow-2xl shadow-[var(--color-primary)]/10 scale-[1.03]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] shadow-md"
            }`}
          >
            {plan.isHighlighted && (
              <div className="absolute top-0 end-0 bg-gradient-premium text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl rounded-tr-[22px]">
                {activeLanguage === "ar" ? "الأكثر شعبية" : "Popular"}
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                {getBilingualText(plan.name, activeLanguage)}
              </h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-[var(--color-text)]">{plan.price}</span>
                <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                  / {getBilingualText(plan.period, activeLanguage)}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
                {getBilingualText(plan.description, activeLanguage)}
              </p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feat: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[var(--color-text)]">
                    <span className="text-[var(--color-success)] mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="leading-tight">{getBilingualText(feat, activeLanguage)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              label={getBilingualText(plan.ctaLabel, activeLanguage)}
              href={plan.ctaHref}
              variant={plan.isHighlighted ? "gradient" : "outline"}
            />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

// --- Footer Component ---
export const Footer: React.FC<SectionProps> = ({ id, content, direction, activeLanguage }) => {
  const logo = getBilingualText(content.logoText, activeLanguage);
  const copyright = getBilingualText(content.copyrightText, activeLanguage);

  return (
    <footer 
      id={id} 
      dir={direction}
      className="w-full bg-[var(--color-background)] border-t border-[var(--color-border)] py-16 text-[var(--color-text-secondary)]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-start">
          <div className="text-2xl font-bold bg-gradient-premium bg-clip-text text-transparent mb-3">{logo}</div>
          <p className="text-sm max-w-sm leading-relaxed">{getBilingualText(content.tagline, activeLanguage)}</p>
        </div>
        <div className="text-sm font-medium">{copyright}</div>
      </div>
    </footer>
  );
};

// --- Cookie Banner Component ---
export const CookieBanner: React.FC<SectionProps> = ({ id, content, direction, activeLanguage }) => {
  return (
    <div
      id={id}
      dir={direction}
      className="fixed bottom-6 start-6 end-6 md:start-auto md:max-w-md p-6 backdrop-blur-md bg-[var(--color-surface)]/90 border border-[var(--color-border-strong)] rounded-2xl shadow-2xl z-50 flex flex-col gap-4 text-start transition-all duration-500 animate-float"
    >
      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
        {getBilingualText(content.consentText, activeLanguage)}
      </p>
      <div className="flex justify-end gap-2">
        <Button 
          label={getBilingualText(content.acceptLabel, activeLanguage)} 
          variant="gradient" 
        />
      </div>
    </div>
  );
};

// --- Fallback Component ---
export const UnknownComponent: React.FC<{ type: string }> = ({ type }) => {
  return (
    <div className="p-8 border-2 border-dashed border-[var(--color-error)] text-center rounded-2xl bg-[var(--color-surface-elevated)] max-w-md mx-auto my-8">
      <p className="text-[var(--color-error)] font-semibold mb-2">
        ⚠ Component type [{type}] is not registered.
      </p>
      <p className="text-xs text-[var(--color-text-secondary)]">
        Please check your Qevora component registry configuration.
      </p>
    </div>
  );
};
