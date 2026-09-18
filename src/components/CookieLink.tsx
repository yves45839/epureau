"use client";

/** Rouvre le bandeau de consentement : le choix reste modifiable à tout moment. */
export default function CookieLink() {
  return <button type="button" className="footer-cookie" onClick={() => window.dispatchEvent(new Event("epureau-cookies"))}>Gérer les cookies</button>;
}
