// // app/service/[slug]/page.tsx
// import { services } from "@/app/lib/data/services";
// import { notFound } from "next/navigation";

// export async function generateMetadata({
//   params,
// }: {
//   params: { slug: string };
// }) {
//   const service = services.find((s) => s.slug === params.slug);
//   if (!service) return { title: "Service Not Found" };

//   return {
//     title: `${service.title} Services in Kenya`,
//     description: service.shortDesc,
//     keywords: service.seoKeywords,
//   };
// }

// export default function ServicePage({ params }: { params: { slug: string } }) {
//   const service = services.find((s) => s.slug === params.slug);

//   if (!service) notFound();

//   return (
//     <article className="max-w-4xl mx-auto px-6 py-20">
//       <header className="mb-12">
//         <h1 className="text-4xl md:text-6xl font-bold mb-6 text-brand-primary">
//           {service.title}
//         </h1>
//         <p className="text-xl opacity-80 leading-relaxed">
//           {service.description}
//         </p>
//       </header>

//       <div className="grid md:grid-cols-2 gap-12">
//         <section>
//           <h2 className="text-2xl font-bold mb-4">Core Features</h2>
//           <ul className="space-y-3">
//             {service.features.map((f) => (
//               <li key={f} className="flex items-center gap-2">
//                 <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
//                 {f}
//               </li>
//             ))}
//           </ul>
//         </section>

//         <section className="bg-card p-8 rounded-2xl border border-border">
//           <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
//           <ul className="space-y-3">
//             {service.benefits.map((b) => (
//               <li key={b} className="text-sm opacity-75">
//                 ✓ {b}
//               </li>
//             ))}
//           </ul>
//           <button className="mt-8 w-full bg-brand-primary text-white py-3 rounded-xl font-bold">
//             Request a Quote
//           </button>
//         </section>
//       </div>
//     </article>
//   );
// }


// app/service/[slug]/page.tsx
import { services } from "@/app/lib/data/services";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  // Await the promise to get the actual slug
  const { slug } = await params;
  
  const service = services.find((s) => s.slug === slug);
  if (!service) return { title: "Service Not Found" };

  return {
    title: `${service.title} Services in Kenya`,
    description: service.shortDesc,
    keywords: service.seoKeywords,
  };
}

export default async function ServicePage({ params }: Props) {
  // Await the promise here as well
  const { slug } = await params;
  
  const service = services.find((s) => s.slug === slug);

  if (!service) notFound();

  return (
    <article className="max-w-4xl mx-auto px-6 py-20">
      <header className="mb-12">
        <div className="text-brand-primary font-bold mb-2 uppercase tracking-widest text-sm">
           NetHub Solutions
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
          {service.title}
        </h1>
        <p className="text-xl opacity-80 leading-relaxed text-pretty">
          {service.description}
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">Core Features</h2>
          <ul className="space-y-3">
            {service.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-card p-8 rounded-2xl border border-border shadow-soft">
          <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
          <ul className="space-y-3">
            {service.benefits.map((b) => (
              <li key={b} className="text-sm opacity-75 flex items-start gap-2">
                <span className="text-brand-primary">✓</span> {b}
              </li>
            ))}
          </ul>
          <button className="mt-8 w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-brand-primary/20">
            Request a Quote
          </button>
        </section>
      </div>
    </article>
  );
}