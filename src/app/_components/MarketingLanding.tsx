"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { landingContent } from "@/content/landing";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  Check,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  Play,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, ReactNode> = {
  Sparkles: <Sparkles className="h-5 w-5 text-sky-400 sm:h-6 sm:w-6" />,
  BarChart3: <BarChart3 className="h-5 w-5 text-indigo-400 sm:h-6 sm:w-6" />,
  Megaphone: <Megaphone className="h-5 w-5 text-fuchsia-400 sm:h-6 sm:w-6" />,
};

const easeOutCurve = [0.16, 1, 0.3, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutCurve },
  },
};

const heroColumnVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutCurve },
  },
};

const viewport = { once: true, amount: 0.25 } as const;

export function MarketingLanding() {
  const {
    hero,
    partners,
    benefits,
    process,
    pricing,
    testimonials,
    faqs,
    support,
  } = landingContent;

  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <motion.section
        id="hero"
        className="px-4 pt-16 scroll-mt-24 sm:px-6 md:scroll-mt-28 lg:px-8"
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 lg:flex-row">
          <motion.div
            className="flex w-full flex-1 flex-col items-start text-left"
            variants={heroColumnVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOutCurve, delay: 0.1 }}
            >
              {hero.eyebrow}
            </motion.span>
            <motion.h1
              className="text-foreground mt-4 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: easeOutCurve, delay: 0.18 }}
            >
              {hero.headline}
            </motion.h1>
            <motion.p
              className="text-muted-foreground mt-4 max-w-xl text-base sm:text-lg"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: easeOutCurve, delay: 0.26 }}
            >
              {hero.description}
            </motion.p>
            <motion.div
              className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOutCurve, delay: 0.34 }}
            >
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-slate-300 sm:w-auto"
                asChild
              >
                <Link href={hero.secondaryCta.href}>
                  {hero.secondaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.dl
              className="mt-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-3"
              initial="hidden"
              animate="visible"
            >
              {hero.metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.35, ease: easeOutCurve }}
            >
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {metric.label}
                  </dt>
                  <dd className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {metric.value}
                  </dd>
                  <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                    {metric.helper}
                  </p>
                </motion.div>
              ))}
            </motion.dl>
          </motion.div>
          <motion.div
            className="relative flex w-full max-w-xl justify-center lg:max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: easeOutCurve, delay: 0.3 }}
          >
            <motion.div
              className="relative aspect-[7/5] w-full overflow-hidden rounded-3xl border border-slate-200/60 bg-slate-900 shadow-2xl"
              whileHover={{ y: -6, boxShadow: "0 32px 60px rgba(15, 23, 42, 0.25)" }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
            >
              <Image
                src={hero.media.previewImage}
                alt="SnapRace mobile gallery preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
                priority
              />
              <div className="absolute inset-0 flex items-end justify-between p-4">
                <Button size="sm" variant="secondary" className="gap-2 bg-white/90 text-slate-900">
                  <Play className="h-4 w-4" /> Watch demo
                </Button>
                <span className="text-white/90 text-xs uppercase tracking-[0.24em]">
                  Live gallery
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="partners"
        className="px-4 scroll-mt-24 sm:px-6 md:scroll-mt-28 lg:px-8"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white/70 p-8 shadow-sm backdrop-blur">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            {partners.headline}
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {partners.logos.map((logo) => (
              <motion.div
                key={logo.name}
                className="flex h-16 items-center justify-center rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={160}
                  height={48}
                  className="object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="features"
        className="px-4 scroll-mt-24 sm:px-6 md:scroll-mt-28 lg:px-8"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutCurve }}
            viewport={viewport}
          >
            <h2 className="text-foreground text-3xl font-semibold sm:text-4xl">
              {benefits.headline}
            </h2>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg">
              Designed for mobile-first galleries so every athlete can relive the finish line instantly.
            </p>
            <Button className="mt-6" size="lg" asChild>
              <Link href={hero.primaryCta.href}>Create your first gallery</Link>
            </Button>
          </motion.div>
          <div className="grid grid-cols-1 gap-4">
            {benefits.items.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12, duration: 0.45, ease: easeOutCurve }}
                viewport={viewport}
              >
                <Card className="border-slate-200/70 bg-white/70 shadow-sm">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="rounded-full bg-slate-900/5 p-3">
                      {iconMap[item.icon]}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base text-slate-600">
                        {item.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="process"
        className="px-4 scroll-mt-24 sm:px-6 md:scroll-mt-28 lg:px-8"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200/70 bg-slate-950 text-slate-50">
          <div className="px-6 py-8 sm:px-12 sm:py-12">
            <h2 className="text-3xl font-semibold sm:text-4xl">{process.headline}</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
              Guided from upload to revenue with mobile-first flows and a UI your athletes already understand.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {process.steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="flex flex-col gap-4 rounded-2xl bg-slate-900/60 p-6"
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.12, duration: 0.45, ease: easeOutCurve }}
                  viewport={viewport}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Step {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold sm:text-xl">{step.title}</h3>
                  <p className="text-sm text-slate-300 sm:text-base">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="pricing"
        className="px-4 scroll-mt-24 sm:px-6 md:scroll-mt-28 lg:px-8"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <h2 className="text-foreground text-3xl font-semibold sm:text-4xl">
            {pricing.headline}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg">
            {pricing.subheadline}
          </p>
          <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pricing.plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12, duration: 0.45, ease: easeOutCurve }}
                viewport={viewport}
              >
                <Card
                  className={cn(
                    "flex h-full flex-col border-slate-200/70 bg-white/80 shadow-sm",
                    plan.highlighted && "border-primary shadow-lg"
                  )}
                >
                  <CardHeader className="items-start text-left">
                    <CardTitle className="text-2xl font-semibold">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-3 flex items-baseline gap-1 text-slate-900">
                      <span className="text-3xl font-bold sm:text-4xl">{plan.price}</span>
                      <span className="text-sm font-medium text-slate-500">
                        {plan.frequency}
                      </span>
                    </div>
                    <CardDescription className="mt-3 text-base text-slate-600">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="gap-3 space-y-3 text-left">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      asChild
                    >
                      <Link href={plan.cta.href}>{plan.cta.label}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="px-4 scroll-mt-24 sm:px-6 md:scroll-mt-28 lg:px-8"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-8 shadow-sm">
            <h2 className="text-foreground text-3xl font-semibold sm:text-4xl">
              {testimonials.headline}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6">
              {testimonials.items.map((testimonial) => (
                <motion.figure
                  key={testimonial.name}
                  className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: easeOutCurve }}
                  viewport={viewport}
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-slate-500">{testimonial.title}</p>
                    </div>
                  </div>
                  <blockquote className="text-muted-foreground mt-4 text-base leading-relaxed">
                    “{testimonial.quote}”
                  </blockquote>
                </motion.figure>
              ))}
            </div>
          </div>
          <motion.div
            className="rounded-3xl border border-slate-200/70 bg-slate-950 p-8 text-slate-50 shadow-lg"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutCurve }}
            viewport={viewport}
          >
            <h3 className="text-2xl font-semibold">What organizers notice in week one</h3>
            <p className="mt-4 text-sm text-slate-300 sm:text-base">
              SnapRace mirrors how runners actually engage—mobile-first, selfie-driven, and instantly shoppable—so your ops team can focus on the next race instead of inbox triage.
            </p>
            <ul className="mt-6 space-y-4 text-sm text-slate-200">
              <li className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-sky-400" />
                <span>Selfie search clears 99% of bib mismatches without staff review.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-fuchsia-400" />
                <span>Live results and insights keep finishers exploring longer, boosting sponsor impressions.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-amber-400" />
                <span>Promo placements drive measurable clicks into your next registration flow.</span>
              </li>
            </ul>
            <Button className="mt-8 w-full bg-white text-slate-900" asChild>
              <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="faq"
        className="px-4 scroll-mt-24 sm:px-6 md:scroll-mt-28 lg:px-8"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-semibold sm:text-4xl">
            {faqs.headline}
          </h2>
          <Accordion
            type="single"
            collapsible
            className="mt-8 divide-y rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm"
          >
            {faqs.items.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index + 1}`}>
                <AccordionTrigger className="text-base font-medium text-slate-900">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600 sm:text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.section>

      <motion.section
        id="cta"
        className="px-4 scroll-mt-24 sm:px-6 md:scroll-mt-28 lg:px-8"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200/70 bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 p-10 text-white shadow-lg">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold sm:text-4xl">{support.headline}</h2>
              <p className="mt-3 text-sm text-indigo-100 sm:text-base">{support.description}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="bg-white text-slate-900" asChild>
                  <Link href={support.primaryCta.href}>{support.primaryCta.label}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/60 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href={support.secondaryCta.href}>{support.secondaryCta.label}</Link>
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-4 text-sm">
              <Link
                href={support.assistance.chat.href}
                className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/20"
              >
                <MessageCircle className="h-5 w-5" />
                {support.assistance.chat.label}
              </Link>
              <Link
                href={support.assistance.email.href}
                className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/20"
              >
                <MessageSquareText className="h-5 w-5" />
                {support.assistance.email.label}
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
