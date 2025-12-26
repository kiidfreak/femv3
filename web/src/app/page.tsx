"use client"

import { Hero } from "@/components/sections/Hero";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Utensils,
  Hammer,
  GraduationCap,
  HeartPulse,
  Briefcase,
  ShoppingBag,
  Car,
  Home as HomeIcon,
  LayoutGrid,
  MapPin,
  Star,
  Users,
  ShieldCheck,
  Building2,
  ArrowRight,
  Package
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

const iconMap: Record<string, any> = {
  // New Slugs
  'food-hospitality': Utensils,
  'construction-hardware': Hammer,
  'education': GraduationCap,
  'health-wellness': HeartPulse,
  'professional-services': Briefcase,
  'retail-shopping': ShoppingBag,
  'auto-transport': Car,
  'home-services': HomeIcon,

  // Legacy/Existing Slugs
  'restaurant': Utensils,
  'retail': ShoppingBag,
  'services': Briefcase,
  'transport': Car,
  'non-profit': HeartPulse,
  'baking-food-services': Utensils,
  'ict': LayoutGrid,
  'agriculture': HomeIcon,
};

import { OfferingCard } from "@/components/directory/OfferingCard";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredOfferings, setFeaturedOfferings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, servRes] = await Promise.all([
          apiClient.categories.list(),
          apiClient.products.list("limit=4"),
          apiClient.services.list("limit=4")
        ]);

        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data);
        }

        const prods = prodRes.ok ? (await prodRes.json()).results : [];
        const servs = servRes.ok ? (await servRes.json()).results : [];

        // Combine and limit to 4 items total for teaser
        const combined = [
          ...prods.map((p: any) => ({ ...p, type: 'product', image_url: p.product_image_url })),
          ...servs.map((s: any) => ({ ...s, type: 'service', image_url: s.service_image_url }))
        ].slice(0, 4);

        setFeaturedOfferings(combined);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Featured Categories */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Explore Business Categories</h2>
          <p className="text-gray-600">
            Discover trusted businesses within our faith community. From restaurants to tech services, find everything you need while supporting fellow believers.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-center max-w-7xl mx-auto">
          {isLoading ? (
            /* Loading Skeletons */
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-none shadow-sm bg-gray-50/50">
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))
          ) : categories.length > 0 ? (
            categories.slice(0, 6).map((category) => {
              const Icon = iconMap[category.slug] || LayoutGrid;
              return (
                <Link key={category.id} href={`/directory?category=${category.id}`}>
                  <Card className="group cursor-pointer border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-[#F58220]/30 h-full">
                    <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                      <div className="h-14 w-14 rounded-full bg-orange-50 group-hover:bg-[#F58220] flex items-center justify-center transition-colors duration-300">
                        <Icon className="h-7 w-7 text-[#F58220] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className="font-semibold text-gray-800 group-hover:text-[#F58220] transition-colors line-clamp-2">
                        {category.name}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              Loading categories...
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link href="/directory">
            <Button variant="outline" className="border-[#F58220] text-[#F58220] hover:bg-orange-50">
              View All Categories <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products / Services Teaser */}
      <section className="bg-gray-50 py-24">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-4">
                <Package className="h-4 w-4" />
                Latest Community Offerings
              </div>
              <h2 className="text-4xl font-black text-[#1A1A1A]">Featured Products & Services</h2>
              <p className="text-gray-600 mt-4 text-lg">
                Discover quality products and professional services from our community businesses. Supporting each other helps us all grow.
              </p>
            </div>
            <Link href="/directory?view=offerings">
              <Button variant="outline" className="border-gray-200 h-12 px-6 rounded-xl font-bold hover:bg-white hover:border-[#F58220] hover:text-[#F58220] transition-all">
                View All Offerings <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : featuredOfferings.length > 0 ? (
              featuredOfferings.map((offering) => (
                <div key={`${offering.type}-${offering.id}`} className="animate-fade-in-up">
                  <OfferingCard
                    id={offering.id}
                    businessId={offering.business}
                    businessName={offering.business_name || "Community Business"}
                    name={offering.name}
                    description={offering.description}
                    type={offering.type}
                    price={offering.price}
                    priceCurrency={offering.price_currency}
                    priceRange={offering.price_range}
                    duration={offering.duration}
                    image={offering.image_url}
                    isInitialFavorite={offering.is_favorite}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium italic text-lg">No products or services available yet.</p>
                <Link href="/auth/signup" className="mt-6 inline-block">
                  <Button className="bg-[#F58220] hover:bg-[#D66D18] text-white font-bold h-12 px-8 rounded-xl shadow-lg">
                    List your products now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
                <Users className="h-4 w-4" />
                Our Growing Community
              </div>
              <h2 className="text-4xl font-bold text-[#1A1A1A] mb-6">
                See how our faith-based business directory is strengthening connections.
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Supporting local commerce within our church family helps everyone thrive.
              </p>

              <div className="grid grid-cols-2 gap-8">
                <div className="p-4 border-l-4 border-[#F58220]">
                  <div className="text-4xl font-bold text-[#1A1A1A] mb-1">70+</div>
                  <div className="text-gray-600">Local Businesses</div>
                </div>
                <div className="p-4 border-l-4 border-gray-200">
                  <div className="text-4xl font-bold text-[#1A1A1A] mb-1">2,500+</div>
                  <div className="text-gray-600">Community Members</div>
                </div>
                <div className="p-4 border-l-4 border-gray-200">
                  <div className="text-4xl font-bold text-[#1A1A1A] mb-1">85%</div>
                  <div className="text-gray-600">Verified Businesses</div>
                </div>
                <div className="p-4 border-l-4 border-[#F58220]">
                  <div className="text-4xl font-bold text-[#1A1A1A] mb-1">4.8</div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Image Grid or Collage Placeholder */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                  <div className="h-48 bg-gray-200 rounded-2xl bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center shadow-lg" />
                  <div className="h-64 bg-gray-200 rounded-2xl bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center shadow-lg" />
                </div>
                <div className="space-y-4">
                  <div className="h-64 bg-gray-200 rounded-2xl bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center shadow-lg" />
                  <div className="h-48 bg-gray-200 rounded-2xl bg-[url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA / Split Section */}
      <section className="py-20 bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-6">Ready to Join Faith Connect?</h2>
            <p className="text-white/60 text-lg">
              Whether you're looking for trusted services or want to showcase your business to our faith community,
              Faith Connect brings believers together through commerce.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-[#F58220]/50 transition-colors">
              <div className="bg-[#F58220]/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-[#F58220]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Community Members</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                Find trusted businesses owned by fellow believers. Support local commerce while building meaningful relationships.
              </p>
              <Link href="/directory">
                <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold">
                  Explore Services
                </Button>
              </Link>
            </div>

            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-[#F58220]/50 transition-colors">
              <div className="bg-[#F58220]/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Store className="h-7 w-7 text-[#F58220]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Business Owners</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                Showcase your business to our church community. Connect with customers who share your values and faith commitment.
              </p>
              <Link href="/auth/signup">
                <Button className="w-full bg-[#F58220] hover:bg-[#D66D18] text-white font-bold">
                  List Your Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Store({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  )
}
