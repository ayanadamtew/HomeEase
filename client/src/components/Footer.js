import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-black border-t border-black mt-auto">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-white flex items-center justify-center border border-white">
                                <Home className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-3xl font-headings text-white tracking-tighter">Home<span className="text-gray-500">Ease</span></span>
                        </div>
                        <p className="text-gray-400 text-[12px] font-medium leading-loose max-w-sm tracking-tight opacity-70">
                            A curated ecosystem for architectural living and professional home services. Redefining the modern residential experience in Addis Ababa.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-accent text-[10px] uppercase tracking-[0.3em] mb-8">Explore</h4>
                        <div className="space-y-2.5">
                            <FooterLink href="/properties">Browse Properties</FooterLink>
                            <FooterLink href="/services">Find Services</FooterLink>
                            <FooterLink href="/auth/register">Create Account</FooterLink>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-accent text-[10px] uppercase tracking-[0.3em] mb-8">Partnerships</h4>
                        <div className="space-y-2.5">
                            <FooterLink href="/auth/register">List Your Property</FooterLink>
                            <FooterLink href="/auth/register">Become a Provider</FooterLink>
                            <FooterLink href="/dashboard">Dashboard</FooterLink>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">© 2026 HomeEase. All rights reserved.</p>
                    <div className="flex items-center gap-8 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Support</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }) {
    return (
        <Link href={href} className="block text-[11px] font-accent uppercase tracking-widest text-gray-500 hover:text-white transition-colors duration-200">
            {children}
        </Link>
    );
}
