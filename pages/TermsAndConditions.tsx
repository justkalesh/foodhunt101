import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-primary-600 hover:underline mb-6"
            >
                <ArrowLeft size={20} /> Back
            </button>

            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">TERMS AND CONDITIONS FOR FOOD-HUNT</h1>
                <p className="text-sm text-gray-500 mb-8">Last Updated: December 16, 2025</p>

                <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
                        <p>Welcome to FOOD-HUNT ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our web application and services. This web application is owned and operated by Kalash Mani Tripathi.</p>
                        <p className="mt-2">By accessing or using FOOD-HUNT, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Eligibility</h2>
                        <p>By using our service, you represent and warrant that you are at least 18 years of age. We do not knowingly collect information from or direct our services to anyone under the age of 18.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. User Accounts & Registration</h2>
                        <p>To use certain features (such as posting a "Split" or using the chat), you may be required to register for an account.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during the registration process.</li>
                            <li><strong>Security:</strong> You are responsible for safeguarding the password that you use to access the service. You agree not to disclose your password to any third party.</li>
                            <li><strong>Termination:</strong> We reserve the right to suspend or terminate your account immediately, without prior notice or liability, if you breach these Terms.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Social Features, Chat, and Safety ("Find Friends")</h2>
                        <p>FOOD-HUNT allows users to post "Splits," view public profiles, and chat directly with other users.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>User Interactions:</strong> You are solely responsible for your interactions with other users. FOOD-HUNT acts only as a platform to connect users.</li>
                            <li><strong>"At Your Own Risk":</strong> You acknowledge that your use of the chat feature and any offline meetups resulting from "Splits" are at your own sole risk. We do not conduct criminal background checks on our users.</li>
                            <li><strong>Chat Privacy:</strong> While chats are encrypted, we cannot monitor private conversations. However, we take safety seriously. You may report abusive behavior or harassment to <a href="mailto:foodhunt101lpu@gmail.com" className="text-primary-600 hover:underline">foodhunt101lpu@gmail.com</a>.</li>
                            <li><strong>Release of Liability:</strong> You agree to release Kalash Mani Tripathi and FOOD-HUNT from any claims, demands, and damages arising out of disputes with other users or bodily injury/harm resulting from offline meetings.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Subscriptions and Payments</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Freemium Model:</strong> FOOD-HUNT is free to use, but certain premium features may require a subscription.</li>
                            <li><strong>Billing:</strong> If you choose to purchase a subscription, you agree to pay the fees and taxes (if applicable) quoted at the time of purchase.</li>
                            <li><strong>Ads:</strong> You acknowledge that we may display third-party advertisements in the future as part of the service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. User Content (Profile Pictures)</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Image Links:</strong> You are permitted to provide links for your profile pictures (PFPs). You must ensure that any link you provide directs to content you have the right to use.</li>
                            <li><strong>Prohibited Links:</strong> You may not provide links to content that is offensive, pornographic, illegal, or contains malware/viruses. We reserve the right to remove any such links and ban the offending user.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Disclaimers</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Service Availability:</strong> The service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the service will be uninterrupted or error-free.</li>
                            <li><strong>No Food Liability:</strong> FOOD-HUNT is a discovery and social platform. We do not prepare, sell, or deliver food (unless explicitly stated in a future update). We are not responsible for the quality, safety, or pricing of food at any restaurant or vendor listed on the platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Future Features (GPS & Delivery)</h2>
                        <p>We are constantly evolving. We reserve the right to update the service to include:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Location Services:</strong> We may request GPS access in the future to improve food discovery.</li>
                            <li><strong>Ordering/Delivery:</strong> We may introduce food ordering features. Specific terms regarding payments and delivery responsibilities will be added to this document at that time.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Limitation of Liability</h2>
                        <p>To the maximum extent permitted by applicable law, in no event shall Kalash Mani Tripathi be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, data, or other intangible losses, arising out of or relating to the use of, or inability to use, the service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Jalandhar, Punjab.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">11. Contact Us</h2>
                        <p>If you have any questions about these Terms, or to report user issues, please contact us at:</p>
                        <p className="mt-2 font-medium">Email: <a href="mailto:foodhunt101lpu@gmail.com" className="text-primary-600 hover:underline">foodhunt101lpu@gmail.com</a></p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
