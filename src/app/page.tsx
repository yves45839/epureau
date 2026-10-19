import LanguageSwitch from "@/components/LanguageSwitch";
import { pageValues, projectList, company, publishedDocuments, mediaList } from "@/lib/cms";
import {activeAnnouncements,homeVideo} from "@/content/home-highlights";
import PreviewBanner from "@/components/PreviewBanner";
import Audience from "@/components/Audience";
import CookieBanner from "@/components/CookieBanner";
import HomeLanding from "@/components/HomeLanding";
import Footer from "@/components/Footer";
import ToTop from "@/components/ToTop";
import BusinessSchema from "@/components/BusinessSchema";
import "./home.css";
import "../../public/maquette/carousels.css";

export default async function HomePage() {
  return (
    <>
      <LanguageSwitch /><PreviewBanner /><HomeLanding content={await pageValues("accueil")} realisations={await projectList()} societe={await company()} announcements={activeAnnouncements(await publishedDocuments("announcements"))} video={homeVideo(await mediaList())} />
      <Footer />
      <ToTop />
      <Audience />
      <CookieBanner />
      <BusinessSchema />
    </>
  );
}
