import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Get in Touch</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        We'd love to hear from you. Connect with our team and let's build something amazing together.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Contact Info Sidebar */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold mb-6">How to Reach Us</h3>
                                <p className="text-gray-500 mb-8">Multiple ways to connect with our team and get the support you need.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-orange-50 p-3 rounded-lg text-[#F58220]">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Email Us</h4>
                                        <p className="text-[#F58220] font-medium">info@faithconnect.biz</p>
                                        <p className="text-sm text-gray-500 mt-1">Send us an email anytime</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-orange-50 p-3 rounded-lg text-[#F58220]">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Call Us</h4>
                                        <p className="text-[#F58220] font-medium">0714777797</p>
                                        <p className="text-sm text-gray-500 mt-1">Mon-Fri from 8am to 6pm</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-orange-50 p-3 rounded-lg text-[#F58220]">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Visit Us</h4>
                                        <p className="text-gray-700 font-medium">Nairobi, Kenya</p>
                                        <p className="text-sm text-gray-500 mt-1">FEM Family Church Headquarters</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-orange-50 p-3 rounded-lg text-[#F58220]">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Office Hours</h4>
                                        <p className="text-gray-700 font-medium">Monday - Friday</p>
                                        <p className="text-sm text-gray-500 mt-1">9:00 AM - 5:00 PM EAT</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <Card className="border-gray-200 shadow-lg">
                                <CardContent className="p-8">
                                    <h3 className="text-2xl font-bold mb-2">Send Us a Message</h3>
                                    <p className="text-gray-500 mb-8">Have a question, suggestion, or just want to say hello? We'd love to hear from you.</p>

                                    <form className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input id="name" placeholder="John Doe" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input id="email" type="email" placeholder="john@example.com" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject</Label>
                                            <Input id="subject" placeholder="How can we help?" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message</Label>
                                            <Textarea id="message" placeholder="Type your message here..." className="min-h-[150px]" />
                                        </div>

                                        <Button className="w-full bg-[#F58220] hover:bg-[#D66D18] text-white font-bold h-12 text-lg">
                                            Send Message
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Additional Support Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mt-20">
                        <Card className="bg-blue-50 border-blue-100">
                            <CardContent className="p-6">
                                <h4 className="font-bold text-blue-900 mb-2">Community Support</h4>
                                <p className="text-sm text-blue-700">Get help with your account or business listing.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-100">
                            <CardContent className="p-6">
                                <h4 className="font-bold text-green-900 mb-2">Partnership Inquiries</h4>
                                <p className="text-sm text-green-700">Let's explore collaboration opportunities.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-purple-50 border-purple-100">
                            <CardContent className="p-6">
                                <h4 className="font-bold text-purple-900 mb-2">Feature Requests</h4>
                                <p className="text-sm text-purple-700">Help us improve our platform with your ideas.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    )
}
