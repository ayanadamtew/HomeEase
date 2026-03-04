'use client';

import { useState, useEffect } from 'react';
import { propertiesAPI } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import { Search, SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';

export default function PropertiesPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 12, sortBy };
            if (search) params.search = search;
            if (city) params.city = city;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (bedrooms) params.bedrooms = bedrooms;
            if (bathrooms) params.bathrooms = bathrooms;

            const res = await propertiesAPI.getAll(params);
            setProperties(res.data.properties);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Failed to fetch properties:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [page, sortBy]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProperties();
    };

    const clearFilters = () => {
        setSearch(''); setCity(''); setMinPrice(''); setMaxPrice('');
        setBedrooms(''); setBathrooms(''); setSortBy('newest');
        setPage(1);
        setTimeout(fetchProperties, 0);
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-b from-emerald-900/20 to-transparent pt-12 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Browse Properties</h1>
                    <p className="mt-2 text-gray-400">Find your perfect rental home</p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-6 flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title, location, or description..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                            />
                        </div>
                        <button type="submit" className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all">
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3.5 rounded-2xl border transition-all ${showFilters ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-gray-900/50 border-white/10 text-gray-400 hover:text-white'}`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 p-6 glass rounded-2xl animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                <FilterInput label="City" value={city} onChange={setCity} placeholder="e.g. New York" />
                                <FilterInput label="Min Price" value={minPrice} onChange={setMinPrice} placeholder="$0" type="number" />
                                <FilterInput label="Max Price" value={maxPrice} onChange={setMaxPrice} placeholder="$10,000" type="number" />
                                <FilterInput label="Min Bedrooms" value={bedrooms} onChange={setBedrooms} placeholder="Any" type="number" />
                                <FilterInput label="Min Bathrooms" value={bathrooms} onChange={setBathrooms} placeholder="Any" type="number" />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">Sort:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>
                                <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400 transition-colors">
                                    <X className="w-4 h-4" /> Clear all
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-400 text-sm">
                        {pagination.total} {pagination.total === 1 ? 'property' : 'properties'} found
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🏠</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No properties found</h3>
                        <p className="text-gray-400">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        {Array.from({ length: pagination.totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${page === i + 1
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterInput({ label, value, onChange, placeholder, type = 'text' }) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
        </div>
    );
}
