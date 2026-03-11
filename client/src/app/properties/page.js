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
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b border-black">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
                    {/* Header */}
                    <div className="mb-24">
                        <h1 className="text-[72px] sm:text-[140px] font-headings text-black tracking-tight leading-[0.7] mb-6">Properties</h1>
                        <p className="text-gray-400 font-medium uppercase tracking-[0.2em] text-[10px]">Curated Architectural Living / Addis Ababa</p>
                    </div>
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-10 flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" strokeWidth={3} />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, location, or description..." className="input !pl-12 !py-5 !border-black !bg-white text-sm" />
                        </div>
                        <button type="submit" className="btn-primary !px-10 uppercase tracking-widest text-xs">Search</button>
                        <button type="button" onClick={() => setShowFilters(!showFilters)} className={`btn-secondary !px-4 ${showFilters ? '!bg-black !border-black !text-white' : ''}`}>
                            <SlidersHorizontal className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-4 p-10 bg-white border border-black animate-slide-down">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <FilterInput label="City" value={city} onChange={setCity} placeholder="e.g. New York" />
                                <FilterInput label="Min Price" value={minPrice} onChange={setMinPrice} placeholder="0 ETB" type="number" />
                                <FilterInput label="Max Price" value={maxPrice} onChange={setMaxPrice} placeholder="30000 ETB" type="number" />
                                <FilterInput label="Min Bedrooms" value={bedrooms} onChange={setBedrooms} placeholder="Any" type="number" />
                            </div>
                            <div className="flex items-center justify-between mt-10 pt-10 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-4 h-4 text-black" />
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input !w-auto !py-2 !text-[11px] !border-black font-black uppercase tracking-widest bg-white">
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>
                                <button onClick={clearFilters} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                                    <X className="w-4 h-4" /> Clear filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10">{pagination.total} {pagination.total === 1 ? 'property' : 'properties'} found</p>

                {loading ? (
                    <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 text-black animate-spin" /></div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-6xl mb-4">🏠</div>
                        <h3 className="text-xl font-black text-black uppercase tracking-tighter">No properties found</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                        {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-20">
                        {Array.from({ length: pagination.totalPages }, (_, i) => (
                            <button key={i} onClick={() => setPage(i + 1)} className={`px-8 py-3 text-[10px] font-accent tracking-widest border transition-all ${page === i + 1 ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-black hover:bg-gray-50'}`}>
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
            <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-3 block">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input !bg-gray-50 !border-gray-200 focus:!border-black !py-4" />
        </div>
    );
}
