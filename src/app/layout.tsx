import {pageMetadata,siteUrl} from "@/lib/seo";
import "./globals.css";
import {InstallProvider} from "@/components/install-app";
import SiteNavigation from "@/components/site-navigation";

export const metadata={...pageMetadata('Home','Connect your next opportunity and everyday work with Aerotech. Explore jobs, manage your employee workspace, or bring your organisation’s HR records together.','/'),metadataBase:new URL(siteUrl),applicationName:'Aerotech',appleWebApp:{capable:true,statusBarStyle:'default',title:'Aerotech'},icons:{icon:'/app-icons/icon-192.png',apple:'/app-icons/apple-touch-icon.png'}};

export const viewport={themeColor:"#07152b",width:"device-width",initialScale:1};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body><noscript><p className="bg-amber-50 px-5 py-3 text-sm text-amber-950">Enable JavaScript to submit forms and use workspace tools. Contact support if a form cannot load.</p></noscript><a className="skip-link" href="#main-content">Skip to content</a><div id="main-content" tabIndex={-1}><InstallProvider><SiteNavigation>{children}</SiteNavigation></InstallProvider></div></body>
    </html>
  );
}
