import { Detection } from "@/components/detection";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { FinalCta, Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { Pricing } from "@/components/pricing";
import { Stats } from "@/components/stats";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Detection />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
