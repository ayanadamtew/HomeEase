import Link from 'next/link';
import { Building2, Wrench, ArrowRight, Shield, Star, Users, Sparkles, CheckCircle2, Heart, Clock, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="hero-gradient min-h-[90vh] flex items-center relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-[15%] w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-20 left-[10%] w-64 h-64 bg-teal-200/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-indigo-100 rounded-full mb-8 animate-fade-up shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-gray-700 text-sm font-medium">Trusted by 10,000+ happy homeowners</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-headings font-extrabold leading-tight tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-gray-900">Find your</span>
              <br />
              <span className="text-teal-500">perfect home</span>
              <br />
              <span className="text-gray-900">& services</span>
            </h1>

            <p className="mt-8 text-lg text-gray-500 leading-relaxed max-w-xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Curated rental properties and verified local service providers — a modern ecosystem designed for comfortable living.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/properties" className="btn-primary !py-3.5 !px-7 !text-[15px]">
                <Building2 className="w-5 h-5" />
                Browse Properties
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/services" className="btn-secondary !py-3.5 !px-7 !text-[15px]">
                <Wrench className="w-5 h-5" />
                Find Services
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-5 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex -space-x-2">
                {['🧑', '👩', '👨', '👩‍🦰', '🧔'].map((e, i) => (
                  <div key={i} className="w-10 h-10 bg-white border-2 border-white rounded-full flex items-center justify-center text-lg shadow-sm">{e}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-500 text-sm mt-0.5"><b className="text-gray-800">4.9/5</b> from 2,400+ reviews</p>
              </div>
            </div>
          </div>

          {/* Stats cards (right side on desktop) */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <StatCard number="500+" label="Active Listings" emoji="🏠" color="indigo" />
              <StatCard number="200+" label="Verified Providers" emoji="⭐" color="teal" />
              <StatCard number="98%" label="Satisfaction Rate" emoji="💚" color="emerald" />
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <span className="badge bg-indigo-50 text-indigo-600 mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-headings font-bold text-gray-900 tracking-tight">Get started in three simple steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
            <StepCard step="1" icon={<Building2 className="w-6 h-6" />} title="Browse & Discover" desc="Explore curated rental properties and vetted service providers in your area." color="indigo" />
            <StepCard step="2" icon={<Heart className="w-6 h-6" />} title="Connect & Book" desc="Message landlords or book service professionals directly through the platform." color="teal" />
            <StepCard step="3" icon={<CheckCircle2 className="w-6 h-6" />} title="Move In & Enjoy" desc="Settle into your new home with reliable services just a click away." color="emerald" />
          </div>
        </div>
      </section>

      {/* ── Services ───────────────────────────────────── */}
      <section className="py-20 section-gradient">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <span className="badge bg-teal-50 text-teal-600 mb-4">Services</span>
            <h2 className="text-3xl sm:text-4xl font-headings font-bold text-gray-900 tracking-tight">Home services on demand</h2>
            <p className="mt-4 text-gray-500 max-w-md mx-auto">Professional, vetted service providers ready to help with all your home needs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
            <ServiceCard emoji="🍳" title="Cooking" desc="Personal chefs and meal prep services for your household" color="amber" />
            <ServiceCard emoji="🧹" title="Cleaning" desc="Deep cleaning, regular upkeep, and move-in/out services" color="blue" />
            <ServiceCard emoji="👶" title="Childcare" desc="Trusted babysitters and nannies for your children" color="pink" />
            <ServiceCard emoji="🔧" title="Maintenance" desc="Plumbing, electrical, painting, and general repairs" color="green" />
          </div>
        </div>
      </section>

      {/* ── Why Us ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <span className="badge bg-indigo-50 text-indigo-600 mb-4">Why HomeEase</span>
            <h2 className="text-3xl sm:text-4xl font-headings font-bold text-gray-900 tracking-tight">Built for absolute convenience</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger">
            <FeatureCard icon={<Shield className="w-6 h-6 text-indigo-600" />} title="Verified Providers" desc="Every provider is background-checked and reviewed by the community." color="indigo" />
            <FeatureCard icon={<Star className="w-6 h-6 text-amber-500" />} title="Transparent Reviews" desc="Read honest reviews from real users before making any decision." color="amber" />
            <FeatureCard icon={<Users className="w-6 h-6 text-teal-600" />} title="All-in-One Platform" desc="Find your home and all the services you need, all in one place." color="teal" />
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-20 section-gradient">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <div className="card p-12 sm:p-16 bg-gradient-to-br from-indigo-600 to-indigo-800 border-0 text-center rounded-2xl relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-headings font-bold text-white tracking-tight mb-4">Ready to get started?</h2>
              <p className="text-indigo-200 mt-3 max-w-md mx-auto text-lg">Join thousands of happy users who found their perfect home and trusted service providers.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-gray-50 font-semibold py-3.5 px-8 rounded-lg transition-all shadow-lg shadow-indigo-900/20 hover:shadow-xl">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/properties" className="inline-flex items-center gap-2 bg-transparent text-white border border-white/30 hover:bg-white/10 font-semibold py-3.5 px-8 rounded-lg transition-all">
                  Browse Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ number, label, emoji, color }) {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-100',
    teal: 'bg-teal-50 border-teal-100',
    emerald: 'bg-emerald-50 border-emerald-100',
  };
  return (
    <div className={`card p-5 flex items-center gap-4 min-w-[240px] ${colors[color] || ''}`}>
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">{emoji}</div>
      <div>
        <div className="text-2xl font-headings font-bold text-gray-900">{number}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  );
}

function StepCard({ step, icon, title, desc, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  const numColors = {
    indigo: 'bg-indigo-600',
    teal: 'bg-teal-600',
    emerald: 'bg-emerald-600',
  };
  return (
    <div className="card p-8 text-center relative">
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 ${numColors[color]} text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md`}>{step}</div>
      <div className={`w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center mx-auto mb-5 border`}>{icon}</div>
      <h3 className="text-gray-900 font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function ServiceCard({ emoji, title, desc, color }) {
  const hoverColors = {
    amber: 'group-hover:bg-amber-50 group-hover:border-amber-200',
    blue: 'group-hover:bg-blue-50 group-hover:border-blue-200',
    pink: 'group-hover:bg-pink-50 group-hover:border-pink-200',
    green: 'group-hover:bg-green-50 group-hover:border-green-200',
  };
  const iconBg = {
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    pink: 'bg-pink-50 text-pink-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <Link href={`/services?category=${title}`} className="group block">
      <div className={`card p-7 transition-all duration-300 ${hoverColors[color] || ''}`}>
        <div className={`w-14 h-14 ${iconBg[color]} rounded-2xl flex items-center justify-center text-2xl mb-5`}>{emoji}</div>
        <h3 className="text-gray-900 font-semibold text-lg group-hover:text-gray-900 transition-colors">{title}</h3>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">{desc}</p>
        <div className="mt-5 flex items-center gap-1 text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Browse providers <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  const bg = {
    indigo: 'bg-indigo-50',
    amber: 'bg-amber-50',
    teal: 'bg-teal-50',
  };
  return (
    <div className="card p-8 text-center">
      <div className={`w-14 h-14 ${bg[color]} rounded-2xl flex items-center justify-center mx-auto mb-5`}>{icon}</div>
      <h3 className="text-gray-900 font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
