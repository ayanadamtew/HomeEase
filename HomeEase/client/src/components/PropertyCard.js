'use client';

import Link from 'next/link';
import { MapPin, Bed, Bath, Star, ArrowUpRight } from 'lucide-react';

export default function PropertyCard({ property }) {
    const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
    const avgRating = property.avgRating || 0;
    const reviewCount = property._count?.reviews || 0;

    return (
        <Link href={`/properties/${property.id}`} className="group block">
            <div className="card card-interactive rounded-2xl overflow-hidden">
                {/* Image */}
                <div className="relative h-56 bg-slate-100 overflow-hidden">
                    {primaryImage ? (
                        <img
                            src={primaryImage.imageUrl}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
                            <div className="text-center">
                                <div className="text-4xl mb-1">🏠</div>
                                <span className="text-slate-400 text-xs">No photo</span>
                            </div>
                        </div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-md">
                        <span className="text-indigo-600 font-bold text-[15px]">${Number(property.pricePerMonth).toLocaleString()}</span>
                        <span className="text-slate-400 text-xs font-medium">/mo</span>
                    </div>

                    {/* Rating */}
                    {reviewCount > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-slate-800 text-xs font-semibold">{avgRating.toFixed(1)}</span>
                        </div>
                    )}

                    {/* Status */}
                    {property.status !== 'AVAILABLE' && (
                        <div className="absolute top-3 left-3 badge bg-red-50 text-red-600 border border-red-100">
                            {property.status}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 pb-5">
                    <h3 className="text-slate-900 font-semibold text-[15px] leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {property.title}
                    </h3>

                    <div className="flex items-center gap-1 mt-1.5 text-slate-400 text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{property.city}, {property.state}</span>
                    </div>

                    <div className="flex items-center gap-1 mt-3.5 pt-3.5 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-slate-500 text-[13px]">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                        </div>
                        <span className="text-slate-200 mx-1.5">·</span>
                        <div className="flex items-center gap-1 text-slate-500 text-[13px]">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                        </div>
                        {property.area && (
                            <>
                                <span className="text-slate-200 mx-1.5">·</span>
                                <span className="text-slate-500 text-[13px]">{property.area} sqft</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
