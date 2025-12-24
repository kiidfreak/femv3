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
  LayoutGrid
} from "lucide-react";
import Link from "next/link";

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

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.get('/categories/');
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#1A1A1A]">Featured Categories</h2>
          <div className="h-[2px] flex-1 mx-8 bg-gray-100 hidden sm:block" />
          <Link href="/directory" className="text-[#F58220] font-bold hover:underline hidden sm:block">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
                  <Card className="group cursor-pointer border-none shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                      <div className="h-14 w-14 rounded-full bg-[#fcefe7] group-hover:bg-[#F58220] flex items-center justify-center transition-colors duration-300">
                        <Icon className="h-7 w-7 text-[#F58220] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className="font-bold text-[#1A1A1A] group-hover:text-[#F58220] transition-colors line-clamp-1">
                        {category.name}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            /* Fallback if no APIs */
            <div className="col-span-full text-center text-gray-500 py-12">
              No categories found.
            </div>
          )}
        </div>
      </section>

      <section className="bg-gray-50 py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-6">
                Why Support Faith-Based Businesses?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                By choosing to work with businesses in our network, you're not just getting
                quality services—you're strengthening our community, supporting families,
                and ensuring your commerce aligns with your convictions.
              </p>
              <div className="space-y-4">
                {[
                  "Verified membership in FEM Family Church",
                  "Accountability through church leadership",
                  "Shared values and faith commitment",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#F58220] flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                    <span className="font-medium text-[#1A1A1A]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white rounded-3xl border border-gray-100 p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F58220]/5 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
                  <div className="text-5xl font-bold text-[#F58220] mb-4">1200+</div>
                  <p className="text-xl font-semibold text-[#1A1A1A]">Trusted Businesses</p>
                  <p className="text-gray-500 mt-2">Connecting believers across Kenya since 2020</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-[#F58220]/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
