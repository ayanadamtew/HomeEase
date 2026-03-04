import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 mt-auto">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                                <Home className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">HomeEase</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            The modern platform for finding your perfect home and booking trusted local service providers. Making home life easier.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Explore</h4>
                        <div className="space-y-2.5">
                            <FooterLink href="/properties">Browse Properties</FooterLink>
                            <FooterLink href="/services">Find Services</FooterLink>
                            <FooterLink href="/auth/register">Create Account</FooterLink>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">For Business</h4>
                        <div className="space-y-2.5">
                            <FooterLink href="/auth/register">List Your Property</FooterLink>
                            <FooterLink href="/auth/register">Become a Provider</FooterLink>
                            <FooterLink href="/dashboard">Dashboard</FooterLink>
                        </div>
                    </div>
                </div>

                <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">© 2026 HomeEase. All rights reserved.</p>
                    <div className="flex items-center gap-6 text-slate-500 text-sm">
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Support</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }) {
    return (
        <Link href={href} className="block text-sm text-slate-400 hover:text-white transition-colors duration-150">
            {children}
        </Link>
    );
}
