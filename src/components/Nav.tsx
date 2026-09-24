"use client";

import UiText, {useUi} from "./UiText";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import { navigation } from "@/content/site";

export default function Nav() {
  const pathname = usePathname();
  return <NavigationContent key={pathname} pathname={pathname} />;
}

function NavigationContent({ pathname }: { pathname: string }) {
  const ui=useUi();
  const [scrolled, setScrolled] = useState(false);
  const [progres, setProgres] = useState(0);
  const [menuMobile, setMenuMobile] = useState(false);
  const [ouvert, setOuvert] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 60);
      setProgres(h > 0 ? y / h : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  useEffect(() => {
    document.body.style.overflow = menuMobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuMobile]);

  const actif = (href: string) => {
    const base = href.split("#")[0];
    return base !== "/" && pathname.replace(/^\/(?:en|fr)(?=\/|$)/, "").startsWith(base);
  };

  return (
    <>
      <header className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
        <div className="wrap">
          <div className="nav-bar">
            <Link className="logo" href="/" aria-label={ui("EPUREAU Côte d’Ivoire — accueil")}>
              <Image
                src="/images/logo.png"
                alt="EPUREAU Côte d’Ivoire"
                width={560}
                height={162}
                priority
              />
            </Link>

            <ul className="menu">
              {navigation.map((item) => (
                <li
                  key={item.label}
                  className={`${item.sous ? "has-sub" : ""}${ouvert === item.label ? " open" : ""}`}
                >
                  {item.sous ? (
                    <a
                      href={item.href}
                      className={actif(item.href) ? "on" : ""}
                      aria-expanded={ouvert === item.label}
                      onClick={(e) => {
                        if (window.matchMedia("(hover: none)").matches) {
                          e.preventDefault();
                          setOuvert(ouvert === item.label ? null : item.label);
                        }
                      }}
                    >
                      <UiText text={item.label} />
                      <Icon name="chev" />
                    </a>
                  ) : (
                    <Link href={item.href} className={actif(item.href) ? "on" : ""}>
                      <UiText text={item.label} />
                    </Link>
                  )}
                  {item.sous && (
                    <div className="sub">
                      {item.sous.map((s) => (
                        <Link key={s.href} href={s.href}>
                          <b><UiText text={s.label} /></b>
                          <span><UiText text={s.desc} /></span>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <Link className="btn btn-primary btn-sm" href="/contact"><UiText text={" Demander une cotation "} /><Icon name="arrow" />
            </Link>

            <button
              type="button"
              className="burger"
              aria-label={ui(menuMobile?"Fermer le menu":"Ouvrir le menu")}
              aria-expanded={menuMobile}
              onClick={() => setMenuMobile((v) => !v)}
            >
              <Icon name={menuMobile ? "x" : "menu"} />
            </button>
          </div>
        </div>
        <div className="progress" aria-hidden="true">
          <i style={{ transform: `scaleX(${progres})` }} />
        </div>
      </header>

      <div className={`mnav${menuMobile ? " open" : ""}`}>
        <ul>
          {navigation.map((item, i) => (
            <li key={item.label} style={{ ["--i" as string]: i }}>
              <Link href={item.href} onClick={() => setMenuMobile(false)}>
                <UiText text={item.label} />
              </Link>
            </li>
          ))}
          <li style={{ ["--i" as string]: navigation.length }}>
            <Link href="/contact" onClick={() => setMenuMobile(false)}><UiText text={" Demander une cotation "} /></Link>
          </li>
        </ul>
      </div>
    </>
  );
}
