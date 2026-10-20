import { Faq } from "./faq";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Nav } from "./nav";
import { Stats } from "./stats";
import { CtaV2 } from "./v2/cta-v2";
import { FeaturesV2 } from "./v2/features-v2";
import { PricingV2 } from "./v2/pricing-v2";

/** The landing page, shared by "/" and the CMS preview. */
export function HomePage() {
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
