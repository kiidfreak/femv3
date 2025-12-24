import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Users, Globe } from "lucide-react"

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-white py-24 sm:py-32">
            <div className="container relative z-10">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] sm:text-6xl">
                        Where <span className="text-[#F58220]">Faith</span> Meets Trusted Business
                    </h1>
                    <p className="mt-6 text-xl leading-8 text-gray-600">
                        Discover trusted businesses owned by fellow believers in our faith community.
                        Support local commerce while building meaningful relationships grounded in shared values.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/directory">
                            <Button size="lg" className="bg-[#F58220] hover:bg-[#D66D18] text-white gap-2">
                                Explore Directory <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/about">
                            <Button size="lg" variant="outline" className="border-[#F58220] text-[#F58220] hover:bg-[#F58220]/10">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
                    <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="h-12 w-12 rounded-full bg-[#F58220]/10 flex items-center justify-center mb-4">
                            <Users className="h-6 w-6 text-[#F58220]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#1A1A1A]">Active Community</h3>
                        <p className="text-gray-500 mt-2">Connecting believers across Kenya in a vibrant marketplace.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="h-12 w-12 rounded-full bg-[#F58220]/10 flex items-center justify-center mb-4">
                            <ShieldCheck className="h-6 w-6 text-[#F58220]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#1A1A1A]">Church Verified</h3>
                        <p className="text-gray-500 mt-2">Verified businesses you can trust, backed by church leadership.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="h-12 w-12 rounded-full bg-[#F58220]/10 flex items-center justify-center mb-4">
                            <Globe className="h-6 w-6 text-[#F58220]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#1A1A1A]">Kenya-wide Reach</h3>
                        <p className="text-gray-500 mt-2">Find trusted services from every corner of our community.</p>
                    </div>
                </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 blur-3xl opacity-10 pointer-events-none">
                <div className="h-[500px] w-[500px] rounded-full bg-[#F58220]" />
            </div>
        </section>
    )
}
