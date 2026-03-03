import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Github,
  Linkedin,
  MessageSquare,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tighter text-brand-primary"
            >
              NetHub<span className="text-foreground">.co.ke</span>
            </Link>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Empowering Kenyan businesses with world-class M-Pesa integrations,
              custom software, and digital growth strategies.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="p-2 bg-background border border-border rounded-lg hover:text-brand-primary transition-colors"
              >
                <Twitter size={18} />
              </Link>
              <Link
                href="#"
                className="p-2 bg-background border border-border rounded-lg hover:text-brand-primary transition-colors"
              >
                <Linkedin size={18} />
              </Link>
              <Link
                href="#"
                className="p-2 bg-background border border-border rounded-lg hover:text-brand-primary transition-colors"
              >
                <Github size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">
              Company
            </h4>
            <ul className="space-y-4 text-sm text-foreground/70">
              <li>
                <Link
                  href="/about"
                  className="hover:text-brand-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-brand-primary transition-colors"
                >
                  Our Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-brand-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-brand-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Quick Access */}
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">
              Solutions
            </h4>
            <ul className="space-y-4 text-sm text-foreground/70">
              <li>
                <Link
                  href="/service/mpesa-integration"
                  className="hover:text-brand-primary transition-colors"
                >
                  M-Pesa Integration
                </Link>
              </li>
              <li>
                <Link
                  href="/service/app-development"
                  className="hover:text-brand-primary transition-colors"
                >
                  Custom App Dev
                </Link>
              </li>
              <li>
                <Link
                  href="/service/seo-optimization"
                  className="hover:text-brand-primary transition-colors"
                >
                  SEO Services
                </Link>
              </li>
              <li>
                <Link
                  href="/service/digital-shelves"
                  className="hover:text-brand-primary transition-colors"
                >
                  Digital Shelves
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">
              Get in Touch
            </h4>
            <div className="space-y-4 text-sm text-foreground/70">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-brand-primary" />
                <span>support@nethub.co.ke</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-brand-primary" />
                <span>+254 83 202 527</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-brand-primary" />
                <span>Nairobi, Kenya</span>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-lg font-bold hover:bg-brand-primary hover:text-white transition-all"
              >
                <MessageSquare size={16} /> Free Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border flex flex-col md:row justify-between items-center gap-4 text-xs text-foreground/50">
          <p>© {currentYear} NetHub Kenya. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms-of-service" className="hover:underline">
              Terms of Service
            </Link>
            {/* <Link href="#" className="hover:underline">
              Cookie Policy
            </Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
