import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Users, Globe, MapPin } from "lucide-react"

export function Hero() {
    return (
        <section className="relative overflow-hidden min-h-[600px] flex items-center">
            {/* Background Image utilizing Wheat Field concept with overlay */}
            <div className="absolute inset-0 z-0">
                {/* Using a warm, golden gradient to simulate the wheat field vibe if no image is available, or a placeholder */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-yellow-200 to-orange-100 opacity-20" />
                {/* This would ideally be the wheat field image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            <div className="container relative z-10 pt-20 pb-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-left max-w-2xl">

                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-[#1A1A1A] mb-2">
                            Welcome to
                        </h1>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-[#F58220] mb-6">
                            Faith Connect
                        </h1>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                            Business Directory
                        </h2>

                        <div className="h-1 w-20 bg-[#F58220] mb-6"></div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Connecting Faith-Based Commerce
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
                            Discover trusted businesses owned by fellow believers in our faith community.
                            Support local commerce while building meaningful relationships grounded in shared faith and values.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link href="/directory">
                                <Button size="lg" className="bg-[#F58220] hover:bg-[#D66D18] text-white h-12 px-8 text-base">
                                    Find Trusted Businesses <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button size="lg" variant="outline" className="border-[#F58220] text-[#F58220] hover:bg-[#F58220]/10 h-12 px-8 text-base">
                                    Join Our Community
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mt-12 border-t border-gray-200 pt-8">
                            <div>
                                <div className="text-3xl font-bold text-[#1A1A1A]">70+</div>
                                <div className="text-sm text-gray-600 font-medium">Local Businesses</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#1A1A1A]">Active</div>
                                <div className="text-sm text-gray-600 font-medium">Community</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#1A1A1A]">Kenya-wide</div>
                                <div className="text-sm text-gray-600 font-medium">Network Reach</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Visual - Church Leader Preaching concept or Community Collage */}
                    <div className="relative hidden lg:block">
                        <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl skew-y-1">
                            <div className="absolute inset-0 bg-gray-200" />
                            {/* Placeholder for "Church leader preaching" or generic community image */}
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=2834&auto=format&fit=crop')] bg-cover bg-center" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            <div className="absolute bottom-8 left-8 text-white p-6 backdrop-blur-md bg-white/10 rounded-xl border border-white/20 max-w-sm">
                                <p className="font-medium text-lg">"Connecting believers across Kenya in a vibrant marketplace."</p>
                                <div className="flex items-center gap-2 mt-4 text-sm text-orange-200">
                                    <MapPin className="h-4 w-4" />
                                    <span>Faith Connect Community</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -left-8 top-20 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                            <div className="bg-orange-100 p-3 rounded-full">
                                <ShieldCheck className="h-8 w-8 text-[#F58220]" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">Church Verified</div>
                                <div className="text-xs text-gray-500">Trusted Partners</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Scroll Down Indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer z-20" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                <div className="p-2 bg-white/30 backdrop-blur-sm rounded-full border border-white/20 text-[#1A1A1A] hover:bg-white/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="m7 13 5 5 5-5" />
                        <path d="M12 5v13" />
                    </svg>
                </div>
            </div>
        </section>
    )
}
