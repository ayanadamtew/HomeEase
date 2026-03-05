'use client';

import { useState, useEffect } from 'react';
import { servicesAPI } from '@/lib/api';
import Link from 'next/link';
import { Search, Star, MapPin, Loader2 } from 'lucide-react';

export default function ServicesPage() {
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('');
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

    useEffect(() => { servicesAPI.getCategories().then(r => setCategories(r.data.categories)).catch(console.error); }, []);

    const fetchProviders = async (cat = activeCategory, q = search) => {
        try {
            setLoading(true);
            const params = { page: 1, limit: 12 };
            if (cat) params.category = cat;
            if (q) params.search = q;
            const res = await servicesAPI.getProviders(params);
            setProviders(res.data.providers);
            setPagination(res.data.pagination);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProviders(); }, [activeCategory]);
    const handleSearch = (e) => { e.preventDefault(); fetchProviders(activeCategory, search); };

    return (
        <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Find Services</h1>
                    <p className="mt-1.5 text-slate-500">Trusted local professionals for your home</p>

                    <form onSubmit={handleSearch} className="mt-6 flex gap-2.5">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search providers..." className="input !pl-12 !py-3.5 !rounded-2xl !border-slate-200 !bg-slate-50 focus:!bg-white" />
                        </div>
                        <button type="submit" className="btn-primary !rounded-2xl !px-7">Search</button>
                    </form>

                    <div className="flex flex-wrap gap-2 mt-5">
                        <Pill active={!activeCategory} onClick={() => setActiveCategory('')}>All</Pill>
                        {categories.map(c => <Pill key={c.id} active={activeCategory === c.name} onClick={() => setActiveCategory(c.name)}>{c.icon} {c.name}</Pill>)}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
                <p className="text-slate-400 text-sm mb-6 font-medium">{pagination.total} provider{pagination.total !== 1 ? 's' : ''} found</p>

                {loading ? (
                    <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>
                ) : providers.length === 0 ? (
                    <div className="text-center py-24"><div className="text-5xl mb-3">🔧</div><h3 className="text-lg font-semibold text-slate-900">No providers found</h3><p className="text-slate-400 text-sm mt-1">Try a different category or search term</p></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
                        {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
                    </div>
                )}
            </div>
        </div>
    );
}

function Pill({ active, onClick, children }) {
    return (
        <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
            {children}
        </button>
    );
}

function ProviderCard({ provider }) {
    return (
        <Link href={`/services/${provider.id}`} className="group block">
            <div className="card p-6 card-interactive">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold flex-shrink-0">
                        {provider.user?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-slate-900 font-semibold group-hover:text-indigo-600 transition-colors">{provider.user?.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-1">{provider.headline}</p>
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 bg-slate-50 border border-slate-100 rounded-full text-xs text-slate-500 font-medium">
                            {provider.category?.icon} {provider.serviceType || provider.category?.name}
                        </span>
                    </div>
                </div>
                <p className="text-slate-400 text-sm mt-3 line-clamp-2">{provider.bio}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 text-sm">
                        <span className="text-indigo-600 font-bold">ETB {Number(provider.hourlyRate).toFixed(0)}/hr</span>
                        {provider.avgRating > 0 && <span className="flex items-center gap-1 text-slate-400"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{provider.avgRating.toFixed(1)}</span>}
                    </div>
                    <span className="flex items-center gap-1 text-slate-400 text-xs"><MapPin className="w-3 h-3" />{provider.serviceArea}</span>
                </div>
            </div>
        </Link>
    );
}
