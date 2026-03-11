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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="section-gradient border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
                    {/* Header */}
                    <div className="mb-14">
                        <span className="badge bg-indigo-50 text-indigo-600 mb-4 px-4 py-1.5 font-bold uppercase tracking-wider text-xs rounded-full">Explore</span>
                        <h1 className="text-4xl sm:text-6xl font-headings font-extrabold text-gray-900 tracking-tight mb-4">Properties</h1>
                        <p className="text-gray-500 text-lg max-w-2xl">Find your perfect home from our curated selection of architectural living spaces.</p>
                    </div>
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, location, or description..." className="input !pl-12 !py-4 shadow-sm" />
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="btn-primary !px-8 sm:w-auto w-full flex-1">Search</button>
                            <button type="button" onClick={() => setShowFilters(!showFilters)} className={`btn-secondary !px-4 ${showFilters ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}`}>
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-4 p-8 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/40 animate-slide-down">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <FilterInput label="City" value={city} onChange={setCity} placeholder="e.g. Addis Ababa" />
                                <FilterInput label="Min Price" value={minPrice} onChange={setMinPrice} placeholder="0 ETB" type="number" />
                                <FilterInput label="Max Price" value={maxPrice} onChange={setMaxPrice} placeholder="30000 ETB" type="number" />
                                <FilterInput label="Min Bedrooms" value={bedrooms} onChange={setBedrooms} placeholder="Any" type="number" />
                            </div>
                            <div className="flex flex-wrap items-center justify-between mt-8 pt-6 border-t border-gray-100 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg"><ArrowUpDown className="w-4 h-4 text-gray-500" /></div>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input !w-auto !py-2.5 !text-sm !font-medium">
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>
                                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors px-4 py-2 hover:bg-red-50 rounded-lg">
                                    <X className="w-4 h-4" /> Clear filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Available Listings</h2>
                    <p className="text-gray-500 text-sm font-medium bg-white px-3 py-1 rounded-full border shadow-sm">{pagination.total} {pagination.total === 1 ? 'property' : 'properties'} found</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /><p className="font-medium animate-pulse">Loading properties...</p></div>
                ) : properties.length === 0 ? (
                    <div className="card text-center py-20 px-4 max-w-xl mx-auto mt-10 shadow-sm border-dashed">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"><div className="text-4xl text-gray-400">🏠</div></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
                        <p className="text-gray-500">We couldn't find any listings matching your current search criteria. Try adjusting your filters.</p>
                        <button onClick={clearFilters} className="btn-secondary mt-8">Clear all filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger">
                        {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-16">
                        {Array.from({ length: pagination.totalPages }, (_, i) => (
                            <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-xl font-semibold transition-all shadow-sm ${page === i + 1 ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-white border text-gray-600 hover:border-indigo-300 hover:text-indigo-600'}`}>
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
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input shadow-sm" />
        </div>
    );
}
