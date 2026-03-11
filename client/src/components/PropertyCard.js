'use client';

import Link from 'next/link';
import { MapPin, Bed, Bath, Star, ArrowUpRight } from 'lucide-react';

export default function PropertyCard({ property }) {
    const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
    const avgRating = property.avgRating || 0;
    const reviewCount = property._count?.reviews || 0;

    return (
        <Link href={`/properties/${property.id}`} className="group block">
            <div className="card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                    {primaryImage ? (
                        <img
                            src={primaryImage.imageUrl}
                            alt={property.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 text-gray-400 text-lg">No Image</div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm">
                        ETB {Number(property.pricePerMonth).toLocaleString()}<span className="text-gray-400 text-xs font-normal">/mo</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 tracking-tight mb-2 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4"><MapPin className="w-3.5 h-3.5" /> {property.city}</div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms} Bed</span>
                        </div>
                        <span className="text-gray-200">·</span>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms} Bath</span>
                        </div>
                        {property.area && (
                            <>
                                <span className="text-gray-200">·</span>
                                <span className="text-gray-500 text-sm">{property.area} sqft</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
