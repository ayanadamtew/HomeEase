import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-950 border-t border-white/10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                <Home className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">HomeEase</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                            Your one-stop platform for finding the perfect home and hiring trusted local service providers.
                            Making home life easier, one click at a time.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Explore</h4>
                        <div className="space-y-2">
                            <FooterLink href="/properties">Browse Properties</FooterLink>
                            <FooterLink href="/services">Find Services</FooterLink>
                            <FooterLink href="/auth/register">Create Account</FooterLink>
                        </div>
                    </div>

                    {/* For Providers */}
                    <div>
                        <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">For Providers</h4>
                        <div className="space-y-2">
                            <FooterLink href="/auth/register">List Your Service</FooterLink>
                            <FooterLink href="/auth/register">List a Property</FooterLink>
                            <FooterLink href="/dashboard">Dashboard</FooterLink>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">© 2026 HomeEase. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="text-gray-500 text-xs">Privacy Policy</span>
                        <span className="text-gray-500 text-xs">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }) {
    return (
        <Link href={href} className="block text-sm text-gray-400 hover:text-emerald-400 transition-colors">
            {children}
        </Link>
    );
}
