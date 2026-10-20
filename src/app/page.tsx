import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Stats } from "@/components/stats";
import { CtaV2 } from "@/components/v2/cta-v2";
import { FeaturesV2 } from "@/components/v2/features-v2";
import { PricingV2 } from "@/components/v2/pricing-v2";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <FeaturesV2 />
        <PricingV2 />
        <Faq />
        <CtaV2 />
      </main>
      <Footer />
    </>
  );
}
