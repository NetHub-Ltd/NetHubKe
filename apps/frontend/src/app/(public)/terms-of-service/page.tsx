export default function TermsOfService() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-20 prose prose-slate dark:prose-invert">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">1. Service Agreement</h2>
        <p>
          By engaging NetHub for software development or M-Pesa integration, you
          agree to provide the necessary API credentials and environment access
          required for project completion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">2. Payment Terms</h2>
        <p>
          Project deposits are required before commencement. NetHub reserves the
          right to suspend API support or hosting services in the event of
          unsettled invoices.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">3. Limitation of Liability</h2>
        <p>
          While we provide secure integrations, NetHub is not liable for service
          interruptions caused by third-party providers (e.g., Safaricom Daraja
          API downtime or cloud provider outages).
        </p>
      </section>
    </article>
  );
}
