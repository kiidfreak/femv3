import { Card, CardContent } from "@/components/ui/card"
import { Users, Store, Star, MapPin, ShieldCheck, Heart, TrendingUp, Handshake } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="bg-gray-50 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6">About Faith Connect</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Connecting faith-based businesses and community members through trust, support, and meaningful relationships.
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#F58220] mb-2">500+</div>
                            <div className="text-gray-600">Community Members</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#F58220] mb-2">200+</div>
                            <div className="text-gray-600">Businesses Listed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#F58220] mb-2">4.8</div>
                            <div className="text-gray-600">Average Rating</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-[#F58220] mb-2">15+</div>
                            <div className="text-gray-600">Counties Covered</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-6">Our Mission</h2>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                To create a thriving ecosystem where faith-based businesses can grow, community members can discover trusted services, and meaningful connections can flourish through shared values and mutual support.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                We believe that when businesses operate with integrity, faith, and community spirit, everyone benefits - from the entrepreneur to the customer, and the entire community.
                            </p>
                        </div>
                        <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100">
                            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-6">Our Vision</h2>
                            <p className="text-gray-600 leading-relaxed">
                                To become the leading platform for faith-based business networking, fostering economic growth while maintaining spiritual values and community bonds.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Our Core Values</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            The principles that guide everything we do and every connection we make.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Card className="border-none shadow-md hover:shadow-xl transition-all">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart className="h-6 w-6 text-[#F58220]" />
                                </div>
                                <h3 className="font-bold text-lg mb-3">Faith-Based Community</h3>
                                <p className="text-sm text-gray-500">
                                    Built on shared spiritual values and trust, creating meaningful connections beyond business.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-xl transition-all">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck className="h-6 w-6 text-[#F58220]" />
                                </div>
                                <h3 className="font-bold text-lg mb-3">Trusted Network</h3>
                                <p className="text-sm text-gray-500">
                                    Verified businesses and community members ensure quality and reliability in every interaction.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-xl transition-all">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Handshake className="h-6 w-6 text-[#F58220]" />
                                </div>
                                <h3 className="font-bold text-lg mb-3">Mutual Support</h3>
                                <p className="text-sm text-gray-500">
                                    Supporting local businesses while building lasting relationships within our faith community.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md hover:shadow-xl transition-all">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="h-6 w-6 text-[#F58220]" />
                                </div>
                                <h3 className="font-bold text-lg mb-3">Growth & Development</h3>
                                <p className="text-sm text-gray-500">
                                    Empowering entrepreneurs to grow their businesses through community support and networking.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">What We Offer</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {["Business Directory & Discovery", "Service & Product Showcases", "Community Reviews & Ratings", "Business Registration & Management", "Faith-Based Networking Events", "Local Business Support Programs"].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                                <div className="h-2 w-2 rounded-full bg-[#F58220]" />
                                <span className="font-medium text-gray-700">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#1A1A1A] text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                        Ready to connect with faith-based businesses or list your own? Start your journey with Faith Connect today.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/auth/signup">
                            <Button size="lg" className="bg-[#F58220] hover:bg-[#D66D18] text-white">
                                Get Started Today
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/10 hover:text-white">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
