'use client';

import { useState, useEffect } from 'react';
import { servicesAPI } from '@/lib/api';
import Link from 'next/link';
import { Search, Star, MapPin, Loader2 } from 'lucide-react';

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
            if (cat) params.category = cat;
            if (q) params.search = q;
            const res = await servicesAPI.getProviders(params);
            setProviders(res.data.providers);
            setPagination(res.data.pagination);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProviders(); }, [selectedCategory]); // Updated dependency
    const handleSearch = (e) => { e.preventDefault(); fetchProviders(selectedCategory, search); }; // Updated to use selectedCategory

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-white"> {/* Removed border-b border-black */}
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-24 px-5 sm:px-8">
                        <h1 className="text-[72px] sm:text-[140px] font-headings text-black tracking-tight leading-[0.7] mb-6">Home Services</h1>
                        <p className="text-gray-400 font-medium uppercase tracking-[0.2em] text-[10px]">Exceptional Professionals / Vetted for your home</p>
                    </div>

                    <form onSubmit={handleSearch} className="mt-10 flex gap-3 px-5 sm:px-8"> {/* Added padding */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" strokeWidth={3} />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search providers..." className="input !pl-12 !py-5 !border-gray-100 !bg-white text-sm focus:!border-black" /> {/* Refined focus state */}
                        </div>
                        <button type="submit" className="btn-primary !px-10 uppercase tracking-widest text-xs">Search</button>
                    </form>

                    <div className="flex flex-wrap gap-2 mt-5 px-5 sm:px-8"> {/* Added padding */}
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-8 py-3 text-[10px] font-accent tracking-widest border transition-all ${selectedCategory === 'All' ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-black hover:bg-gray-50'}`}
                        >
                            All
                        </button>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-8 py-3 text-[10px] font-accent tracking-widest border transition-all ${selectedCategory === category.id ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-black hover:bg-gray-50'}`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10">{pagination.total} provider{pagination.total !== 1 ? 's' : ''} found</p>

                {loading ? (
                    <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 text-black animate-spin" /></div>
                ) : providers.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-6xl mb-4">🔧</div>
                        <h3 className="text-xl font-black text-black uppercase tracking-tighter">No providers found</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Try a different category or search term</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                        {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
                    </div>
                )}
            </div>
        </div>
    );
}

// Removed Pill component as it's replaced by direct button rendering

function ProviderCard({ provider }) {
    return (
        <Link href={`/services/${provider.id}`} className="group block">
            <div className="card p-8 border border-gray-100"> {/* Changed border-black to border-gray-100 */}
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-gray-50 border border-gray-100 flex items-center justify-center text-black text-2xl font-black uppercase flex-shrink-0"> {/* Changed border-black to border-gray-100 */}
                        {provider.user?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-black font-black uppercase tracking-tight group-hover:text-black transition-colors">{provider.user?.name}</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 line-clamp-1">{provider.headline}</p>
                        <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-white border border-black text-[10px] text-black font-black uppercase tracking-widest">
                            {provider.category?.icon} {provider.serviceType || provider.category?.name}
                        </span>
                    </div>
                </div>
                <p className="text-gray-500 text-sm mt-6 line-clamp-2 font-medium leading-relaxed">{provider.bio}</p>
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-black">
                    <div className="flex items-center gap-4">
                        <span className="text-black font-black uppercase tracking-tighter">ETB {Number(provider.hourlyRate).toFixed(0)}/hr</span>
                        {provider.avgRating > 0 && <span className="flex items-center gap-1.5 text-black text-xs font-bold uppercase tracking-widest"><Star className="w-4 h-4 fill-black" />{provider.avgRating.toFixed(1)}</span>}
                    </div>
                    <span className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-widest"><MapPin className="w-3.5 h-3.5" />{provider.serviceArea}</span>
                </div>
            </div>
        </Link>
    );
}
