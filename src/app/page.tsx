'use client';

import Link from 'next/link';
import {
  Monitor,
  Mic,
  Brain,
  Sparkles,
  Zap,
  BookOpen,
  Code,
  GraduationCap,
  Eye,
  Volume2,
  ArrowRight,
  ChevronDown,
  Star,
  CheckCircle,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
} from 'lucide-react';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════
// Landing Page
// ═══════════════════════════════════════════════════════════

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-950 overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <NovaPanels />
      <UseCases />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}

/* ── Navbar ────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Eye className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-text-50 group-hover:text-brand-400 transition-colors">
            LessonLens
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-text-300">
          <a href="#features" className="hover:text-text-50 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-text-50 transition-colors">How it Works</a>
          <a href="#nova" className="hover:text-text-50 transition-colors">Meet Nova</a>
          <a href="#pricing" className="hover:text-text-50 transition-colors">Pricing</a>
        </div>
        <Link
          href="/app"
          className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all hover:scale-[1.03] active:scale-[0.98]"
        >
          Start Tutoring
        </Link>
      </div>
    </nav>
  );
}

/* ── Hero ──────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 hero-gradient bg-grid">
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-800/60 border border-surface-600/50 text-sm text-text-300 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-accent-400" />
          AI-Powered Screen Tutoring
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 animate-slide-up">
          <span className="text-text-50">Share your screen.</span>
          <br />
          <span className="gradient-text">Nova teaches you.</span>
        </h1>

        <p className="text-lg md:text-xl text-text-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          LessonLens watches what&apos;s on your screen and teaches you in real
          time — code, math, slides, docs, anything. Like having a brilliant
          tutor looking over your shoulder.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 text-white hover:shadow-xl hover:shadow-brand-500/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            Start Tutoring Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-2xl border border-surface-600 text-text-200 hover:bg-surface-800 hover:border-surface-500 transition-all"
          >
            See How It Works
            <ChevronDown className="w-5 h-5" />
          </a>
        </div>

        {/* Hero visual mockup */}
        <div className="mt-16 md:mt-20 max-w-4xl mx-auto relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass rounded-2xl p-1 nova-glow">
            <div className="bg-surface-900 rounded-xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-700/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center text-xs text-text-400">
                  LessonLens — Live Tutoring Session
                </div>
              </div>
              {/* Content area */}
              <div className="grid grid-cols-1 md:grid-cols-5 min-h-[300px]">
                {/* Screen preview */}
                <div className="md:col-span-3 p-6 border-r border-surface-700/30">
                  <div className="bg-surface-800 rounded-lg h-full min-h-[200px] flex items-center justify-center border border-surface-700/30">
                    <div className="text-center space-y-3">
                      <Monitor className="w-12 h-12 text-brand-400 mx-auto opacity-60" />
                      <p className="text-sm text-text-400">
                        Your shared screen appears here
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Screen sharing active
                      </div>
                    </div>
                  </div>
                </div>
                {/* Tutor panel */}
                <div className="md:col-span-2 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-text-100">Nova</span>
                    <span className="text-xs text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full">Tutoring</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-surface-800/80 rounded-lg p-3 text-xs text-text-300 leading-relaxed">
                      I can see you&apos;re working on a React component with a <code className="text-brand-300 bg-brand-500/10 px-1 rounded">useEffect</code> hook. The dependency array looks like it might cause re-renders...
                    </div>
                    <div className="bg-accent-500/5 border border-accent-500/10 rounded-lg p-3 text-xs text-text-300 leading-relaxed">
                      💡 <strong>Tip:</strong> Consider using <code className="text-brand-300 bg-brand-500/10 px-1 rounded">useCallback</code> to memoize the handler function.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      icon: <Monitor className="w-7 h-7" />,
      title: 'Share Your Screen',
      description: 'Click one button to share your screen, window, or tab. LessonLens sees exactly what you see.',
      color: 'from-brand-500 to-blue-600',
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: 'Nova Analyzes',
      description: 'Nova watches your screen in real time, understanding code, math, slides, documents — anything you\'re studying.',
      color: 'from-accent-500 to-purple-600',
    },
    {
      icon: <Volume2 className="w-7 h-7" />,
      title: 'Learn Live',
      description: 'Get live voice explanations, text guidance, and interactive tutoring tailored to what\'s on your screen.',
      color: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-text-50 mb-4">
            How it works
          </h2>
          <p className="text-text-300 text-lg max-w-xl mx-auto">
            Three simple steps to start learning with your personal AI tutor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {/* Connector line */}
              {i < 2 && (
                <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-px bg-gradient-to-r from-surface-600 to-transparent" />
              )}
              <div className="glass rounded-2xl p-8 hover:border-brand-500/20 transition-all group-hover:-translate-y-1 group-hover:nova-glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                    {step.icon}
                  </div>
                  <span className="text-5xl font-bold text-surface-700 group-hover:text-surface-600 transition-colors">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-text-50 mb-2">{step.title}</h3>
                <p className="text-text-300 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ──────────────────────────────────────────── */
function Features() {
  const features = [
    { icon: <Eye className="w-5 h-5" />, title: 'Screen-Aware Tutoring', desc: 'Nova sees your screen and teaches based on exactly what you\'re looking at.' },
    { icon: <Volume2 className="w-5 h-5" />, title: 'Live Voice', desc: 'Hear Nova explain concepts aloud in real time. Like having a tutor in the room.' },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'Interactive Chat', desc: 'Ask follow-up questions, request examples, or dive deeper into any topic.' },
    { icon: <Code className="w-5 h-5" />, title: 'Code Tutoring', desc: 'Explains code logic, finds bugs, teaches best practices across languages.' },
    { icon: <GraduationCap className="w-5 h-5" />, title: 'Adaptive Difficulty', desc: 'Choose beginner, intermediate, or advanced — Nova adjusts its explanations.' },
    { icon: <BookOpen className="w-5 h-5" />, title: 'Multiple Modes', desc: 'Explain, Quiz Me, Guide Me, or Summarize — different tutoring styles on demand.' },
    { icon: <Clock className="w-5 h-5" />, title: 'Session Recording', desc: 'Record your screen sessions for later review and study.' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Session Summaries', desc: 'Get a study summary at the end with key concepts and next steps.' },
    { icon: <Shield className="w-5 h-5" />, title: 'Private & Secure', desc: 'Screen data is processed in real time and never stored permanently.' },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-surface-900/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-text-50 mb-4">
            Everything you need to learn
          </h2>
          <p className="text-text-300 text-lg max-w-xl mx-auto">
            Powerful features designed for real-time, screen-based learning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass rounded-xl p-6 hover:border-brand-500/15 transition-all group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 mb-4 group-hover:bg-brand-500/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-text-50 mb-1.5">{f.title}</h3>
              <p className="text-sm text-text-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Nova Intro ───────────────────────────────────────── */
function NovaPanels() {
  return (
    <section id="nova" className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left — Visual */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-500/20 to-brand-500/20 blur-2xl animate-float" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-accent-500 to-brand-500 opacity-10 animate-float" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-accent-500 to-brand-600 flex items-center justify-center nova-glow-strong shadow-2xl">
                  <div className="text-center text-white">
                    <Sparkles className="w-12 h-12 mx-auto mb-2" />
                    <span className="text-2xl font-bold">Nova</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Text */}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-text-50 mb-6">
              Meet <span className="gradient-text">Nova</span>
            </h2>
            <p className="text-lg text-text-300 leading-relaxed mb-6">
              Nova is your AI tutor inside LessonLens. Smart, warm, patient, and
              always ready to help. Nova watches your screen and teaches you
              like a real tutor would — step by step, adapted to your level.
            </p>
            <div className="space-y-4">
              {[
                'Explains code, math, slides, and documents',
                'Adapts to your skill level automatically',
                'Asks check-in questions to ensure understanding',
                'Speaks naturally while you work',
                'Never overwhelms — expands on your request',
              ].map((trait, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-text-200">{trait}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Use Cases ─────────────────────────────────────────── */
function UseCases() {
  const cases = [
    { icon: <Code className="w-6 h-6" />, title: 'Coding', desc: 'Debug, learn patterns, and understand codebases.' },
    { icon: <span className="text-lg font-bold">∫</span>, title: 'Math', desc: 'Solve equations and understand concepts step-by-step.' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'Textbooks', desc: 'Turn textbook pages into guided lessons.' },
    { icon: <Monitor className="w-6 h-6" />, title: 'Online Courses', desc: 'Get extra help while watching lectures.' },
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Data & Dashboards', desc: 'Understand charts, queries, and analytics.' },
    { icon: <GraduationCap className="w-6 h-6" />, title: 'Exam Prep', desc: 'Study smarter with guided practice sessions.' },
  ];

  return (
    <section className="py-24 md:py-32 bg-surface-900/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-text-50 mb-4">
            Tutoring for everything on screen
          </h2>
          <p className="text-text-300 text-lg max-w-xl mx-auto">
            Whatever you&apos;re studying, Nova adapts and teaches.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <div key={i} className="glass rounded-xl p-6 flex items-start gap-4 hover:border-accent-500/15 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-400 flex-shrink-0 group-hover:bg-accent-500/20 transition-colors">
                {c.icon}
              </div>
              <div>
                <h3 className="font-semibold text-text-50 mb-1">{c.title}</h3>
                <p className="text-sm text-text-400">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ───────────────────────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['5 sessions / month', '15 min per session', 'Text tutoring', 'Basic screen analysis'],
      cta: 'Get Started',
      featured: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/ month',
      features: ['Unlimited sessions', 'Unlimited duration', 'Voice + Text tutoring', 'Advanced AI analysis', 'Session recordings', 'Study summaries', 'Priority support'],
      cta: 'Start Pro Trial',
      featured: true,
    },
    {
      name: 'Team',
      price: '$49',
      period: '/ month',
      features: ['Everything in Pro', 'Up to 10 seats', 'Admin dashboard', 'Shared session library', 'Analytics', 'Custom tutor modes'],
      cta: 'Contact Sales',
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-text-50 mb-4">
            Simple, fair pricing
          </h2>
          <p className="text-text-300 text-lg max-w-lg mx-auto">
            Start free. Upgrade when you need more.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 flex flex-col ${
                plan.featured
                  ? 'bg-gradient-to-b from-surface-800 to-surface-900 border-2 border-brand-500/30 nova-glow scale-[1.02]'
                  : 'glass'
              }`}
            >
              {plan.featured && (
                <div className="flex items-center gap-1 text-xs font-semibold text-brand-400 mb-4">
                  <Star className="w-3.5 h-3.5" /> Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-text-50">{plan.name}</h3>
              <div className="mt-3 mb-6">
                <span className="text-4xl font-extrabold text-text-50">{plan.price}</span>
                <span className="text-text-400 ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-text-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/app"
                className={`text-center py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  plan.featured
                    ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white hover:shadow-lg hover:shadow-brand-500/25'
                    : 'border border-surface-600 text-text-200 hover:bg-surface-800'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ───────────────────────────────────────────────── */
function FAQ() {
  const faqs = [
    {
      q: 'How does LessonLens see my screen?',
      a: 'LessonLens uses your browser\'s built-in screen sharing API. You choose exactly what to share — your entire screen, a specific window, or a browser tab. We never access anything you don\'t explicitly share.',
    },
    {
      q: 'What subjects can Nova teach?',
      a: 'Nova can tutor on anything visible on your screen: code in any language, math problems, lecture slides, PDFs, textbooks, websites, dashboards, diagrams, and more. Nova adapts to whatever content it sees.',
    },
    {
      q: 'Is my screen data stored?',
      a: 'Screen frames are analyzed in real-time and are not permanently stored. Session recordings are saved locally on your device only if you choose to record.',
    },
    {
      q: 'Can I use LessonLens on mobile?',
      a: 'LessonLens is designed primarily for desktop use since screen sharing requires a desktop browser. The interface is responsive and works on tablets, but the full tutoring experience is optimized for desktop.',
    },
    {
      q: 'What AI model powers Nova?',
      a: 'Nova is powered by Google\'s Gemini multimodal AI, which understands both text and images. This allows Nova to see and understand your screen content with high accuracy.',
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-surface-900/50">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-text-50 text-center mb-16">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-800/50 transition-colors"
      >
        <span className="font-medium text-text-100">{q}</span>
        <ChevronDown className={`w-5 h-5 text-text-400 transition-transform flex-shrink-0 ml-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-text-300 text-sm leading-relaxed animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}

/* ── Footer ───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-surface-700/50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-text-100">LessonLens</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-400">
            <a href="#" className="hover:text-text-200 transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-200 transition-colors">Terms</a>
            <a href="#" className="hover:text-text-200 transition-colors">Support</a>
            <a href="#" className="hover:text-text-200 transition-colors">GitHub</a>
          </div>
          <p className="text-sm text-text-400">
            © 2026 LessonLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
