import {
  Search,
  Camera,
  Zap,
  Shield,
  Download,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      title: "Enter Your Bib Number",
      description:
        "Simply type your race bib number in our search box. Our AI-powered system will instantly scan through thousands of race photos.",
      icon: <Search className="text-primary h-8 w-8" />,
      details: [
        "Lightning-fast search across all race events",
        "Advanced image recognition technology",
        "Works with any bib number format",
      ],
    },
    {
      number: "02",
      title: "AI Finds Your Photos",
      description:
        "Our advanced computer vision technology automatically detects and matches your bib number in photos from the race.",
      icon: <Camera className="text-primary h-8 w-8" />,
      details: [
        "99.9% accuracy in bib detection",
        "Processes thousands of photos per minute",
        "Handles various lighting and angle conditions",
      ],
    },
    {
      number: "03",
      title: "Download & Share",
      description:
        "Browse your personalized photo gallery, download high-resolution images, and share your best moments on social media.",
      icon: <Download className="text-primary h-8 w-8" />,
      details: [
        "High-quality image downloads",
        "One-click social media sharing",
        "Organized by race location and time",
      ],
    },
  ];

  const features = [
    {
      icon: <Zap className="text-primary h-6 w-6" />,
      title: "Lightning Fast",
      description:
        "Get your results in seconds, not minutes. Our optimized system is built for speed.",
    },
    {
      icon: <Shield className="text-primary h-6 w-6" />,
      title: "Privacy Protected",
      description:
        "Your photos are only visible to you. We prioritize your privacy and data security.",
    },
    {
      icon: <Users className="text-primary h-6 w-6" />,
      title: "Race Partner Network",
      description:
        "Working with top race organizers to ensure comprehensive photo coverage.",
    },
    {
      icon: <Clock className="text-primary h-6 w-6" />,
      title: "24/7 Availability",
      description:
        "Access your race photos anytime, anywhere. Our service never sleeps.",
    },
  ];

  const faqs = [
    // {
    //   question: "How quickly are photos available after a race?",
    //   answer:
    //     "Photos are typically processed and available within 2-4 hours after the race concludes. Our AI works around the clock to get you your memories as fast as possible.",
    // },
    // {
    //   question: "What if I can't remember my bib number?",
    //   answer:
    //     "No problem! You can browse all race photos or contact the race organizer. Many races also provide bib number lookup tools on their websites.",
    // },
    // {
    //   question: "Are the photos high resolution?",
    //   answer:
    //     "Yes! All photos are available in their original high resolution for download. Perfect for printing, social media, or keeping as digital memories.",
    // },
    {
      question: "Can I share photos with family and friends?",
      answer:
        "Absolutely! Use our built-in sharing tools to post directly to social media or send private links to family and friends.",
    },
    // {
    //   question: "What races are covered by SnapRace?",
    //   answer:
    //     "We partner with race organizers across the US. Check our races page to see current events, and suggest your favorite race to be added to our network.",
    // },
    {
      question: "Is there a cost to download my photos?",
      answer:
        "Basic photo viewing and sharing is free. Some premium features and high-resolution downloads may require a small fee, which goes directly to supporting the photographers.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="from-background via-background to-muted/20 bg-gradient-to-br px-4 py-16 sm:py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="bg-primary/10 ring-primary/5 flex h-16 w-16 items-center justify-center rounded-full ring-8">
              <Camera className="text-primary h-8 w-8" />
            </div>
          </div>

          <h1 className="text-foreground mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            How SnapRace Works
          </h1>

          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
            From finish line to photo album in three simple steps. Powered by
            cutting-edge AI and a passion for capturing your race memories.
          </p>

          {/* <Badge variant="secondary" className="mb-8">
            Trusted by 50,000+ runners nationwide
          </Badge> */}
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="px-4 py-16 sm:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`grid items-center gap-12 lg:grid-cols-2 ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
              >
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="mb-6 flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
                      {step.number}
                    </div>
                    <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                      {step.icon}
                    </div>
                  </div>

                  <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight">
                    {step.title}
                  </h2>

                  <p className="text-muted-foreground mb-6 text-lg">
                    {step.description}
                  </p>

                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li
                        key={idx}
                        className="text-muted-foreground flex items-center text-sm"
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`relative ${index % 2 === 1 ? "lg:col-start-1" : ""}`}
                >
                  <Card className="overflow-hidden shadow-lg">
                    <CardContent className="p-0">
                      <div className="from-primary/5 to-primary/20 flex aspect-[4/3] items-center justify-center bg-gradient-to-br">
                        <div className="text-center">
                          <div className="mb-4 flex justify-center">
                            <div className="bg-background flex h-20 w-20 items-center justify-center rounded-full shadow-lg">
                              {step.icon}
                            </div>
                          </div>
                          <h3 className="text-foreground text-lg font-semibold">
                            Step {step.number}
                          </h3>
                          <p className="text-muted-foreground max-w-xs text-sm">
                            {step.title}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="bg-muted/30 px-4 py-16 sm:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Runners Love SnapRace
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Built by runners, for runners. Every feature designed with your race day experience in mind.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="px-4 py-16 sm:py-24">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              {`Got questions? We've got answers. Here are the most common
              questions from our running community.`}
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-foreground mb-3 text-lg font-semibold">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground px-4 py-16">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            Ready to Find Your Photos?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of runners who never miss a race memory with
            SnapRace.
          </p>
          <Link href="/">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-8 text-lg font-medium"
            >
              <Search className="mr-2 h-5 w-5" />
              Start Searching Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
