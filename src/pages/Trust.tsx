import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, EyeOff, Scale } from 'lucide-react';

const PEOPLE = [
  {
    name: 'Amara Shah',
    role: 'General Counsel, product voice',
    img: '/images/portrait-amara.jpg',
    quote: 'If I cannot open the clause, it is not advice. DocuMind treats that as a design constraint, not a slogan.',
  },
  {
    name: 'Julian Okonkwo',
    role: 'Director of Research',
    img: '/images/portrait-julian.jpg',
    quote: 'Citation fidelity is the metric. Fluency is allowed only after the page number is right.',
  },
  {
    name: 'Elena Voss',
    role: 'Design of the atelier',
    img: '/images/portrait-elena.jpg',
    quote: 'Gold for the focused span, violet for the chorus. Verification should feel like jewelry, not a spreadsheet.',
  },
  {
    name: 'Dr. Marcus Chen',
    role: 'Chief Scientist',
    img: '/images/portrait-marcus.jpg',
    quote: 'Hybrid retrieval, extractive quotes, a refusal threshold. The rest is lighting.',
  },
];

const PILLARS = [
  {
    icon: Lock,
    t: 'Encryption as etiquette',
    d: 'AES-256 at rest, TLS 1.3 in motion, customer-managed keys on request. Volumes for Postgres never sleep unencrypted.',
  },
  {
    icon: EyeOff,
    t: 'No quiet training',
    d: 'Your folios are not a pretraining corpus. Residuals exclude personal data. An Opt-In Addendum is the only exception.',
  },
  {
    icon: ShieldCheck,
    t: 'In-region processing',
    d: 'Python workers and pgvector indexes stay in the tenant VPC. Subprocessors are listed, not implied.',
  },
  {
    icon: Scale,
    t: 'Admissible answers',
    d: 'Every claim carries a page. Low-confidence questions are refused. Better a silence than a invented clause.',
  },
];

export default function Trust() {
  return (
    <div className="pt-24">
      <section className="relative overflow-hidden">
        <img src="/images/architecture.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/75 to-void" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-24 md:px-10">
          <p className="text-[11px] uppercase tracking-[0.38em] text-gold">Trust center</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">
            Built for rooms where a wrong page
            <span className="italic gold-text"> is a professional injury.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-mist">
            DocuMind is designed with counsel, scientists, and operators who already live inside PDFs. The aesthetic
            is jewelry. The ethics are archival.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-5 py-8 md:grid-cols-2 md:px-10">
        {PILLARS.map((p) => (
          <article key={p.t} className="border border-gold/15 bg-plum/40 p-8">
            <p.icon className="text-gold" />
            <h2 className="mt-4 font-display text-3xl">{p.t}</h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">{p.d}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.38em] text-gold">The atelier</p>
        <h2 className="mt-3 font-display text-5xl">Voices in the vault</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PEOPLE.map((p) => (
            <figure key={p.name} className="group">
              <div className="overflow-hidden border border-gold/20">
                <img src={p.img} alt={p.name} className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <figcaption className="mt-4">
                <div className="font-display text-2xl">{p.name}</div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-gold">{p.role}</div>
                <p className="mt-3 text-sm italic leading-relaxed text-mist">“{p.quote}”</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img src="/images/library.jpg" alt="" className="h-[50vh] w-full object-cover" />
        <div className="absolute inset-0 bg-void/60" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-[900px] px-5 text-center">
            <h2 className="font-display text-4xl md:text-6xl">Bring a folio. Leave with a citation.</h2>
            <Link
              to="/workspace"
              className="mt-8 inline-flex bg-gold px-6 py-3 text-[12px] uppercase tracking-[0.28em] text-ink hover:bg-gold-soft"
            >
              Open the vault
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
