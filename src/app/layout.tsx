import TrafficAnalytics from "@/components/traffic-analytics";
import {pageMetadata,siteUrl} from "@/lib/seo";
import "./globals.css";
import {InstallProvider} from "@/components/install-app";

export const metadata={...pageMetadata('Home','Aerotech HR helps businesses manage recruitment, employee onboarding, attendance, leave, payroll, performance and everyday workforce operations in one platform.','/'),metadataBase:new URL(siteUrl),applicationName:'Aerotech HR',appleWebApp:{capable:true,statusBarStyle:'default',title:'Aerotech HR'},icons:{icon:'/app-icons/icon-192.png',apple:'/app-icons/apple-touch-icon.png'}};

export const viewport={themeColor:"#07152b",width:"device-width",initialScale:1};

const organizationSchema={
  '@context':'https://schema.org',
  '@type':'Organization',
  name:'Aerotech HR',
  url:siteUrl,
  logo:new URL('/brand/aerotech-logo.webp',siteUrl).href,
  email:'support@aerotech.app',
  description:'Recruitment and human resources management software for employers, employees and job applicants.'
};
const websiteSchema={
  '@context':'https://schema.org',
  '@type':'WebSite',
  name:'Aerotech HR',
  url:siteUrl,
  inLanguage:'en',
  publisher:{'@type':'Organization',name:'Aerotech HR',url:siteUrl}
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([organizationSchema,websiteSchema]).replace(/</g,'\\u003c')}} /><noscript><p className="bg-amber-50 px-5 py-3 text-sm text-amber-950">Enable JavaScript to submit forms and use workspace tools. Contact support if a form cannot load.</p></noscript><a className="skip-link" href="#main-content">Skip to content</a><div id="main-content" tabIndex={-1}><InstallProvider>{children}</InstallProvider></div><TrafficAnalytics /></body>
    </html>
  );
}
