// export default function PrivacyPolicy() {
//   return (
//     <article className="max-w-4xl mx-auto px-6 py-20 prose prose-slate dark:prose-invert">
//       <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
//       <p className="text-sm opacity-60 mb-10">Last Updated: March 2026</p>

//       <section className="mb-8">
//         <h2 className="text-2xl font-bold mb-4">1. Data Collection</h2>
//         <p>
//           NetHub collects information necessary to provide our digital services,
//           including:
//         </p>
//         <ul className="list-disc pl-6 space-y-2">
//           <li>
//             <strong>Contact Information:</strong> Name, email, and phone number
//             provided via our contact forms.
//           </li>
//           <li>
//             <strong>M-Pesa Data:</strong> For clients using our integration
//             services, we process transaction metadata (Receipt numbers, amounts)
//             via the Daraja API.{" "}
//             <strong>
//               We do not store full customer PINs or private credentials.
//             </strong>
//           </li>
//         </ul>
//       </section>

//       <section className="mb-8">
//         <h2 className="text-2xl font-bold mb-4">
//           2. Compliance with Kenyan Law
//         </h2>
//         <p>
//           In accordance with the{" "}
//           <strong>Kenya Data Protection Act (2019)</strong>, we ensure that all
//           personal data is processed lawfully, minimized to what is necessary,
//           and protected against unauthorized access.
//         </p>
//       </section>

//       <section className="mb-8">
//         <h2 className="text-2xl font-bold mb-4">3. Data Sharing</h2>
//         <p>
//           We do not sell your data. Data is only shared with third-party
//           providers (like Safaricom for M-Pesa or AWS for hosting) to the extent
//           necessary to fulfill our service obligations.
//         </p>
//       </section>
//     </article>
//   );
// }



export default function PrivacyPolicy() {
  return (
    <div className="bg-background min-h-screen">
      <article className="max-w-4xl mx-auto px-6 py-24 prose prose-slate dark:prose-invert prose-headings:tracking-tight prose-a:text-brand-primary">
        {/* Header Section */}
        <header className="not-prose mb-16 border-b border-border pb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-6 bg-brand-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
              Legal Framework
            </span>
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter">
            Privacy Policy
          </h1>
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <p>Last Updated: March 2026</p>
            <span className="h-1 w-1 bg-border rounded-full" />
            <p>Version 2.1 (GDPR & KDPA Compliant)</p>
          </div>
        </header>

        {/* Section 1: Philosophy */}
        <section>
          <p className="lead text-xl text-muted-foreground">
            At NetHub, we treat data security as a core engineering requirement,
            not an afterthought. This policy outlines how we handle data within
            the Kenyan digital ecosystem.
          </p>
        </section>

        {/* Section 2: Data Collection */}
        <section>
          <h2 className="text-2xl font-bold">
            1. Data Collection & Processing
          </h2>
          <p>
            NetHub collects information necessary to provide enterprise-grade
            digital services, categorized under the following scopes:
          </p>
          <ul>
            <li>
              <strong>Identity Data:</strong> Name, professional email, and
              phone numbers voluntarily provided via our intake forms for
              consultation purposes.
            </li>
            <li>
              <strong>M-Pesa Transaction Metadata:</strong> For clients
              utilizing our Daraja API integrations, we process transaction IDs,
              amounts, and timestamps.
              <strong>
                {" "}
                We never see, store, or transmit customer PINs or private
                credentials.
              </strong>
            </li>
            <li>
              <strong>Technical Logs:</strong> IP addresses and browser types
              collected for security monitoring and prevention of DDoS attacks
              on our infrastructure.
            </li>
          </ul>
        </section>

        {/* Section 3: Legal Compliance */}
        <section className="bg-brand-primary/5 p-8 rounded-3xl border border-brand-primary/10 not-prose my-12">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            Compliance with Kenyan Law
          </h2>
          <p className="text-muted-foreground leading-relaxed italic">
            "In strict accordance with the{" "}
            <strong>Kenya Data Protection Act (2019)</strong>, NetHub acts as
            both a Data Controller (for our direct clients) and a Data Processor
            (for M-Pesa integrations). We ensure all processing is localized
            where required and protected by enterprise-grade encryption."
          </p>
        </section>

        {/* Section 4: Data Retention */}
        <section>
          <h2 className="text-2xl font-bold">2. Data Sharing & Retention</h2>
          <p>
            We do not monetize or sell user data. Sharing occurs only within
            these strict technical parameters:
          </p>
          <ul>
            <li>
              <strong>Service Providers:</strong> Secure transmission to
              Safaricom PLC (for M-Pesa processing) and AWS/Vercel (for cloud
              hosting).
            </li>
            <li>
              <strong>Retention Policy:</strong> Contact information is kept for
              the duration of our professional relationship. Transaction logs
              are retained only as long as necessary for financial
              reconciliation.
            </li>
          </ul>
        </section>

        {/* Section 5: Security Protocols */}
        <section>
          <h2 className="text-2xl font-bold">
            3. Technical Security Standards
          </h2>
          <p>Our engineering team implements the following safeguards:</p>
          <div className="grid md:grid-cols-2 gap-4 not-prose mt-6">
            <div className="p-4 border border-border rounded-xl">
              <h4 className="font-bold text-sm mb-1">Encryption</h4>
              <p className="text-xs text-muted-foreground text-pretty">
                AES-256 at rest and TLS 1.3 in transit.
              </p>
            </div>
            <div className="p-4 border border-border rounded-xl">
              <h4 className="font-bold text-sm mb-1">Access Control</h4>
              <p className="text-xs text-muted-foreground text-pretty">
                Multi-factor authentication (MFA) for all internal systems.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: User Rights */}
        <section className="border-t border-border pt-12 mt-20">
          <h2 className="text-2xl font-bold">4. Your Statutory Rights</h2>
          <p>
            Under the KDPA (2019), you have the right to access, rectify, or
            request the deletion of your personal data. To exercise these
            rights, please contact our Data Protection Officer at:
          </p>
          <p className="font-bold text-brand-primary">legal@nethub.co.ke</p>
        </section>
      </article>
    </div>
  );
}