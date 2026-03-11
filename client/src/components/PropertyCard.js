'use client';

import Link from 'next/link';
import { MapPin, Bed, Bath, Star, ArrowUpRight } from 'lucide-react';

export default function PropertyCard({ property }) {
    const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
    const avgRating = property.avgRating || 0;
    const reviewCount = property._count?.reviews || 0;

    return (
        <Link href={`/properties/${property.id}`} className="group block">
            <div className="card border border-gray-100 overflow-hidden">
                {/* Image */}
                <div className="relative h-64 bg-gray-50 overflow-hidden border-b border-gray-100 group">
                    {primaryImage ? (
                        <img
                            src={primaryImage.imageUrl}
                            alt={property.title}
                            className="w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-black font-headings italic text-xl">No Image</div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute top-0 right-0 bg-white text-black px-5 py-3 text-[10px] font-accent tracking-widest border-l border-b border-gray-100 z-10">
                        ETB {Number(property.pricePerMonth).toLocaleString()}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <h3 className="text-2xl font-headings text-black tracking-tight mb-4 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center gap-2 text-gray-400 font-body text-[10px] uppercase tracking-widest mb-6"><MapPin className="w-3.5 h-3.5" /> {property.city}</div>

                    <div className="flex items-center gap-1 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-gray-500 text-[11px] font-bold uppercase tracking-tighter">
                            <Bed className="w-3.5 h-3.5" />
                            <span>{property.bedrooms} Bed</span>
                        </div>
                        <span className="text-gray-200 mx-2">·</span>
                        <div className="flex items-center gap-1 text-gray-500 text-[11px] font-bold uppercase tracking-tighter">
                            <Bath className="w-3.5 h-3.5" />
                            <span>{property.bathrooms} Bath</span>
                        </div>
                        {property.area && (
                            <>
                                <span className="text-gray-200 mx-2">·</span>
                                <span className="text-gray-500 text-[11px] font-bold uppercase tracking-tighter">{property.area} sqft</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
