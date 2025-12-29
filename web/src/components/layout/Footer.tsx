import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {/* Placeholder for Logo if needed, or just text */}
                            <div className="bg-[#F58220] p-1.5 rounded-lg">
                                <span className="font-bold text-xl text-white">FC</span>
                            </div>
                            <span className="font-bold text-xl">Faith Connect</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Connecting our faith community with trusted businesses and services.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[#F58220] transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[#F58220] transition-colors">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[#F58220] transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* For Community Members */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-[#F58220]">For Community Members</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/directory" className="text-gray-400 hover:text-white transition-colors">
                                    Explore Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                                    Profile
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                                    Learn More
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Business Owners */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-[#F58220]">For Business Owners</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">
                                    List Your Business
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                                    Manage Profile
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                                    Learn More
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact - Added based on request detail if needed, but keeping simple as per mockup text "Contact" implies these links */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-[#F58220]">Contact</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © 2025 Faith Connect. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        {/* Extra links if needed */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
