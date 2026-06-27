"use client";

import React, { useState } from "react";
import { Sparkles, Search, Heart, ArrowRight, Play } from "lucide-react";
import { LanguageProvider, useLanguage } from "../../components/LanguageContext";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { Button, GlassCard, Section } from "../../components/ui";
import { AmbientShader } from "../../components/AmbientShader";

function TemplatesPageContent() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const pt = (en: string, ar: string) => (language === "ar" ? ar : en);

  const categories = [
    { id: "All", label: pt("All", "الكل") },
    { id: "Business", label: pt("Business", "الأعمال") },
    { id: "Restaurant", label: pt("Restaurant", "المطاعم") },
    { id: "Portfolio", label: pt("Portfolio", "معرض الأعمال") },
    { id: "Agency", label: pt("Agency", "الوكالات") },
    { id: "Medical", label: pt("Medical", "الطب") },
    { id: "Education", label: pt("Education", "التعليم") },
    { id: "E-commerce", label: pt("E-commerce", "التجارة الإلكترونية") },
  ];

  const templatesList = [
    {
      id: "obsidian-noir",
      title: pt("Obsidian Noir", "أوبسيديان نوار"),
      category: "Portfolio",
      categoryLabel: pt("Portfolio", "معرض الأعمال"),
      desc: pt(
        "A stark, brutalist aesthetic for creative directors and visionary architects.",
        "جمالية بروتالية صارخة للمخرجين الإبداعيين والمهندسين المعماريين الطموحين."
      ),
      img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "verdant-bistro",
      title: pt("Verdant Bistro", "فيردانت بيسترو"),
      category: "Restaurant",
      categoryLabel: pt("Restaurant", "المطاعم"),
      desc: pt(
        "Elevated dining experiences with integrated reservation logic and organic visuals.",
        "تجارب تناول طعام راقية مع منطق حجز متكامل ومرئيات طبيعية."
      ),
      img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "nexus-care",
      title: pt("Nexus Care", "نيكسس كير"),
      category: "Medical",
      categoryLabel: pt("Medical", "الطب"),
      desc: pt(
        "Trustworthy and precise interface for clinics, biotech startups, and health platforms.",
        "واجهة موثوقة ودقيقة للعيادات والشركات الناشئة في مجال التكنولوجيا الحيوية والمنصات الصحية."
      ),
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "vanguard-collective",
      title: pt("Vanguard Collective", "فانغارد كوليكتيف"),
      category: "Agency",
      categoryLabel: pt("Agency", "الوكالات"),
      desc: pt(
        "High-impact storytelling for digital studios and disruptive marketing agencies.",
        "سرد قصصي عالي التأثير للاستوديوهات الرقمية ووكالات التسويق المبتكرة."
      ),
      img: "https://images.unsplash.com/photo-1542744173-8e0ee26df799?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "lumina-shop",
      title: pt("Lumina Shop", "لومينا شوب"),
      category: "E-commerce",
      categoryLabel: pt("E-commerce", "التجارة الإلكترونية"),
      desc: pt(
        "Seamless shopping experience for premium brands with integrated cart logic.",
        "تجربة تسوق سلسة للعلامات التجارية الراقية مع منطق سلة التسوق المتكامل."
      ),
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "cypher-academy",
      title: pt("Cypher Academy", "سايفر أكاديمي"),
      category: "Education",
      categoryLabel: pt("Education", "التعليم"),
      desc: pt(
        "Future-focused learning management system for tech and design courses.",
        "نظام إدارة تعلم يركز على المستقبل لدورات التكنولوجيا والتصميم."
      ),
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const filteredTemplates = templatesList.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <AmbientShader type="blobs" />
      </div>

      <Navbar />

      <main className="pt-24 min-h-screen z-10">
        {/* Hero */}
        <Section className="relative py-16 text-center max-w-container-max mx-auto overflow-hidden">
          <div className="space-y-6 max-w-3xl mx-auto px-margin-mobile">
            <h1 className="font-rubik text-5xl md:text-display-lg leading-tight font-extrabold tracking-tight">
              {pt("Your Vision, ", "رؤيتك، ")}
              <span className="text-primary italic">{pt("Automated", "مؤتمتة")}</span>.
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              {pt(
                "Browse our curated gallery of high-fidelity, AI-ready templates designed for modern creators and visionary brands.",
                "تصفح معرضنا المنسق من القوالب عالية الدقة والجاهزة للذكاء الاصطناعي والمصممة للمبدعين العصريين والعلامات التجارية الطموحة."
              )}
            </p>

            {/* AI Generator Input Bar */}
            <div className="pt-8">
              <div className="bg-surface-container-high/50 p-2 rounded-full border border-white/10 flex items-center shadow-2xl max-w-2xl mx-auto">
                <Sparkles className="mx-4 text-on-surface-variant shrink-0" size={20} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 flex-grow text-on-surface placeholder:text-on-surface-variant/50 text-body-md py-3 outline-none"
                  placeholder={pt(
                    "I need a minimalist portfolio for a Japanese architect...",
                    "أحتاج إلى معرض أعمال بسيط لمهندس معماري ياباني..."
                  )}
                />
                <button className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-bold hover:brightness-110 transition-all shadow-lg shadow-secondary/20 shrink-0">
                  {pt("Search", "بحث")}
                </button>
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary/20 border border-primary/40 text-primary"
                      : "bg-surface-container border border-white/5 text-on-surface-variant hover:border-primary/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Templates Grid */}
        <Section className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((temp) => (
              <div key={temp.id} className="glass rounded-2xl overflow-hidden group border border-white/10 hover:border-primary/30 transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-low">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={temp.img}
                    alt={temp.title}
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                    <Button variant="glow" href={`/editor?template=${temp.id}`} className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      {pt("Use Template", "استخدم القالب")}
                    </Button>
                    <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
                      {pt("Preview", "عرض معاينة")}
                    </button>
                    <button
                      onClick={() => toggleFavorite(temp.id)}
                      className={`absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 transition ${
                        favorites[temp.id] ? "text-error" : "text-white"
                      }`}
                    >
                      <Heart size={20} fill={favorites[temp.id] ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
                      {temp.title}
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-surface-container text-[10px] font-bold tracking-widest uppercase border border-white/5">
                      {temp.categoryLabel}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-sm line-clamp-2">
                    {temp.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* View More Button */}
          <div className="mt-16 flex justify-center">
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-label-md group">
              {pt("View More Templates", "عرض المزيد من القوالب")}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
            </button>
          </div>
        </Section>

        {/* AI bespoke generation Call To Action */}
        <Section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="glass rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            <h2 className="text-headline-xl md:text-display-lg font-bold mb-6 text-on-surface">
              {pt("Can't find the perfect fit?", "لا تجد التصميم المناسب تماماً؟")}
            </h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              {pt(
                "Let Qevora AI generate a bespoke template based on your specific requirements in seconds.",
                "دع Qevora AI يولد قالباً مخصصاً لك بناءً على متطلباتك المحددة في ثوانٍ معدودة."
              )}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="glow" size="lg" href="/editor" className="px-10 py-4">
                {pt("Generate with AI", "توليد بالذكاء الاصطناعي")}
              </Button>
              <Button variant="outline" size="lg" className="px-10 py-4">
                {pt("Talk to Sales", "اتصل بالمبيعات")}
              </Button>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

export default function TemplatesPage() {
  return <TemplatesPageContent />;
}
