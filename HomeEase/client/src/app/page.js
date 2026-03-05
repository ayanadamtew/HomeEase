import Link from 'next/link';
import { Building2, Wrench, ArrowRight, Shield, Star, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="hero-gradient min-h-[88vh] flex items-center relative overflow-hidden">
        {/* Decorative dots */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '40px 40px', opacity: 0.1 }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4 text-gray-600" />
              <span className="text-black text-sm font-medium">Trusted by 10,000+ happy homeowners</span>
            </div>

            <h1 className="text-[72px] sm:text-[160px] font-headings leading-[0.7] tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="text-black">Find your</span>
              <br />
              <span className="text-gray-300 italic">perfect home</span>
              <br />
              <span className="text-black">& services</span>
            </h1>

            <p className="mt-14 text-2xl text-black leading-tight max-w-xl animate-fade-up font-medium tracking-tight" style={{ animationDelay: '0.2s' }}>
              Curated rental properties / verified local service providers. A sophisticated ecosystem for modern living.
            </p>

            <div className="mt-10 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/properties" className="btn-primary !py-4 !px-8 !text-[15px]">
                <Building2 className="w-5 h-5" />
                Browse Properties
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/services" className="btn-secondary !py-4 !px-8 !text-[15px]">
                <Wrench className="w-5 h-5" />
                Find Services
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center gap-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex -space-x-3">
                {['🧑', '👩', '👨', '👩‍🦰', '🧔'].map((e, i) => (
                  <div key={i} className="w-10 h-10 bg-white border border-black flex items-center justify-center text-lg">{e}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-black fill-black" />)}
                </div>
                <p className="text-gray-500 text-sm mt-0.5"><b className="text-black">4.9/5</b> from 2,400+ reviews</p>
              </div>
            </div>
          </div>

          {/* Stats cards (right side on desktop) */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <StatCard number="500+" label="Active Listings" emoji="🏠" color="gray" />
              <StatCard number="200+" label="Verified Providers" emoji="⭐" color="gray" />
              <StatCard number="98%" label="Satisfaction Rate" emoji="💚" color="gray" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ───────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-20">
            <span className="badge bg-black text-white border border-black mb-10 tracking-[0.4em] text-[10px] font-accent px-10 py-4 shadow-none">SERVICES</span>
            <h2 className="text-[60px] sm:text-[120px] font-headings text-black tracking-tight leading-[0.8] mb-8">Home services on demand</h2>
            <p className="mt-4 text-gray-400 max-w-md mx-auto font-bold uppercase tracking-widest text-xs">Professional, vetted service providers ready to help with all your home needs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
            <ServiceCard emoji="🍳" title="Cooking" desc="Personal chefs and meal prep services for your household" color="gray" />
            <ServiceCard emoji="🧹" title="Cleaning" desc="Deep cleaning, regular upkeep, and move-in/out services" color="gray" />
            <ServiceCard emoji="👶" title="Childcare" desc="Trusted babysitters and nannies for your children" color="gray" />
            <ServiceCard emoji="🔧" title="Maintenance" desc="Plumbing, electrical, painting, and general repairs" color="gray" />
          </div>
        </div>
      </section>

      {/* ── Why Us ─────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-20">
            <span className="badge bg-black text-white border border-black mb-10 tracking-[0.4em] text-[10px] font-accent px-10 py-4 shadow-none">TRUST</span>
            <h2 className="text-[60px] sm:text-[120px] font-headings text-black tracking-tight leading-[0.8] mb-8">Built for absolute convenience</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={<Shield className="w-6 h-6 text-black" />} title="Verified Providers" desc="Every provider is background-checked and reviewed by the community." />
            <FeatureCard icon={<Star className="w-6 h-6 text-black" />} title="Transparent Reviews" desc="Read honest reviews from real users before making any decision." />
            <FeatureCard icon={<Users className="w-6 h-6 text-black" />} title="All-in-One Platform" desc="Find your home and all the services you need, all in one place." />
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <div className="card p-12 sm:p-20 bg-black border-0 text-center">
            <h2 className="text-[40px] sm:text-[56px] font-black text-white tracking-tighter uppercase leading-none mb-6">Ready to get started?</h2>
            <p className="text-gray-400 mt-4 max-w-md mx-auto text-lg font-medium">Join thousands of happy users who found their perfect home and trusted service providers.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <Link href="/auth/register" className="btn-primary !bg-white !text-black hover:!bg-gray-200 !py-4 !px-10 !text-[16px]">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/properties" className="btn-secondary !border-white !text-white hover:!bg-white/10 !py-4 !px-10 !text-[16px]">
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
  const bg = { gray: 'bg-gray-50', amber: 'bg-gray-50', emerald: 'bg-gray-50' };
  return (
    <div className="card p-5 flex items-center gap-4 min-w-[240px]">
      <div className="w-12 h-12 bg-gray-50 border border-gray-200 flex items-center justify-center text-xl">{emoji}</div>
      <div>
        <div className="text-2xl font-black text-black tracking-tighter uppercase">{number}</div>
        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}

function ServiceCard({ emoji, title, desc, color }) {
  const accents = {
    orange: 'group-hover:bg-gray-50 group-hover:border-orange-200',
    blue: 'group-hover:bg-gray-50 group-hover:border-blue-200',
    pink: 'group-hover:bg-pink-50 group-hover:border-pink-200',
    green: 'group-hover:bg-green-50 group-hover:border-green-200',
  };
  return (
    <Link href={`/services?category=${title}`} className="group block">
      <div className="card p-7 transition-all duration-300">
        <div className="text-4xl mb-4">{emoji}</div>
        <h3 className="text-black font-black text-xl uppercase tracking-tighter group-hover:text-black transition-colors">{title}</h3>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed font-medium">{desc}</p>
        <div className="mt-6 flex items-center gap-1 text-black text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Browse providers <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card p-10 text-center">
      <div className="w-14 h-14 bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-6">{icon}</div>
      <h3 className="text-black font-black text-xl uppercase tracking-tighter mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
