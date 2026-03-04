'use client';

import Link from 'next/link';
import { MapPin, Bed, Bath, Star } from 'lucide-react';

export default function PropertyCard({ property }) {
    const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
    const avgRating = property.avgRating || 0;
    const reviewCount = property._count?.reviews || 0;

    return (
        <Link href={`/properties/${property.id}`} className="group block">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-52 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    {primaryImage ? (
                        <img
                            src={primaryImage.imageUrl}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gray-950/80 backdrop-blur-md rounded-full border border-white/10">
                        <span className="text-emerald-400 font-bold text-sm">${Number(property.pricePerMonth).toLocaleString()}</span>
                        <span className="text-gray-400 text-xs">/mo</span>
                    </div>

                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium ${property.status === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                        {property.status === 'AVAILABLE' ? 'Available' : property.status}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {property.title}
                    </h3>

                    <div className="flex items-center gap-1 mt-1.5 text-gray-400 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500/70" />
                        <span className="line-clamp-1">{property.city}, {property.state}</span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                        </div>
                        {reviewCount > 0 && (
                            <div className="flex items-center gap-1 text-gray-400 text-sm ml-auto">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span>{avgRating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
