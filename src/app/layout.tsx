import {pageMetadata,siteUrl} from "@/lib/seo";
import "./globals.css";
import SiteNavigation from "@/components/site-navigation";

export const metadata={...pageMetadata('Home','Connect your next opportunity and everyday work with Aerotech. Explore jobs, manage your employee workspace, or bring your organisation’s HR records together.','/'),metadataBase:new URL(siteUrl),icons:{icon:'/brand/aerotech-logo.webp',apple:'/brand/aerotech-logo.webp'}};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body><noscript><p className="bg-amber-50 px-5 py-3 text-sm text-amber-950">Enable JavaScript to submit forms and use workspace tools. Contact support if a form cannot load.</p></noscript><a className="skip-link" href="#main-content">Skip to content</a><div id="main-content" tabIndex={-1}><SiteNavigation>{children}</SiteNavigation></div></body>
    </html>
  );
}
