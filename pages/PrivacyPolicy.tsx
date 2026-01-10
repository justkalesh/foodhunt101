import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">PRIVACY POLICY FOR FOOD-HUNT</h1>
                <p className="text-sm text-gray-500 mb-8">Last Updated: December 16, 2025</p>

                <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
                    <section>
                        <p>FOOD-HUNT ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application. This application is owned and operated by Kalash Mani Tripathi.</p>
                        <p className="mt-2">By accessing or using FOOD-HUNT, you consent to the data practices described in this policy.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
                        <p>We collect information that you voluntarily provide to us when you register for the application or interact with its features.</p>

                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2">A. Personal Data</h3>
                        <p>When you register, we may collect personally identifiable information, such as:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Name:</strong> To display on your profile.</li>
                            <li><strong>Email Address:</strong> For account verification, password recovery, and support.</li>
                            <li><strong>Password:</strong> Encrypted and stored for authentication.</li>
                            <li><strong>Profile Picture Links:</strong> We store the links to images you provide for your profile picture. We do not host the image files ourselves.</li>
                        </ul>

                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2">B. User-Generated Content</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>"Splits":</strong> Any content you post to the public feed (e.g., looking for food partners) is publicly visible to other users. You should not post sensitive personal information in these public splits.</li>
                            <li><strong>Chat Messages:</strong> We facilitate direct messaging between users. While these messages are encrypted during transmission, we store chat history to allow you to access your previous conversations.</li>
                        </ul>

                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2">C. Usage Data</h3>
                        <p>We automatically collect certain information when you visit the app, including:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>IP address</li>
                            <li>Browser type and version</li>
                            <li>Operating system</li>
                            <li>Time and date of your visit</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Create and manage your account.</li>
                            <li><strong>Facilitate connections:</strong> To display your public profile and "Splits" so other users can find you.</li>
                            <li><strong>Communication:</strong> To send you administrative information (e.g., password resets).</li>
                            <li><strong>Safety:</strong> To monitor for harassment or violations of our Terms and Conditions.</li>
                            <li><strong>Future Improvements:</strong> We may use data to implement future features like location-based recommendations or food ordering.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Disclosure of Your Information</h2>
                        <p>We do not sell your personal information. We may share information in the following situations:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Publicly Visible Information:</strong> Your username, profile picture, and "Splits" are visible to all registered users of the app.</li>
                            <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency in India).</li>
                            <li><strong>Service Providers:</strong> We may share data with third-party vendors who perform services for us, such as data hosting (e.g., Firebase, AWS) or email delivery services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Third-Party Websites</h2>
                        <p>Our application may contain links to third-party websites (e.g., Zomato, Swiggy, restaurant websites, or image hosting sites). We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review their privacy policies before providing them with any personal information.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Security of Your Information</h2>
                        <p>We use administrative, technical, and physical security measures to help protect your personal information (including encryption for passwords and chats). However, please be aware that no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Location Data</h2>
                        <p>Currently, GPS is not mandatory. However, if we introduce location-based features in the future, we will request your explicit permission before collecting your precise location data.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Policy for Minors</h2>
                        <p>We do not knowingly solicit information from or market to children under the age of 18. If we learn that we have collected personal information from a child under age 18 without verification of parental consent, we will delete that information as quickly as possible.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Changes to This Privacy Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date of this policy. You are advised to review this Privacy Policy periodically for any changes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Contact Us (Grievance Redressal)</h2>
                        <p>If you have questions or comments about this Privacy Policy, or if you wish to report a privacy concern, please contact us at:</p>
                        <div className="mt-2">
                            <p><strong>Email:</strong> <a href="mailto:foodhunt101lpu@gmail.com" className="text-primary-600 hover:underline">foodhunt101lpu@gmail.com</a></p>
                            <p><strong>Owner:</strong> Kalash Mani Tripathi</p>
                            <p><strong>Location:</strong> Jalandhar, Punjab, India</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
