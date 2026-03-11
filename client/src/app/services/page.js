'use client';

import { useState, useEffect } from 'react';
import { servicesAPI } from '@/lib/api';
import Link from 'next/link';
import { Search, Star, MapPin, Loader2, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

    useEffect(() => { servicesAPI.getCategories().then(r => setCategories(r.data.categories)).catch(console.error); }, []);

    const fetchProviders = async (cat = selectedCategory, q = search) => {
        try {
            setLoading(true);
            const params = { page: 1, limit: 12 };
            if (cat && cat !== 'All') params.category = cat;
            if (q) params.search = q;
            const res = await servicesAPI.getProviders(params);
            setProviders(res.data.providers);
            setPagination(res.data.pagination);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProviders(); }, [selectedCategory]);
    const handleSearch = (e) => { e.preventDefault(); fetchProviders(selectedCategory, search); };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Section */}
            <div className="section-gradient border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
                    <div className="mb-14">
                        <span className="badge bg-teal-50 text-teal-600 mb-4 px-4 py-1.5 font-bold uppercase tracking-wider text-xs rounded-full">Professionals</span>
                        <h1 className="text-4xl sm:text-6xl font-headings font-extrabold text-gray-900 tracking-tight mb-4">Home Services</h1>
                        <p className="text-gray-500 text-lg max-w-2xl">Connect with exceptional, vetted professionals for all your household needs.</p>
                    </div>

                    <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for providers, skills, or keywords..." className="input !pl-12 !py-4 shadow-sm" />
                        </div>
                        <button type="submit" className="btn-primary !px-10 sm:w-auto w-full">Search</button>
                    </form>

                    <div className="flex flex-wrap gap-2.5 mt-8">
                        <CategoryPill
                            active={selectedCategory === '' || selectedCategory === 'All'}
                            onClick={() => setSelectedCategory('All')}
                            label="All Services"
                        />
                        {categories.map(category => (
                            <CategoryPill
                                key={category.id}
                                active={selectedCategory === category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                label={category.name}
                                icon={category.icon}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Featured Providers</h2>
                    <p className="text-gray-500 text-sm font-medium bg-white px-3 py-1 rounded-full border shadow-sm">{pagination.total} provider{pagination.total !== 1 ? 's' : ''} found</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /><p className="font-medium animate-pulse">Loading providers...</p></div>
                ) : providers.length === 0 ? (
                    <div className="card text-center py-20 px-4 max-w-xl mx-auto mt-10 shadow-sm border-dashed">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><div className="text-4xl text-gray-400">🔧</div></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No providers found</h3>
                        <p className="text-gray-500">We couldn't find any professionals matching your search. Try adjusting categories or keywords.</p>
                        <button onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="btn-secondary mt-8">Clear filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger">
                        {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
                    </div>
                )}
            </div>
        </div>
    );
}

function CategoryPill({ active, onClick, label, icon }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm border ${active
                ? 'bg-teal-600 text-white border-teal-600 shadow-teal-600/20'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50'}`}
        >
            {icon && <span>{icon}</span>}
            {label}
        </button>
    );
}

function ProviderCard({ provider }) {
    return (
        <Link href={`/services/${provider.id}`} className="group block h-full">
            <div className="card p-6 border-none shadow-sm flex flex-col h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center text-teal-600 text-2xl font-bold flex-shrink-0 shadow-sm">
                        {provider.user?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="text-gray-900 font-bold text-lg tracking-tight group-hover:text-teal-600 transition-colors truncate">{provider.user?.name}</h3>
                        <p className="text-gray-500 text-sm font-medium mt-0.5 line-clamp-1">{provider.headline}</p>
                        <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 bg-gray-50 rounded-md border border-gray-100 text-xs text-gray-600 font-semibold">
                            <span>{provider.category?.icon}</span> <span className="truncate">{provider.serviceType || provider.category?.name}</span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 text-sm mt-5 line-clamp-2 leading-relaxed flex-1">{provider.bio}</p>

                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-bold">ETB {Number(provider.hourlyRate).toFixed(0)} <span className="text-gray-400 font-normal text-sm">/hr</span></span>
                        {provider.avgRating > 0 && (
                            <span className="flex items-center gap-1 text-amber-500 text-sm font-bold bg-amber-50 px-2.5 py-1 rounded-md">
                                <Star className="w-3.5 h-3.5 fill-amber-500" /> {provider.avgRating.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <span className="flex items-center gap-1 text-gray-400 text-xs font-semibold uppercase tracking-wider"><MapPin className="w-3.5 h-3.5" />{provider.serviceArea}</span>
                </div>
            </div>
        </Link>
    );
}
