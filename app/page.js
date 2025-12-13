'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Code,
  Shield,
  Layers,
  Terminal,
  Lock,
  AlertTriangle,
  Mail,
} from 'lucide-react'

// --- Reusable UI Primitives ---

const Badge = ({ children }) => (
  <div className="px-3 py-1 rounded-full border border-gray-200 bg-white shadow-sm flex items-center gap-2 w-fit mb-6">
    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
    <span className="text-xs font-medium text-gray-600 font-mono uppercase tracking-wide">{children}</span>
  </div>
)

const Section = ({ children, className = '', id }) => (
  <section
    id={id}
    className={`w-full border-b border-gray-200 py-16 px-6 md:px-12 flex flex-col items-center ${className}`}
  >
    <div className="w-full max-w-4xl">{children}</div>
  </section>
)

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-12 text-left md:text-center w-full">
    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 font-sans tracking-tight">{title}</h2>
    {subtitle && <p className="text-gray-500 text-lg leading-relaxed">{subtitle}</p>}
  </div>
)

const Card = ({ title, children, icon: Icon }) => (
  <div className="p-6 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
    {Icon && <Icon className="w-5 h-5 text-gray-700 mb-4" />}
    <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{children}</p>
  </div>
)

function MockupSVG({ title = 'Product mockup', subtitle = 'Risk engine • premium split • claims', className = '' }) {
  const lines = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        key: i,
        w: 70 + (i % 3) * 10,
        y: 56 + i * 16,
      })),
    []
  )

  return (
    <div
      className={`w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}
      aria-label={title}
    >
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center gap-2 px-4">
        <span className="w-2.5 h-2.5 rounded-full bg-red-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-200" />
        <div className="ml-3 text-xs text-gray-500 font-mono truncate">insureinfra.app / dashboard</div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="text-xs text-gray-500 font-mono mt-1">{subtitle}</div>
          </div>
          <div className="px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] font-mono">LIVE</div>
        </div>

        <svg viewBox="0 0 560 220" className="w-full h-auto" role="img" aria-label="Mockup illustration">
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#111827" stopOpacity="0.08" />
              <stop offset="1" stopColor="#111827" stopOpacity="0.02" />
            </linearGradient>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="1" />
            </pattern>
          </defs>

          <rect x="0" y="0" width="560" height="220" rx="14" fill="url(#g)" />
          <rect x="16" y="16" width="240" height="188" rx="12" fill="#fff" stroke="#E5E7EB" />
          <rect x="276" y="16" width="268" height="122" rx="12" fill="#fff" stroke="#E5E7EB" />
          <rect x="276" y="150" width="268" height="54" rx="12" fill="#fff" stroke="#E5E7EB" />

          <rect x="16" y="16" width="240" height="188" rx="12" fill="url(#grid)" opacity="0.5" />

          <rect x="34" y="34" width="120" height="10" rx="5" fill="#111827" opacity="0.25" />
          <rect x="34" y="54" width="190" height="10" rx="5" fill="#111827" opacity="0.12" />

          <rect x="34" y="84" width="190" height="86" rx="10" fill="#F9FAFB" stroke="#E5E7EB" />
          <path d="M54 152 L88 120 L120 146 L150 110 L204 144" fill="none" stroke="#111827" strokeOpacity="0.35" strokeWidth="2.5" />
          <circle cx="88" cy="120" r="4" fill="#111827" fillOpacity="0.25" />
          <circle cx="150" cy="110" r="4" fill="#111827" fillOpacity="0.25" />
          <circle cx="204" cy="144" r="4" fill="#111827" fillOpacity="0.25" />

          <rect x="296" y="36" width="170" height="10" rx="5" fill="#111827" opacity="0.18" />
          <rect x="296" y="56" width="210" height="10" rx="5" fill="#111827" opacity="0.10" />

          <rect x="296" y="86" width="230" height="16" rx="8" fill="#ECFDF5" stroke="#D1FAE5" />
          <rect x="296" y="110" width="190" height="16" rx="8" fill="#EFF6FF" stroke="#DBEAFE" />

          <rect x="296" y="164" width="230" height="12" rx="6" fill="#111827" opacity="0.10" />
          <rect x="296" y="182" width="200" height="12" rx="6" fill="#111827" opacity="0.06" />

          {lines.map((l) => (
            <rect
              key={l.key}
              x={296}
              y={l.y}
              width={l.w}
              height={8}
              rx={4}
              fill="#111827"
              opacity={0.04}
            />
          ))}
        </svg>

        <div className="mt-4 flex flex-wrap gap-2">
          {['Risk scoring', 'Split settlement', 'Claims routing'].map((t) => (
            <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// --- Main Page Component ---

export default function LandingPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(null) // {type:'success'|'error', message:string}

  const submitLead = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus({ type: 'error', message: data?.error || 'Something went wrong' })
        setIsSubmitting(false)
        return
      }

      setStatus({ type: 'success', message: 'Thanks — we will reach out shortly.' })
      setEmail('')
      setIsSubmitting(false)
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: 'Network error. Please try again.' })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3] flex justify-center text-[#37322F] font-sans">
      {/* Main Layout Frame (Vertical Lines) */}
      <div className="w-full max-w-[1060px] relative bg-[#F7F5F3] min-h-screen shadow-2xl shadow-black/5">
        {/* Left/Right Border Lines */}
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-200 z-0" />
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gray-200 z-0" />

        {/* Content Layer */}
        <div className="relative z-10 bg-[#F7F5F3]">
          {/* Navigation (Floating Pill) */}
          <nav className="sticky top-6 z-50 flex justify-center px-4 mb-12">
            <div className="flex items-center justify-between gap-6 px-6 py-3 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full shadow-sm w-full max-w-4xl">
              <button
                type="button"
                onClick={() => scrollToId('top')}
                className="font-semibold text-gray-900"
              >
                InsureInfra
              </button>
              <div className="hidden sm:flex gap-6 text-sm font-medium text-gray-600">
                <button type="button" onClick={() => scrollToId('problem')} className="hover:text-black">
                  Risks
                </button>
                <button
                  type="button"
                  onClick={() => scrollToId('how-it-works')}
                  className="hover:text-black"
                >
                  Mechanism
                </button>
                <button type="button" onClick={() => scrollToId('coverage')} className="hover:text-black">
                  Coverage
                </button>
              </div>
              <button
                type="button"
                onClick={() => scrollToId('request-access')}
                className="text-sm font-medium bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-gray-800"
              >
                Request Access
              </button>
            </div>
          </nav>

          {/* 1. Hero Section */}
          <Section className="pt-20 pb-24 border-b" id="top">
            <div className="flex flex-col items-center text-center">
              <Badge>Startup Stability & Product Protection Layer</Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 max-w-3xl">
                Embed stability into <br className="hidden md:block" />
                <span className="text-gray-500">every transaction.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                Protect your startup from product failures, founder risk, and warranty losses — with premiums recovered
                automatically at checkout.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => scrollToId('request-access')}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition flex items-center gap-2 justify-center"
                >
                  Start Integration <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToId('developers')}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  View Pitch Deck
                </button>
              </div>

              <div className="mt-12 w-full max-w-4xl">
                <MockupSVG />
              </div>
            </div>
          </Section>

          {/* 2. The Problem */}
          <Section id="problem">
            <SectionHeader
              title="The risks that kill startups"
              subtitle="Founders are facing high-cost refunds, compliance penalties, and working capital disruption."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Product Failure" icon={AlertTriangle}>
                Defects, returns, and warranty obligations kill margins. Startups often lack the cash reserves to handle
                mass recalls.
              </Card>
              <Card title="Founder & Capital Risk" icon={Lock}>
                Investors lose capital if operations shut down due to founder misconduct, fraud, or key person loss.
              </Card>
              <Card title="Working Capital Strain" icon={Layers}>
                Traditional insurance demands large upfront premiums. This drains the runway you need to scale.
              </Card>
            </div>
          </Section>

          {/* 3. The Solution */}
          <Section className="bg-white" id="solution">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h2 className="text-3xl font-semibold mb-6">A risk-transfer engine with zero upfront cost.</h2>
                <ul className="space-y-4">
                  {[
                    'We evaluate your product and business model risk',
                    'A micro-premium is added to every unit sold',
                    'Payment gateway (Razorpay/Stripe) auto-splits the funds',
                    'Startup gets revenue; Insurer gets premium instantly',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 min-w-[20px] h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    No manual underwriting. No capital drain.
                  </p>
                </div>
              </div>

              {/* Visual: Split Settlement */}
              <div className="flex-1 w-full p-8 bg-gray-50 border border-gray-200 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Layers size={100} />
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <div className="p-3 bg-white border rounded shadow-sm flex justify-between">
                    <span>Customer Pays</span>
                    <span className="text-gray-900 font-bold">₹10,015.00</span>
                  </div>
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-2">
                    <div className="p-3 bg-green-50 border border-green-100 rounded shadow-sm flex justify-between">
                      <span className="text-green-700">→ Startup Revenue</span>
                      <span className="text-green-700">₹10,000.00</span>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded shadow-sm flex justify-between">
                      <span className="text-blue-700">→ Insurer Premium</span>
                      <span className="text-blue-700">₹15.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* 4. How It Works */}
          <Section id="how-it-works">
            <SectionHeader title="Orchestration, not paperwork" />
            <div className="relative border-l border-gray-200 ml-4 md:ml-0 md:border-l-0 md:flex md:justify-between md:items-start gap-4">
              {[
                { title: 'Risk Scoring', desc: 'We evaluate your product defects, refunds, and founder risk model.' },
                { title: 'Connect Insurer', desc: 'We route you to a carrier for underwriting via our API.' },
                { title: 'Dynamic Pricing', desc: 'Determine exact premium per product (e.g., ₹15/unit).' },
                { title: 'Auto-Settlement', desc: 'Razorpay splits the payment. You never touch the premium.' },
              ].map((step, i) => (
                <div key={i} className="mb-8 md:mb-0 ml-8 md:ml-0 relative md:flex-1 md:text-center md:px-4">
                  <span className="absolute -left-[39px] md:static md:mb-4 flex items-center justify-center w-6 h-6 bg-gray-900 text-white text-xs rounded-full ring-4 ring-[#F7F5F3]">
                    {i + 1}
                  </span>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 5. Developer Section */}
          <Section className="bg-[#111] text-white" id="developers">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-6 text-gray-400">
                  <Terminal className="w-5 h-5" />
                  <span className="font-mono text-sm">GATEWAY_DOCS.md</span>
                </div>
                <h2 className="text-3xl font-semibold mb-6 text-white">Tech gateway, not just a broker.</h2>
                <div className="space-y-4 text-gray-400 font-mono text-sm">
                  <p className="flex items-center gap-3">
                    <Code className="w-4 h-4" /> Automate Razorpay split settlements
                  </p>
                  <p className="flex items-center gap-3">
                    <Code className="w-4 h-4" /> Real-time risk scoring API
                  </p>
                  <p className="flex items-center gap-3">
                    <Code className="w-4 h-4" /> Claims dashboard webhooks
                  </p>
                  <p className="flex items-center gap-3">
                    <Code className="w-4 h-4" /> Founder risk monitoring
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToId('request-access')}
                  className="mt-8 text-white underline underline-offset-4 hover:text-gray-300"
                >
                  Read the integration guide →
                </button>


              </div>
              <div className="flex-1 w-full bg-[#1A1A1A] rounded-lg p-6 font-mono text-xs md:text-sm border border-gray-800 overflow-x-auto">
                <div className="text-green-400 mb-2">// CONFIG: Split Settlement</div>
                <pre className="text-gray-300 whitespace-pre">{`{
  "provider": "razorpay",
  "mode": "automatic_split",
  "rules": {
    "product_price": 10000,
    "insurance_premium": 15,
    "currency": "INR"
  },
  "settlement": {
    "startup_account": "acc_89234",
    "insurer_account": "acc_insurance_01"
  }
}`}</pre>
              </div>
            </div>
          </Section>

          {/* 6. Who It's For & Coverage */}
          <Section id="coverage">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-4">Real Market Needs</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="border-l-2 border-gray-200 pl-4">
                    <strong className="text-gray-900">Founder & Survival Risk:</strong> Covers fraud, misconduct, or key
                    person loss.
                  </li>
                  <li className="border-l-2 border-gray-200 pl-4">
                    <strong className="text-gray-900">Product Liability:</strong> Equipment failure, recalls, and defects.
                  </li>
                  <li className="border-l-2 border-gray-200 pl-4">
                    <strong className="text-gray-900">VC Portfolio Protection:</strong> Protects capital against business
                    shutdowns.
                  </li>
                  <li className="border-l-2 border-gray-200 pl-4">
                    <strong className="text-gray-900">Refund & Return Loss:</strong> Insurer pays if returns exceed
                    thresholds.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Who we serve</h3>
                <div className="flex flex-wrap gap-2">
                  {['Hardware & IoT', 'D2C Electronics', 'VC Funds', 'SaaS (SLA Guarantees)', 'Logistics'].map((t) => (
                    <span key={t} className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-700">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-8 p-5 border border-gray-200 rounded-xl bg-white">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <Mail className="w-4 h-4" /> Get early access
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Drop your email — we’ll send the integration checklist and pricing model.
                  </p>
                  <button
                    type="button"
                    onClick={() => scrollToId('request-access')}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black"
                  >
                    Request access
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* 7. Compliance */}
          <Section>
            <div className="p-6 bg-gray-100 rounded-lg text-center max-w-2xl mx-auto">
              <Shield className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-500">
                <strong>Regulatory Approach:</strong> Starting as a Technology Gateway (Low regulatory burden) to automate
                connections. scaling towards Licensed Brokerage (Higher revenue) for custom risk products.
              </p>
            </div>
          </Section>

          {/* 9. Final CTA + Email Capture */}
          <Section className="pb-32 pt-24" id="request-access">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                  Transfer your risk. <br /> Protect your runway.
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Get early access to the integration guide, premium split model, and coverage terms.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => scrollToId('request-access')}
                    className="px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition text-lg"
                  >
                    Contact Sales
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToId('coverage')}
                    className="px-8 py-4 bg-transparent text-gray-900 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 transition text-lg"
                  >
                    View Coverage Plans
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Mail className="w-5 h-5" /> Request access
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  We’ll email you the integration checklist. No spam.
                </p>

                <form onSubmit={submitLead} className="mt-6 space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600">Work email</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
                      type="email"
                      required
                      autoComplete="email"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-black disabled:opacity-60 disabled:hover:bg-gray-900 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Submitting…' : 'Request Access'} <ArrowRight className="w-4 h-4" />
                  </button>

                  {status?.type === 'success' && (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                      {status.message}
                    </div>
                  )}
                  {status?.type === 'error' && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {status.message}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 leading-relaxed">
                    By submitting, you agree to be contacted about InsureInfra. (This is an MVP — policy links coming
                    soon.)
                  </p>
                </form>
              </div>
            </div>
          </Section>

          {/* 10. Footer */}
          <footer className="w-full border-t border-gray-200 bg-white pt-16 pb-8 z-10 relative">
            <div className="max-w-4xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                {/* Brand Column */}
                <div className="col-span-2 md:col-span-1">
                  <span className="font-semibold text-gray-900 block mb-4">InsureInfra</span>
                  <p className="text-sm text-gray-500 mb-4">
                    The embedded insurance orchestration layer for modern startups.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded w-fit border border-green-100">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Gateway Active
                  </div>
                </div>

                {/* Product Column */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium text-gray-900 text-sm">Solutions</h4>
                  {['Product Liability', 'Founder Risk', 'VC Protection', 'Return Losses'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => scrollToId('coverage')}
                      className="text-left text-sm text-gray-500 hover:text-gray-900"
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Developers Column */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium text-gray-900 text-sm">Integration</h4>
                  {['Razorpay API', 'Stripe Connect', 'Webhooks', 'Documentation'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => scrollToId('developers')}
                      className="text-left text-sm text-gray-500 hover:text-gray-900"
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Legal Column */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium text-gray-900 text-sm">Company</h4>
                  {['About Us', 'Partners', 'Privacy Policy', 'Terms of Service'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => scrollToId('top')}
                      className="text-left text-sm text-gray-500 hover:text-gray-900"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                <p>© {new Date().getFullYear()} InsureInfra. All rights reserved.</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-gray-600 transition">
                    Twitter
                  </a>
                  <a href="#" className="hover:text-gray-600 transition">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
