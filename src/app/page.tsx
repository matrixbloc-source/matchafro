import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Featured from "@/components/Featured";
import HowItWorks from "@/components/HowItWorks";
import LaunchOffer from "@/components/LaunchOffer";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Categories />
        <Featured />
        <HowItWorks />
        <LaunchOffer />
      </main>
      <Footer />
    </>
  );
}
