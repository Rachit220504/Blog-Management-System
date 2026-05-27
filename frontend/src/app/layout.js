import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import SiteHeader from '../components/site-header';
import SiteFooter from '../components/site-footer';
import DevHydrationGate from '../components/dev-hydration-gate';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Atlas Blog',
    template: '%s | Atlas Blog',
  },
  description:
    'A production-ready blog platform with SEO-first architecture, structured data, and editorial workflows.',
  openGraph: {
    type: 'website',
    siteName: 'Atlas Blog',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className="min-h-full bg-[var(--background)] text-[var(--foreground)] antialiased"
        suppressHydrationWarning
      >
        <Script id="strip-extension-attrs" strategy="beforeInteractive">
          {`document.querySelectorAll('[bis_skin_checked]').forEach((node) => node.removeAttribute('bis_skin_checked'));`}
        </Script>
        <DevHydrationGate>
          <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_28%),linear-gradient(180deg,#07111f_0%,#0b1220_48%,#070b14_100%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="relative z-10 flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </div>
        </DevHydrationGate>
      </body>
    </html>
  );
}
