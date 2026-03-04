import Link from 'next/link';
import { Building2, Wrench, ArrowRight, Shield, Star, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="hero-gradient min-h-[88vh] flex items-center relative overflow-hidden">
        {/* Decorative dots */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-indigo-600 text-sm font-medium">Trusted by 10,000+ happy homeowners</span>
            </div>

            <h1 className="text-[52px] sm:text-[64px] font-extrabold leading-[1.08] tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-slate-900">Find your</span>
              <br />
              <span className="text-indigo-500">perfect home</span>
              <br />
              <span className="text-slate-900">& services</span>
            </h1>

            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Browse curated rental properties and connect with verified local service providers — cleaning, cooking, childcare, and maintenance — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/properties" className="btn-primary !py-3.5 !px-7 !text-[15px] !rounded-2xl">
                <Building2 className="w-5 h-5" />
                Browse Properties
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/services" className="btn-secondary !py-3.5 !px-7 !text-[15px] !rounded-2xl">
                <Wrench className="w-5 h-5" />
                Find Services
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center gap-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex -space-x-3">
                {['🧑', '👩', '👨', '👩‍🦰', '🧔'].map((e, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-slate-100 border-[3px] border-white flex items-center justify-center text-lg shadow-sm">{e}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-500 text-sm mt-0.5"><b className="text-slate-700">4.9/5</b> from 2,400+ reviews</p>
              </div>
            </div>
          </div>

          {/* Stats cards (right side on desktop) */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <StatCard number="500+" label="Active Listings" emoji="🏠" color="indigo" />
              <StatCard number="200+" label="Verified Providers" emoji="⭐" color="amber" />
              <StatCard number="98%" label="Satisfaction Rate" emoji="💚" color="emerald" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ───────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <span className="badge bg-orange-50 text-orange-600 border border-orange-100 mb-4">Services</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Home services at your fingertips</h2>
            <p className="mt-3 text-slate-500 max-w-md mx-auto">Professional, vetted service providers ready to help with all your home needs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
            <ServiceCard emoji="🍳" title="Cooking" desc="Personal chefs and meal prep services for your household" color="orange" />
            <ServiceCard emoji="🧹" title="Cleaning" desc="Deep cleaning, regular upkeep, and move-in/out services" color="blue" />
            <ServiceCard emoji="👶" title="Childcare" desc="Trusted babysitters and nannies for your children" color="pink" />
            <ServiceCard emoji="🔧" title="Maintenance" desc="Plumbing, electrical, painting, and general repairs" color="green" />
          </div>
        </div>
      </section>

      {/* ── Why Us ─────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <span className="badge bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4">Why HomeEase</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Built for trust & convenience</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={<Shield className="w-6 h-6 text-indigo-500" />} title="Verified Providers" desc="Every provider is background-checked and reviewed by the community." />
            <FeatureCard icon={<Star className="w-6 h-6 text-amber-500" />} title="Transparent Reviews" desc="Read honest reviews from real users before making any decision." />
            <FeatureCard icon={<Users className="w-6 h-6 text-emerald-500" />} title="All-in-One Platform" desc="Find your home and all the services you need, all in one place." />
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <div className="card p-12 sm:p-16 bg-slate-900 border-0 text-center" style={{ boxShadow: '0 24px 80px rgba(15, 23, 42, 0.15)' }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Ready to get started?</h2>
            <p className="text-slate-400 mt-4 max-w-md mx-auto">Join thousands of happy users who found their perfect home and trusted service providers.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link href="/auth/register" className="btn-primary !bg-indigo-500 hover:!bg-indigo-400 !py-3.5 !px-8 !text-[15px] !rounded-2xl">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/properties" className="btn-secondary !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 !py-3.5 !px-8 !text-[15px] !rounded-2xl">
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ number, label, emoji, color }) {
  const bg = { indigo: 'bg-indigo-50', amber: 'bg-amber-50', emerald: 'bg-emerald-50' };
  return (
    <div className="card p-5 flex items-center gap-4 min-w-[240px]">
      <div className={`w-12 h-12 ${bg[color]} rounded-2xl flex items-center justify-center text-xl`}>{emoji}</div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{number}</div>
        <div className="text-slate-500 text-sm">{label}</div>
      </div>
    </div>
  );
}

function ServiceCard({ emoji, title, desc, color }) {
  const accents = {
    orange: 'group-hover:bg-orange-50 group-hover:border-orange-200',
    blue: 'group-hover:bg-blue-50 group-hover:border-blue-200',
    pink: 'group-hover:bg-pink-50 group-hover:border-pink-200',
    green: 'group-hover:bg-green-50 group-hover:border-green-200',
  };
  return (
    <Link href={`/services?category=${title}`} className="group block">
      <div className={`card p-7 transition-all duration-300 ${accents[color]}`}>
        <div className="text-4xl mb-4">{emoji}</div>
        <h3 className="text-slate-900 font-semibold text-lg group-hover:text-indigo-600 transition-colors">{title}</h3>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">{desc}</p>
        <div className="mt-4 flex items-center gap-1 text-indigo-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Browse providers <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-5">{icon}</div>
      <h3 className="text-slate-900 font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
