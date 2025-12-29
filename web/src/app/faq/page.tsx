import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] mb-4">Frequently Asked Questions</h1>
                <p className="text-lg text-gray-600">Find answers to common questions about Faith Connect Business Directory</p>
            </div>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-[#F58220] mb-4">General Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What is Faith Connect?</AccordionTrigger>
                            <AccordionContent>
                                Faith Connect Business Directory is a platform that connects faith-based businesses with community members. It allows businesses to showcase their services and helps community members find trusted businesses within their faith community.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Is it free to join?</AccordionTrigger>
                            <AccordionContent>
                                No, both business registration and community membership are completely free. We believe in supporting our faith community without financial barriers.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>How do I contact support?</AccordionTrigger>
                            <AccordionContent>
                                If you encounter any issues, you can contact us through the 'About' page or email us directly at info@faithconnect.biz. We typically respond within 24 hours.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>I forgot my password. What should I do?</AccordionTrigger>
                            <AccordionContent>
                                We use a secure passwordless login system. Simply enter your email or phone number on the Sign In page, and we'll send you a One-Time Password (OTP) to verify your identity and log you in. No password to remember!
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#F58220] mb-4">Business Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="bus-1">
                            <AccordionTrigger>How do I register my business?</AccordionTrigger>
                            <AccordionContent>
                                To register your business, click on 'Register Business' in the navigation menu. You'll need to provide business details, contact information, and verify your faith community membership. The process takes about 5-10 minutes.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="bus-2">
                            <AccordionTrigger>Can I update my business listing later?</AccordionTrigger>
                            <AccordionContent>
                                Yes! Business owners can log in and update their business information, add new services, upload photos, and manage their profile at any time through the 'Manage Business' section.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="bus-3">
                            <AccordionTrigger>How do you verify businesses?</AccordionTrigger>
                            <AccordionContent>
                                We verify businesses through faith community membership confirmation, business registration documents, and community feedback. This ensures all businesses on our platform are legitimate and faith-aligned.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="bus-4">
                            <AccordionTrigger>What types of businesses can join?</AccordionTrigger>
                            <AccordionContent>
                                Any faith-based business can join, including retail, services, professional services, food and beverage, health and wellness, and more. The key requirement is that the business owner shares our faith values.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="bus-5">
                            <AccordionTrigger>Can I remove my listing?</AccordionTrigger>
                            <AccordionContent>
                                Yes, business owners can deactivate or remove their listing at any time through their business management dashboard. You can also temporarily hide your listing if needed.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-[#F58220] mb-4">Community Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="com-1">
                            <AccordionTrigger>How do I join as a community member?</AccordionTrigger>
                            <AccordionContent>
                                Click on 'Register' in the navigation menu and select 'Community Member'. You'll need to provide your name, contact information, and faith community details. Registration is free and takes just a few minutes.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="com-2">
                            <AccordionTrigger>How do I contact a business?</AccordionTrigger>
                            <AccordionContent>
                                Once you find a business you're interested in, you can view their profile, see contact information, and reach out directly. Some businesses also offer direct messaging through the platform.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="com-3">
                            <AccordionTrigger>How do I find businesses near me?</AccordionTrigger>
                            <AccordionContent>
                                Use the search and filter options on the Business Directory page. You can search by location, category, service type, or business name. The platform also shows businesses near your location.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>

            <div className="mt-16 bg-orange-50 rounded-2xl p-8 text-center border border-orange-100">
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Still Have Questions?</h3>
                <p className="text-gray-600 mb-6">Can't find the answer you're looking for? We're here to help!</p>
                <div className="flex flex-col md:flex-row justify-center gap-8 text-left max-w-lg mx-auto">
                    <div>
                        <p className="font-bold text-[#F58220]">Email</p>
                        <p className="text-gray-800">info@faithconnect.biz</p>
                    </div>
                    <div>
                        <p className="font-bold text-[#F58220]">Phone</p>
                        <p className="text-gray-800">0714777797</p>
                    </div>
                    <div>
                        <p className="font-bold text-[#F58220]">Response Time</p>
                        <p className="text-gray-800">Within 24 hours</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
