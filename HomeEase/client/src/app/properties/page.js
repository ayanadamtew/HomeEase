'use client';

import { useState, useEffect } from 'react';
import { propertiesAPI } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import { Search, SlidersHorizontal, X, Loader2, ArrowUpDown } from 'lucide-react';

export default function PropertiesPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [bedrooms, setBedrooms] = useState('');
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
            const res = await propertiesAPI.getAll(params);
            setProperties(res.data.properties);
            setPagination(res.data.pagination);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProperties(); }, [page, sortBy]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProperties(); };
    const clearFilters = () => { setSearch(''); setCity(''); setMinPrice(''); setMaxPrice(''); setBedrooms(''); setSortBy('newest'); setPage(1); setTimeout(fetchProperties, 0); };

    return (
        <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
            {/* Header */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Browse Properties</h1>
                    <p className="mt-1.5 text-slate-500">Find your next perfect rental home</p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-6 flex gap-2.5">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, location, or description..." className="input !pl-12 !py-3.5 !rounded-2xl !border-slate-200 !bg-slate-50 focus:!bg-white" />
                        </div>
                        <button type="submit" className="btn-primary !rounded-2xl !px-7">Search</button>
                        <button type="button" onClick={() => setShowFilters(!showFilters)} className={`btn-secondary !rounded-2xl !px-4 ${showFilters ? '!bg-indigo-50 !border-indigo-200 !text-indigo-600' : ''}`}>
                            <SlidersHorizontal className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-4 p-5 card animate-slide-down !rounded-2xl">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <FilterInput label="City" value={city} onChange={setCity} placeholder="e.g. New York" />
                                <FilterInput label="Min Price" value={minPrice} onChange={setMinPrice} placeholder="0 ETB" type="number" />
                                <FilterInput label="Max Price" value={maxPrice} onChange={setMaxPrice} placeholder="30000 ETB" type="number" />
                                <FilterInput label="Min Bedrooms" value={bedrooms} onChange={setBedrooms} placeholder="Any" type="number" />
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input !w-auto !py-2 !text-sm !border-slate-200">
                                        <option value="newest">Newest</option>
                                        <option value="oldest">Oldest</option>
                                        <option value="price_asc">Price ↑</option>
                                        <option value="price_desc">Price ↓</option>
                                    </select>
                                </div>
                                <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="w-4 h-4" /> Clear filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
                <p className="text-slate-400 text-sm mb-6 font-medium">{pagination.total} {pagination.total === 1 ? 'property' : 'properties'} found</p>

                {loading ? (
                    <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-5xl mb-3">🏠</div>
                        <h3 className="text-lg font-semibold text-slate-900">No properties found</h3>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                        {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-12">
                        {Array.from({ length: pagination.totalPages }, (_, i) => (
                            <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>
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
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input !py-2.5 !text-sm" />
        </div>
    );
}
