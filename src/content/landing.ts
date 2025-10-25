export const landingContent = {
  meta: {
    title: "SnapRace | Mobile-first race galleries for modern organizers",
    description:
      "SnapRace gives race directors selfie-powered photo search, integrated results, and next-event marketing in a single, mobile-first gallery experience.",
    ogImage: "/images/og-landing.png",
  },
  hero: {
    eyebrow: "For race directors & ops teams",
    headline: "Selfie detection that ends ‘Where are my photos?’",
    description:
      "SnapRace auto-matches bibs and selfies the moment files hit the uploader, serving branded galleries, live results, and next-race promos before athletes reach their cars.",
    primaryCta: { label: "See selfie search live", href: "#cta" },
    secondaryCta: { label: "Browse sample gallery", href: "/events" },
    metrics: [
      {
        label: "Selfie matches",
        value: "99%",
        helper: "average ID accuracy across events",
      },
      { label: "Photo delivery", value: "<10m", helper: "from upload to runner inbox" },
      { label: "Support tickets", value: "-62%", helper: "reduction after launch" },
    ],
    media: {
      type: "video",
      previewImage: "/images/marketing/hero-preview.svg",
      src: "https://player.vimeo.com/video/916734927?h=0f4c",
    },
  },
  partners: {
    headline: "Trusted by timing leaders and endurance brands",
    logos: [
      {
        name: "Millennium Running",
        src: "/images/partners/partner-millenniumrunning.png",
      },
      { name: "AutoFair Racing", src: "/images/partners/partner-autofair.png" },
      { name: "Summit Timing", src: "/images/marketing/partner-summit.svg" },
      { name: "Pulse Events", src: "/images/marketing/partner-pulse.svg" },
      { name: "RaceDay Tech", src: "/images/marketing/partner-raceday.svg" },
    ],
  },
  benefits: {
    headline: "One platform for finish-line delight and next-race demand",
    items: [
      {
        title: "Selfie search that just works",
        description:
          "Pair selfie detection with bib OCR to surface every finisher’s photos instantly—no more manual review queues or frustrated emails.",
        icon: "Sparkles",
      },
      {
        title: "Results & insights in one tap",
        description:
          "Stream real-time results, pacing charts, and participant benchmarks so athletes see their data and feel the hype right inside the gallery.",
        icon: "BarChart3",
      },
      {
        title: "Promote the next starting line",
        description:
          "Activate in-gallery promos, sponsor placements, and social sharing nudges that convert finish-line emotion into registrations for your next event.",
        icon: "Megaphone",
      },
    ],
  },
  process: {
    headline: "How SnapRace fits inside your race-week workflow",
    steps: [
      {
        title: "Connect photos & results",
        description:
          "Import from your photographers, S3, or FTP and sync with registration + timing feeds in a couple of clicks.",
      },
      {
        title: "Auto-match & approve",
        description:
          "Our selfie + bib engine handles the heavy lifting while you review edge cases and apply sponsor overlays.",
      },
      {
        title: "Publish, share, promote",
        description:
          "Trigger SMS/email notifications, drop QR codes on course, and let marketing modules upsell your next event.",
      },
    ],
  },
  pricing: {
    headline:
      "Pricing that beats legacy hosting on value—not on price per click",
    subheadline:
      "RaceResult charges ~$0.10 per participant just to host results. SnapRace adds selfie search, results, analytics, and next-event marketing in one predictable package.",
    plans: [
      {
        name: "Basic",
        price: "$0.12",
        frequency: "per registrant",
        description:
          "Modern photo gallery with selfie detection for single events or pop-up races.",
        features: [
          "Branded, mobile-first event gallery",
          "Bib + selfie recognition with manual overrides",
          "Unlimited HD downloads & social sharing",
          "Sponsor overlays and watermark controls",
        ],
        cta: { label: "Talk to sales", href: "mailto:sales@snap-race.com" },
      },
      {
        name: "Plus",
        price: "$0.18",
        frequency: "per registrant",
        description:
          "Everything in Basic plus data storytelling for athletes and partners.",
        features: [
          "All Basic features",
          "Live results + pace & effort analytics",
          "Participant + aggregate dashboards",
          "CRM exports & marketing audience tags",
          "Priority success manager",
        ],
        highlighted: true,
        cta: {
          label: "Schedule strategy call",
          href: "https://cal.com/snaprace/demo",
        },
      },
      {
        name: "Enterprise",
        price: "Custom",
        frequency: "annual",
        description:
          "For series operators or agencies managing multi-race calendars.",
        features: [
          "All Plus features",
          "In-gallery promo inventory for upcoming races",
          "Personalized next-event recommendations",
          "Series & sponsor impact analytics",
          "Dedicated integrations team + SLA",
        ],
        cta: {
          label: "Request proposal",
          href: "mailto:partnerships@snap-race.com",
        },
      },
    ],
  },
  testimonials: {
    headline: "Loved by timing directors and operations leads",
    items: [
      {
        quote:
          "We shipped 70k photos in under an hour and support tickets nearly vanished. Runners kept sharing because the selfie search nailed their shots.",
        name: "Lena Ortiz",
        title: "Operations Director, Granite Run Series",
        avatar: "/images/marketing/testimonial-sonia.svg",
      },
      {
        quote:
          "The built-in cross-promo blocks did more for our next race than weeks of email. SnapRace finally made photos and marketing one workflow.",
        name: "Matt Cho",
        title: "CEO, Pulse Timing",
        avatar: "/images/marketing/testimonial-jordan.svg",
      },
    ],
  },
  faqs: {
    headline: "Frequently asked questions",
    items: [
      {
        question: "How does pricing compare to legacy results hosting?",
        answer:
          "Legacy providers typically charge around $0.10 per participant just for static results pages. SnapRace bundles selfie photo discovery, live results, analytics, and promo tools starting at $0.12 per registrant—so you gain more value without bolting multiple systems together.",
      },
      {
        question: "Do athletes have to download an app?",
        answer:
          "No apps, no logins. Galleries are responsive by default, so runners land on their photos and data in the browser they already have open at the finish line.",
      },
      {
        question: "Can we bring our own sponsors and overlays?",
        answer:
          "Yes. Upload static or dynamic overlays, set impression quotas, and monitor sponsor engagement alongside participant analytics.",
      },
      {
        question: "What integrations are available?",
        answer:
          "We integrate with RunSignup, Race Roster, EnMotive, RaceResult, and common DAM/timing feeds. Custom S3/FTP pipelines are included, and our enterprise tier supports direct API integrations.",
      },
    ],
  },
  support: {
    headline: "Ready to modernize your finish-line experience?",
    description:
      "Book a walkthrough and we’ll map SnapRace to your current timing, media, and sponsor stack—then show you how to launch your next gallery in under a day.",
    primaryCta: {
      label: "Book 30-min demo",
      href: "https://cal.com/snaprace/demo",
    },
    secondaryCta: {
      label: "Email our team",
      href: "mailto:hello@snap-race.com",
    },
    assistance: {
      chat: { label: "Chat with us", href: "https://cal.com/snaprace/demo" },
      email: { label: "Email support", href: "mailto:support@snap-race.com" },
    },
  },
  footer: {
    company: {
      headline: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
    product: {
      headline: "Product",
      links: [
        { label: "Platform overview", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Partners", href: "#partners" },
      ],
    },
    resources: {
      headline: "Resources",
      links: [
        { label: "Help center", href: "mailto:support@snap-race.com" },
        { label: "Implementation guide", href: "#process" },
        { label: "Security", href: "#" },
      ],
    },
  },
};

export type LandingContent = typeof landingContent;
