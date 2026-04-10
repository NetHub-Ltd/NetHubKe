// import Link from "next/link";
// import {
//   Mail,
//   Phone,
//   MapPin,
//   Twitter,
//   Github,
//   Linkedin,
//   MessageSquare,
// } from "lucide-react";

// const Footer = () => {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="bg-card border-t border-border pt-20 pb-10">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
//           {/* Brand Column */}
//           <div className="space-y-6">
//             <Link
//               href="/"
//               className="text-2xl font-bold tracking-tighter text-brand-primary"
//             >
//               NetHub<span className="text-foreground">.co.ke</span>
//             </Link>
//             <p className="text-foreground/60 text-sm leading-relaxed">
//               Empowering Kenyan businesses with world-class M-Pesa integrations,
//               custom software, and digital growth strategies.
//             </p>
//             <div className="flex gap-4">
//               <Link
//                 href="#"
//                 className="p-2 bg-background border border-border rounded-lg hover:text-brand-primary transition-colors"
//               >
//                 <Twitter size={18} />
//               </Link>
//               <Link
//                 href="#"
//                 className="p-2 bg-background border border-border rounded-lg hover:text-brand-primary transition-colors"
//               >
//                 <Linkedin size={18} />
//               </Link>
//               <Link
//                 href="#"
//                 className="p-2 bg-background border border-border rounded-lg hover:text-brand-primary transition-colors"
//               >
//                 <Github size={18} />
//               </Link>
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">
//               Company
//             </h4>
//             <ul className="space-y-4 text-sm text-foreground/70">
//               <li>
//                 <Link
//                   href="/about"
//                   className="hover:text-brand-primary transition-colors"
//                 >
//                   About Us
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/services"
//                   className="hover:text-brand-primary transition-colors"
//                 >
//                   Our Services
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/contact"
//                   className="hover:text-brand-primary transition-colors"
//                 >
//                   Contact
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/privacy-policy"
//                   className="hover:text-brand-primary transition-colors"
//                 >
//                   Privacy Policy
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Services Quick Access */}
//           <div>
//             <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">
//               Solutions
//             </h4>
//             <ul className="space-y-4 text-sm text-foreground/70">
//               <li>
//                 <Link
//                   href="/service/mpesa-integration"
//                   className="hover:text-brand-primary transition-colors"
//                 >
//                   M-Pesa Integration
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/service/app-development"
//                   className="hover:text-brand-primary transition-colors"
//                 >
//                   Custom App Dev
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/service/seo-optimization"
//                   className="hover:text-brand-primary transition-colors"
//                 >
//                   SEO Services
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/service/digital-shelves"
//                   className="hover:text-brand-primary transition-colors"
//                 >
//                   Digital Shelves
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Contact Info */}
//           <div>
//             <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">
//               Get in Touch
//             </h4>
//             <div className="space-y-4 text-sm text-foreground/70">
//               <div className="flex items-center gap-3">
//                 <Mail size={16} className="text-brand-primary" />
//                 <span>support@nethub.co.ke</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Phone size={16} className="text-brand-primary" />
//                 <span>+254 83 202 527</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <MapPin size={16} className="text-brand-primary" />
//                 <span>Nairobi, Kenya</span>
//               </div>
//               <Link
//                 href="/contact"
//                 className="inline-flex items-center gap-2 mt-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-lg font-bold hover:bg-brand-primary hover:text-white transition-all"
//               >
//                 <MessageSquare size={16} /> Free Consultation
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div className="pt-10 border-t border-border flex flex-col md:row justify-between items-center gap-4 text-xs text-foreground/50">
//           <p>© {currentYear} NetHub Kenya. All rights reserved.</p>
//           <div className="flex gap-6">
//             <Link href="/terms-of-service" className="hover:underline">
//               Terms of Service
//             </Link>
//             {/* <Link href="#" className="hover:underline">
//               Cookie Policy
//             </Link> */}
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;


import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Github,
  Linkedin,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* 1. Brand Identity & Global Mission */}
          <div className="space-y-8">
            <Link
              href="/"
              className="text-2xl font-black tracking-tighter text-brand-primary flex items-center gap-1"
            >
              NetHub<span className="text-foreground">.co.ke</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Architecting resilient digital infrastructure for the East African
              enterprise. Specializing in high-throughput payment gateways and
              performance-engineered software.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Twitter size={18} />, href: "#" },
                { icon: <Linkedin size={18} />, href: "#" },
                { icon: <Github size={18} />, href: "#" },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center bg-background border border-border rounded-xl hover:border-brand-primary hover:text-brand-primary transition-all duration-300"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* 2. Company Hierarchy */}
          <div className="lg:pl-8">
            <h4 className="font-black mb-8 text-[10px] uppercase tracking-[0.2em] text-brand-secondary">
              Corporate
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              {[
                { name: "Our Expertise", href: "/about" },
                { name: "Service Catalog", href: "/services" },
                { name: "Project Intake", href: "/contact" },
                { name: "Privacy Policy", href: "/privacy-policy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-brand-primary flex items-center gap-2 group transition-colors"
                  >
                    {link.name}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Deep-Link Solutions (SEO Link Equity) */}
          <div>
            <h4 className="font-black mb-8 text-[10px] uppercase tracking-[0.2em] text-brand-secondary">
              Specialized Solutions
            </h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li>
                <Link
                  href="/service/mpesa-integration"
                  className="hover:text-brand-primary transition-colors"
                >
                  M-Pesa Daraja 3.0 API
                </Link>
              </li>
              <li>
                <Link
                  href="/service/app-development"
                  className="hover:text-brand-primary transition-colors"
                >
                  Next.js Cloud Systems
                </Link>
              </li>
              <li>
                <Link
                  href="/service/seo-optimization"
                  className="hover:text-brand-primary transition-colors"
                >
                  Technical SEO Audit
                </Link>
              </li>
              <li>
                <Link
                  href="/service/digital-shelves"
                  className="hover:text-brand-primary transition-colors"
                >
                  E-Commerce Middleware
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Support & Trust Anchor */}
          <div className="space-y-8">
            <div>
              <h4 className="font-black mb-8 text-[10px] uppercase tracking-[0.2em] text-brand-secondary">
                Direct Channel
              </h4>
              <div className="space-y-4 text-sm font-bold">
                <div className="flex items-center gap-3 text-foreground">
                  <Mail size={16} className="text-brand-primary" />
                  <span>support@nethub.co.ke</span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <Phone size={16} className="text-brand-primary" />
                  <span>+254 783 202 527</span>
                </div>
              </div>
            </div>

            <Link
              href="/contact"
              className="flex items-center justify-between w-full bg-foreground text-background px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary transition-all duration-300 group"
            >
              Start Consultation
              <MessageSquare
                size={16}
                className="group-hover:rotate-12 transition-transform"
              />
            </Link>
          </div>
        </div>

        {/* Bottom Bar: Metadata & Status */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            <p>© {currentYear} NetHub Kenya</p>
            <div className="hidden md:flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            <Link
              href="/terms-of-service"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy-policy"
              className="hover:text-foreground transition-colors"
            >
              Security
            </Link>
            <span className="hidden md:inline">Nairobi • 00100</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;