"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    FiArrowLeft,
    FiStar,
    FiMapPin,
    FiEdit2,
    FiEye,
    FiChevronLeft,
    FiChevronRight,
    FiPackage,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Product {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    price: number;
    discountPrice?: number;
    rating: number;
    totalReviews: number;
    views: number;
    status: string;
    images: string;
    tags?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    subCategory?: {
        id: string;
        name: string;
        slug: string;
    };
    seller: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        image?: string;
        verified: boolean;
    };
    createdAt: string;
}

export default function ProductPreviewPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params?.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/services?id=${productId}`);
            const data = await response.json();

            if (data.success && data.services && data.services.length > 0) {
                setProduct(data.services[0]);
            } else {
                setError("Product not found");
            }
        } catch (err) {
            console.error("Error fetching product:", err);
            setError("Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    // Parse images from JSON string
    const getImages = (): string[] => {
        if (!product) return [];
        try {
            const images = JSON.parse(product.images || "[]");
            return images.length > 0 ? images : [];
        } catch {
            return [];
        }
    };

    // Parse tags from JSON string
    const getTags = (): string[] => {
        if (!product) return [];
        try {
            return JSON.parse(product.tags || "[]");
        } catch {
            return [];
        }
    };

    const images = getImages();
    const tags = getTags();

    const nextImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return '✓';
            case 'PENDING': return '⏳';
            case 'REJECTED': return '✗';
            default: return '○';
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" color="vendor" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Not Found</h3>
                    <p className="text-gray-600 mb-4">{error || "The product you're looking for doesn't exist."}</p>
                    <Link
                        href="/vendor/products"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                    >
                        Back to My Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/vendor/products"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                        Back to Products
                    </Link>
                </div>
                <Link
                    href={`/vendor/products/edit/${product.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-300 to-emerald-500 text-white rounded-lg shadow-sm hover:shadow-md hover:from-emerald-400 hover:to-emerald-600 transition-all"
                >
                    <FiEdit2 className="w-4 h-4" />
                    Edit Product
                </Link>
            </div>

            {/* Preview Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
                <FiEye className="w-6 h-6 text-emerald-600" />
                <div>
                    <h3 className="font-semibold text-emerald-900">Product Preview</h3>
                    <p className="text-sm text-emerald-700">This is how your product appears to customers</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Product Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Image Gallery */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                        <div className="relative h-72 sm:h-80 bg-gray-100">
                            {images.length > 0 && images[currentImageIndex] ? (
                                <img
                                    src={images[currentImageIndex]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                                    <div className="text-center">
                                        <span className="text-6xl">📦</span>
                                        <p className="text-gray-500 mt-2">No images uploaded</p>
                                    </div>
                                </div>
                            )}

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white"
                                    >
                                        <FiChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white"
                                    >
                                        <FiChevronRight className="w-5 h-5" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="p-4 flex gap-2 overflow-x-auto border-t border-gray-100">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${index === currentImageIndex
                                            ? "border-emerald-600"
                                            : "border-transparent"
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <span className="text-emerald-600">{product.category?.name}</span>
                                    {product.subCategory && (
                                        <>
                                            <span>•</span>
                                            <span>{product.subCategory.name}</span>
                                        </>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {product.title}
                                </h1>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <FiStar className="w-5 h-5 fill-current" />
                                    <span className="font-semibold text-gray-900">
                                        {product.rating?.toFixed(1) || "0.0"}
                                    </span>
                                    <span className="text-gray-500">
                                        ({product.totalReviews || 0})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200 mb-4">
                            {product.city && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FiMapPin className="w-5 h-5" />
                                    <span>
                                        {product.city}
                                        {product.state && `, ${product.state}`}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                                <FiEye className="w-5 h-5" />
                                <span>{product.views || 0} views</span>
                            </div>
                        </div>

                        {/* Short Description */}
                        {product.shortDescription && (
                            <div className="mb-4">
                                <p className="text-gray-600 italic">"{product.shortDescription}"</p>
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                About this product
                            </h2>
                            <p className="text-gray-600 whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    Tags
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Stats & Actions */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Product Status</h3>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(product.status)}`}>
                            <span className="text-lg">{getStatusIcon(product.status)}</span>
                            <span className="font-semibold">{product.status}</span>
                        </div>
                        {product.status === 'APPROVED' && (
                            <p className="text-sm text-green-600 mt-3">
                                ✓ Your product is live and visible to customers
                            </p>
                        )}
                        {product.status === 'PENDING' && (
                            <p className="text-sm text-yellow-600 mt-3">
                                ⏳ Waiting for admin approval
                            </p>
                        )}
                        {product.status === 'REJECTED' && (
                            <p className="text-sm text-red-600 mt-3">
                                ✗ Please edit and resubmit for approval
                            </p>
                        )}
                    </div>

                    {/* Price Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold text-gray-900">
                                ₹{product.discountPrice || product.price}
                            </span>
                            {product.discountPrice && product.discountPrice < product.price && (
                                <span className="text-lg text-gray-500 line-through">
                                    ₹{product.price}
                                </span>
                            )}
                        </div>
                        {product.discountPrice && product.discountPrice < product.price && (
                            <p className="text-sm text-green-600 mt-2">
                                Save ₹{product.price - product.discountPrice}
                            </p>
                        )}
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Performance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{product.views || 0}</p>
                                <p className="text-sm text-gray-600">Views</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{product.totalReviews || 0}</p>
                                <p className="text-sm text-gray-600">Reviews</p>
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    {(product.city || product.address) && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
                            {product.address && (
                                <p className="text-gray-600 mb-1">{product.address}</p>
                            )}
                            <p className="text-gray-600">
                                {product.city}
                                {product.state && `, ${product.state}`}
                                {product.zipCode && ` - ${product.zipCode}`}
                            </p>
                        </div>
                    )}

                    {/* Actions Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                href={`/vendor/products/edit/${product.id}`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-300 to-emerald-500 text-white rounded-lg font-medium shadow-sm hover:shadow-md hover:from-emerald-400 hover:to-emerald-600 transition-all"
                            >
                                <FiEdit2 className="w-4 h-4" />
                                Edit Product
                            </Link>
                            <Link
                                href="/vendor/products"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                Back to My Products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
