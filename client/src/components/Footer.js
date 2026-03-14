import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-gray-900 to-gray-950 mt-auto">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br flex items-center justify-center rounded-xl shadow-lg shadow-indigo-500/20 overflow-hidden">
                                <img src="/favicon.ico" alt="HomeEase Logo" className="w-6 h-6 object-contain" />
                            </div>
                            <span className="text-xl font-headings font-bold text-white tracking-tight">Home<span className="text-indigo-400">Ease</span></span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            A curated ecosystem for modern living and professional home services. Redefining the residential experience in Addis Ababa.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-sm mb-5">Explore</h4>
                        <div className="space-y-3">
                            <FooterLink href="/properties">Browse Properties</FooterLink>
                            <FooterLink href="/services">Find Services</FooterLink>
                            <FooterLink href="/auth/register">Create Account</FooterLink>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-sm mb-5">Partnerships</h4>
                        <div className="space-y-3">
                            <FooterLink href="/auth/register">List Your Property</FooterLink>
                            <FooterLink href="/auth/register">Become a Provider</FooterLink>
                            <FooterLink href="/dashboard">Dashboard</FooterLink>
                        </div>
                    </div>
                </div>

                <div className="mt-14 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">© 2026 HomeEase. All rights reserved.</p>
                    <div className="flex items-center gap-6 text-gray-500 text-sm">
                        <span className="hover:text-gray-300 cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-gray-300 cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-gray-300 cursor-pointer transition-colors">Support</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }) {
    return (
        <Link href={href} className="block text-sm text-gray-400 hover:text-white transition-colors duration-200">
            {children}
        </Link>
    );
}
