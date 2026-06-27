"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, Sparkles } from "lucide-react";
import { LanguageProvider, useLanguage } from "../../components/LanguageContext";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { Button, GlassCard, Section } from "../../components/ui";
import { AmbientShader } from "../../components/AmbientShader";

function PricingPageContent() {
  const { t, language } = useLanguage();
  const [isYearly, setIsYearly] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Translations helpers for Pricing specific content
  const pt = (en: string, ar: string) => (language === "ar" ? ar : en);

  const faqData = [
    {
      q: pt(
        "Can I cancel my subscription at any time?",
        "هل يمكنني إلغاء اشتراكي في أي وقت؟"
      ),
      a: pt(
        "Yes, you can cancel your subscription at any time from your account settings. You will retain access to your plan's features until the end of your current billing period.",
        "نعم، يمكنك إلغاء اشتراكك في أي وقت من إعدادات حسابك. ستحتفظ بإمكانية الوصول إلى ميزات خطتك حتى نهاية فترة الفاتورة الحالية."
      ),
    },
    {
      q: pt("What are AI Credits?", "ما هي أرصدة الذكاء الاصطناعي؟"),
      a: pt(
        "AI Credits power the generative features like 'Write with AI', 'Generate Sections', and 'Auto-Design'. Each major action consumes a credit. Pro and Enterprise plans enjoy unlimited generations.",
        "أرصدة الذكاء الاصطناعي تشغل الميزات التوليدية مثل 'الكتابة بالذكاء الاصطناعي' و 'توليد الأقسام' و 'التصميم التلقائي'. يستهلك كل إجراء رئيسي رصيدًا واحدًا. تتمتع الباقات الاحترافية والمؤسسات بأجيال غير محدودة."
      ),
    },
    {
      q: pt(
        "Does Qevora offer student discounts?",
        "هل تقدم Qevora خصومات للطلاب؟"
      ),
      a: pt(
        "Absolutely! We offer a 50% discount for students and educators with a valid .edu email address. Contact our support team to activate your discount.",
        "بالتأكيد! نحن نقدم خصمًا بنسبة 50% للطلاب والمعلمين الذين لديهم عنوان بريد إلكتروني صالح ينتهي بـ .edu. اتصل بفريق الدعم لتفعيل الخصم الخاص بك."
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative">
      {/* WebGL background shader */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <AmbientShader type="blobs" />
      </div>

      <Navbar />

      <main className="flex-grow z-10">
        {/* Hero */}
        <Section className="pt-32 pb-16 text-center max-w-container-max mx-auto relative">
          <h1 className="font-rubik text-5xl md:text-display-lg leading-tight font-extrabold mb-6">
            {pt("Simple, Transparent Pricing", "تسعير بسيط وشفاف")}
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            {pt(
              "Choose the plan that's right for your creative journey. All plans include our core AI engine.",
              "اختر الخطة المناسبة لرحلتك الإبداعية. تشمل جميع الخطط محرك الذكاء الاصطناعي الأساسي لدينا."
            )}
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className="text-label-md text-on-surface-variant">
              {pt("Monthly", "شهرياً")}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-8 bg-white/5 border border-white/10 rounded-full p-1 relative transition-colors duration-300 hover:bg-white/10"
              aria-label="Toggle billing duration"
            >
              <div
                className={`w-5 h-5 bg-primary rounded-full transition-all duration-300 shadow-lg ${
                  isYearly
                    ? "translate-x-6 rtl:-translate-x-6"
                    : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-label-md text-on-surface">
              {pt("Yearly", "سنوياً")}{" "}
              <span className="text-secondary bg-secondary/10 px-2 py-0.5 rounded-full text-[10px] ml-1">
                -20%
              </span>
            </span>
          </div>
        </Section>

        {/* Pricing Cards */}
        <Section className="px-margin-mobile md:px-margin-desktop pb-24 max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Free Plan */}
            <GlassCard className="p-8 rounded-3xl flex flex-col justify-between" hover>
              <div>
                <h3 className="text-headline-lg font-bold mb-2">
                  {pt("Free", "المجانية")}
                </h3>
                <p className="text-on-surface-variant text-body-md mb-8">
                  {pt(
                    "For hobbyists and curious minds.",
                    "للهواة والعقول الفضولية."
                  )}
                </p>
                <div className="mb-8">
                  <span className="text-5xl font-black">$0</span>
                  <span className="text-on-surface-variant">
                    {pt("/mo", " /شهرياً")}
                  </span>
                </div>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("AI Web Builder (Basic)", "منشئ الويب الأساسي بالذكاء الاصطناعي")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("Qevora Subdomain", "نطاق فرعي من Qevora")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("5 Pages per site", "5 صفحات لكل موقع")}</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-40">
                    <XCircle size={18} className="text-on-surface-variant shrink-0" />
                    <span className="text-body-md">{pt("Custom Domains", "النطاقات المخصصة")}</span>
                  </li>
                </ul>
              </div>
              <Button variant="outline" href="/login" className="w-full">
                {pt("Get Started", "ابدأ الآن")}
              </Button>
            </GlassCard>

            {/* Pro Plan */}
            <div className="glass p-8 rounded-3xl flex flex-col justify-between relative border-primary/50 ring-2 ring-primary/20 scale-105 z-10 bg-surface-container">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                {pt("Most Popular", "الأكثر شعبية")}
              </div>
              <div>
                <h3 className="text-headline-lg font-bold mb-2 mt-4 text-primary">
                  {pt("Pro", "الاحترافية")}
                </h3>
                <p className="text-on-surface-variant text-body-md mb-8">
                  {pt(
                    "Advanced AI for professionals.",
                    "ذكاء اصطناعي متقدم للمحترفين."
                  )}
                </p>
                <div className="mb-8">
                  <span className="text-5xl font-black">
                    ${isYearly ? "19" : "24"}
                  </span>
                  <span className="text-on-surface-variant">
                    {pt("/mo", " /شهرياً")}
                  </span>
                </div>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3">
                    <Sparkles size={18} className="text-primary shrink-0" />
                    <span className="text-body-md font-bold">
                      {pt("Full AI Designer", "مصمم الذكاء الاصطناعي الكامل")}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("Custom Domains", "النطاقات المخصصة")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("Unlimited Pages", "صفحات غير محدودة")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("0% Transaction Fees", "رسوم معاملات 0%")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("SEO Optimization Tools", "أدوات تحسين محركات البحث SEO")}</span>
                  </li>
                </ul>
              </div>
              <Button variant="glow" href="/login" className="w-full">
                {pt("Start 14-Day Trial", "ابدأ تجربة 14 يوماً مجاناً")}
              </Button>
            </div>

            {/* Enterprise Plan */}
            <GlassCard className="p-8 rounded-3xl flex flex-col justify-between" hover>
              <div>
                <h3 className="text-headline-lg font-bold mb-2">
                  {pt("Enterprise", "المؤسسات")}
                </h3>
                <p className="text-on-surface-variant text-body-md mb-8">
                  {pt(
                    "Scale with power and security.",
                    "التوسع بقوة وأمان متناهيين."
                  )}
                </p>
                <div className="mb-8">
                  <span className="text-5xl font-black">
                    {pt("Custom", "مخصص")}
                  </span>
                </div>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("Dedicated Support", "دعم مخصص")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("SAML SSO & Security", "تسجيل الدخول الأحادي SAML SSO والأمان")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("White-label CMS", "نظام إدارة المحتوى ذو العلامة البيضاء")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-secondary shrink-0" />
                    <span className="text-body-md">{pt("Custom API Integration", "تكامل واجهة برمجة التطبيقات المخصصة")}</span>
                  </li>
                </ul>
              </div>
              <Button variant="outline" href="/login" className="w-full">
                {pt("Contact Sales", "اتصل بالمبيعات")}
              </Button>
            </GlassCard>
          </div>
        </Section>

        {/* Feature Comparison Table */}
        <Section className="px-margin-mobile md:px-margin-desktop py-24 max-w-container-max mx-auto overflow-hidden">
          <h2 className="text-headline-xl font-bold text-center mb-16">
            {pt("Compare Features", "قارن المميزات")}
          </h2>
          <div className="overflow-x-auto glass rounded-2xl border border-white/10">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="py-6 px-6 text-left rtl:text-right text-label-md text-on-surface-variant">
                    {pt("Feature", "الميزة")}
                  </th>
                  <th className="py-6 px-6 text-center text-label-md">
                    {pt("Free", "المجانية")}
                  </th>
                  <th className="py-6 px-6 text-center text-label-md text-primary font-bold">
                    {pt("Pro", "الاحترافية")}
                  </th>
                  <th className="py-6 px-6 text-center text-label-md">
                    {pt("Enterprise", "المؤسسات")}
                  </th>
                </tr>
              </thead>
              <tbody className="text-body-md text-on-surface-variant">
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-6 px-6 font-medium text-on-surface">
                    {pt("AI Credits /mo", "أرصدة الذكاء الاصطناعي /شهرياً")}
                  </td>
                  <td className="py-6 px-6 text-center">100</td>
                  <td className="py-6 px-6 text-center font-bold text-primary">
                    {pt("Unlimited", "غير محدودة")}
                  </td>
                  <td className="py-6 px-6 text-center font-bold text-on-surface">
                    {pt("Custom", "مخصص")}
                  </td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-6 px-6 font-medium text-on-surface">
                    {pt("Storage", "مساحة التخزين")}
                  </td>
                  <td className="py-6 px-6 text-center">1 GB</td>
                  <td className="py-6 px-6 text-center">50 GB</td>
                  <td className="py-6 px-6 text-center text-on-surface">
                    {pt("Unlimited", "غير محدودة")}
                  </td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-6 px-6 font-medium text-on-surface">
                    {pt("Bandwidth", "النطاق الترددي")}
                  </td>
                  <td className="py-6 px-6 text-center">5 GB</td>
                  <td className="py-6 px-6 text-center">
                    {pt("Unlimited", "غير محدودة")}
                  </td>
                  <td className="py-6 px-6 text-center text-on-surface">
                    {pt("Priority", "ذو أولوية")}
                  </td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-6 px-6 font-medium text-on-surface">
                    {pt("Analytics", "التحليلات")}
                  </td>
                  <td className="py-6 px-6 text-center">
                    {pt("Basic", "أساسية")}
                  </td>
                  <td className="py-6 px-6 text-center">
                    {pt("Advanced", "متقدمة")}
                  </td>
                  <td className="py-6 px-6 text-center text-on-surface">
                    {pt("Real-time", "في الوقت الحقيقي")}
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-6 px-6 font-medium text-on-surface">
                    {pt("Support", "الدعم الفني")}
                  </td>
                  <td className="py-6 px-6 text-center">
                    {pt("Community", "المجتمع")}
                  </td>
                  <td className="py-6 px-6 text-center">
                    {pt("Email 24/7", "البريد الإلكتروني 24/7")}
                  </td>
                  <td className="py-6 px-6 text-center text-on-surface">
                    {pt("Dedicated Agent", "مدير حساب مخصص")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* FAQs */}
        <Section className="px-margin-mobile md:px-margin-desktop py-24 bg-surface-container-lowest/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-headline-xl font-bold text-center mb-12">
              {pt("Frequently Asked Questions", "الأسئلة الشائعة")}
            </h2>
            <div className="space-y-4">
              {faqData.map((item, idx) => (
                <div
                  key={idx}
                  className="glass rounded-2xl overflow-hidden border border-white/10"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex items-center justify-between w-full p-6 text-left rtl:text-right"
                  >
                    <h4 className="text-body-lg font-bold text-on-surface">
                      {item.q}
                    </h4>
                    <ChevronDown
                      size={20}
                      className={`text-on-surface-variant transition-transform duration-300 ${
                        activeFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      activeFaq === idx ? "max-h-48 border-t border-white/5" : "max-h-0"
                    }`}
                  >
                    <p className="p-6 text-body-md text-on-surface-variant">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Final CTA */}
        <Section className="py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
            <div className="w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-headline-xl font-bold">
              {pt("Ready to build your future?", "جاهز لبناء مستقبلك؟")}
            </h2>
            <p className="text-body-lg text-on-surface-variant">
              {pt(
                "Start your 14-day free trial today. No credit card required.",
                "ابدأ تجربتك المجانية لمدة 14 يومًا اليوم. لا حاجة لبطاقة ائتمان."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button variant="glow" size="lg" href="/login" className="w-full sm:w-auto">
                {pt("Start Free Trial", "ابدأ التجربة المجانية")}
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {pt("Watch Demo", "شاهد العرض")}
              </Button>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return <PricingPageContent />;
}
