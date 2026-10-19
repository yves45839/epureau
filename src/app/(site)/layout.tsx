import ServiceQuestions from "@/components/ServiceQuestions";
import UiText from "@/components/UiText";
import LanguageSwitch from "@/components/LanguageSwitch";
import PreviewBanner from "@/components/PreviewBanner";
import Audience from "@/components/Audience";
import CookieBanner from "@/components/CookieBanner";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ToTop from "@/components/ToTop";
import BusinessSchema from "@/components/BusinessSchema";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#contenu">
        <UiText text="Aller au contenu" />
      </a>
      <LanguageSwitch /><PreviewBanner /><Nav />
      <main id="contenu">{children}<ServiceQuestions /></main>
      <Footer />
      <ToTop />
      <Reveal />
      <Audience />
      <CookieBanner />
      <BusinessSchema />
    </>
  );
}
