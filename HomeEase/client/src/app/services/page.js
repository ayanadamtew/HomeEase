'use client';

import { useState, useEffect } from 'react';
import { servicesAPI } from '@/lib/api';
import Link from 'next/link';
import { Search, Star, MapPin, Clock, Loader2 } from 'lucide-react';

export default function ServicesPage() {
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('');
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

    useEffect(() => {
        servicesAPI.getCategories().then(res => setCategories(res.data.categories)).catch(console.error);
    }, []);

    const fetchProviders = async (category = activeCategory, searchQuery = search, page = 1) => {
        try {
            setLoading(true);
            const params = { page, limit: 12 };
            if (category) params.category = category;
            if (searchQuery) params.search = searchQuery;

            const res = await servicesAPI.getProviders(params);
            setProviders(res.data.providers);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, [activeCategory]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProviders(activeCategory, search, 1);
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-b from-teal-900/20 to-transparent pt-12 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Find Services</h1>
                    <p className="mt-2 text-gray-400">Trusted local professionals for your home</p>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mt-6 flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search service providers..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
                            />
                        </div>
                        <button type="submit" className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-2xl hover:from-teal-600 hover:to-emerald-600 transition-all">
                            Search
                        </button>
                    </form>

                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-2 mt-5">
                        <button
                            onClick={() => setActiveCategory('')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeCategory ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-gray-800/50 text-gray-400 border border-white/5 hover:text-white'
                                }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.name ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-gray-800/50 text-gray-400 border border-white/5 hover:text-white'
                                    }`}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-gray-400 text-sm mb-6">{pagination.total} provider{pagination.total !== 1 ? 's' : ''} found</p>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                    </div>
                ) : providers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔧</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No providers found</h3>
                        <p className="text-gray-400">Try a different category or search term</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                        {providers.map((provider) => (
                            <ProviderCard key={provider.id} provider={provider} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ProviderCard({ provider }) {
    return (
        <Link href={`/services/${provider.id}`} className="group block">
            <div className="glass rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {provider.user?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold group-hover:text-teal-400 transition-colors">{provider.user?.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-1">{provider.headline}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs text-teal-400">
                                {provider.category?.icon} {provider.category?.name}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-400 text-sm mt-3 line-clamp-2">{provider.bio}</p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-emerald-400 font-semibold">${Number(provider.hourlyRate).toFixed(0)}/hr</span>
                        {provider.avgRating > 0 && (
                            <span className="flex items-center gap-1 text-gray-400">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                {provider.avgRating.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <MapPin className="w-3 h-3" />
                        {provider.serviceArea}
                    </div>
                </div>
            </div>
        </Link>
    );
}
