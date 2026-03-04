import Link from 'next/link';
import { Building2, Wrench, ArrowRight, Shield, Star, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-gray-950 to-teal-900/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Your trusted home platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              <span className="text-white">Find Your</span>
              <br />
              <span className="gradient-text">Perfect Home</span>
              <br />
              <span className="text-white">& Services</span>
            </h1>

            <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-xl">
              Browse curated rental properties and connect with trusted local service providers
              for cleaning, cooking, childcare, and maintenance — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/properties" className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5">
                <Building2 className="w-5 h-5" />
                Browse Properties
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/services" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all hover:-translate-y-0.5">
                <Wrench className="w-5 h-5" />
                Find Services
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 flex flex-wrap gap-8">
              <StatItem number="500+" label="Properties" />
              <StatItem number="200+" label="Providers" />
              <StatItem number="4.8" label="Avg Rating" icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />} />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Home Services at Your Fingertips</h2>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">Professional, vetted service providers ready to help with all your home needs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            <ServiceCard emoji="🍳" title="Cooking" desc="Personal chefs and meal prep services for your household" />
            <ServiceCard emoji="🧹" title="Cleaning" desc="Deep cleaning, regular upkeep, and move-in/out services" />
            <ServiceCard emoji="👶" title="Childcare" desc="Trusted babysitters and nannies for your children" />
            <ServiceCard emoji="🔧" title="Maintenance" desc="Plumbing, electrical, painting, and general repairs" />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Why HomeEase?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-emerald-400" />}
              title="Verified Providers"
              desc="Every service provider is vetted and reviewed by the community."
            />
            <FeatureCard
              icon={<Star className="w-6 h-6 text-amber-400" />}
              title="Transparent Reviews"
              desc="Read honest reviews from real users before making a decision."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-teal-400" />}
              title="All-in-One Platform"
              desc="Find your home and all the services you need in one place."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join thousands of happy users who found their perfect home and trusted service providers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/register" className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-xl shadow-emerald-500/20">
                Create Free Account
              </Link>
              <Link href="/properties" className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all">
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatItem({ number, label, icon }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-2xl font-bold text-white">{number}</span>
      <span className="text-gray-400">{label}</span>
    </div>
  );
}

function ServiceCard({ emoji, title, desc }) {
  return (
    <Link href={`/services?category=${title}`} className="group glass rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-white font-semibold text-lg group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm mt-2 leading-relaxed">{desc}</p>
    </Link>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass rounded-2xl p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-5">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
