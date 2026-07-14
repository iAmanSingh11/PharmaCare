import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const STATS = [
  { label: 'Partner Pharmacies', value: '1,200+' },
  { label: 'Medicines Listed', value: '45,000+' },
  { label: 'Orders Delivered', value: '2.3M+' },
  { label: 'Avg. Delivery Time', value: '18 min' },
];

const FEATURES = [
  { icon: '📦', title: 'Live Inventory Sync', desc: 'Stock levels update instantly across every customer search the moment a pharmacist edits inventory.' },
  { icon: '🔔', title: 'Real Time Notifications', desc: 'Order accepted, dispatched, delivered — both sides stay in sync without refreshing a page.' },
  { icon: '📍', title: 'Nearby Pharmacy Search', desc: 'Find in-stock medicines at pharmacies near you, with live distance and directions.' },
  { icon: '📊', title: 'Sales & Stock Analytics', desc: 'Pharmacists get revenue trends, low-stock alerts, and expiry tracking out of the box.' },
  { icon: '🧾', title: 'Digital Health Records', desc: 'Customers keep a running history of past orders and prescriptions in one place.' },
  { icon: '🔒', title: 'Secure by Design', desc: 'JWT auth, hashed passwords, and role-based access control protect every account.' },
];

const STEPS = [
  { step: '1', title: 'Pharmacist lists stock', desc: 'Chemists add medicines with batch, price, expiry, and photos.' },
  { step: '2', title: 'Customer searches & orders', desc: 'Buyers find nearby, in-stock medicines and check out in seconds.' },
  { step: '3', title: 'Order flows in real time', desc: 'Pharmacist accepts, stock adjusts automatically, customer is notified.' },
  { step: '4', title: 'Delivered & tracked', desc: 'Live status updates from dispatch to doorstep, with an invoice on file.' },
];

const TESTIMONIALS = [
  { quote: 'We stopped tracking stock in a notebook. PharmaCare tells us exactly what\u2019s low before customers even ask.', name: 'Shop Owner, Sector 12 Pharmacy' },
  { quote: 'I can see every medicine I\u2019ve ordered in the last year in one place. Reordering takes ten seconds.', name: 'Regular Customer' },
  { quote: 'Order management used to be all phone calls. Now it\u2019s all in the dashboard.', name: 'Pharmacist, City Medical Store' },
];

const FAQS = [
  { q: 'Is PharmaCare free for pharmacies to join?', a: 'Yes, listing your pharmacy and managing inventory is free during the current rollout.' },
  { q: 'How fast is delivery?', a: 'Most orders from nearby pharmacies are delivered within 15\u201330 minutes, depending on distance and availability.' },
  { q: 'Can I order prescription medicines?', a: 'Yes — prescription items are flagged and require a valid upload during checkout.' },
  { q: 'Is my health data private?', a: 'Your order and prescription history is only visible to you and the pharmacy that fulfilled the order.' },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-ink-900"
      >
        {q}
        <span className="text-ink-500">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="px-5 pb-4 text-sm text-ink-500">{a}</p>}
    </div>
  );
};

const LandingPage = () => {
  return (
    <div>
      {/* HERO */}
      <section id="home" className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-medium text-brand-700">
              India's Most Trusted Pharmacy Platform
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-ink-900 md:text-5xl">
              Your Health, Our <span className="text-brand-500">Priority</span>
            </h1>
            <p className="mt-5 max-w-md text-ink-500">
              Find medicines in minutes, manage prescriptions digitally, and track every order in real time
              with PharmaCare.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary">Get Started Free →</Link>
              <a href="#how-it-works" className="btn-secondary">See How It Works</a>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="absolute -left-4 -top-4 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-soft">
              ⚡ Avg. 18 min delivery
            </div>
            <div className="card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <p className="font-semibold">Order #ORD10234</p>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Dispatched</span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><span>Paracetamol 500mg</span><span>×2</span></div>
                <div className="flex justify-between"><span>Vitamin C</span><span>×1</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>₹185.00</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-slate-100 bg-white py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="text-center"
            >
              <p className="text-3xl font-extrabold text-brand-500">{s.value}</p>
              <p className="mt-1 text-sm text-ink-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-5xl px-6 py-24 text-center">
        <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-medium text-brand-700">
          About PharmaCare
        </span>
        <h2 className="mt-4 text-3xl font-bold text-ink-900">Built to fix how local pharmacies actually work</h2>
        <p className="mx-auto mt-4 max-w-2xl text-ink-500">
          PharmaCare started from a simple observation: most neighborhood pharmacies still track stock on paper
          and take orders over the phone. We connect verified local chemists to nearby customers with live
          inventory, real-time order tracking, and the kind of tools a modern pharmacy business actually needs —
          without requiring a tech team to run it.
        </p>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-ink-900">Why Choose PharmaCare</h2>
          <p className="mt-3 text-ink-500">Built for real pharmacy operations, not just a shopping cart.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="card"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-4 font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-brand-50/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-ink-900">How It Works</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="card text-center"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-center text-3xl font-bold text-ink-900">Trusted by Thousands</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="card"
            >
              <p className="text-ink-700">“{t.quote}”</p>
              <p className="mt-4 text-sm font-semibold text-ink-900">— {t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold text-ink-900">Frequently Asked Questions</h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-ink-900">Ready to get started?</h2>
        <p className="mt-3 text-ink-500">Join as a customer or list your pharmacy in under two minutes.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register" className="btn-primary">Create Free Account</Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
