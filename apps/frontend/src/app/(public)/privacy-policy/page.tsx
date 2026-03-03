export default function PrivacyPolicy() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-20 prose prose-slate dark:prose-invert">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-sm opacity-60 mb-10">Last Updated: March 2026</p>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">1. Data Collection</h2>
        <p>
          NetHub collects information necessary to provide our digital services,
          including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Contact Information:</strong> Name, email, and phone number
            provided via our contact forms.
          </li>
          <li>
            <strong>M-Pesa Data:</strong> For clients using our integration
            services, we process transaction metadata (Receipt numbers, amounts)
            via the Daraja API.{" "}
            <strong>
              We do not store full customer PINs or private credentials.
            </strong>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          2. Compliance with Kenyan Law
        </h2>
        <p>
          In accordance with the{" "}
          <strong>Kenya Data Protection Act (2019)</strong>, we ensure that all
          personal data is processed lawfully, minimized to what is necessary,
          and protected against unauthorized access.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">3. Data Sharing</h2>
        <p>
          We do not sell your data. Data is only shared with third-party
          providers (like Safaricom for M-Pesa or AWS for hosting) to the extent
          necessary to fulfill our service obligations.
        </p>
      </section>
    </article>
  );
}
