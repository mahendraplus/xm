import { Helmet } from 'react-helmet-async'
import { useAppStore } from '@/store/appStore'

const TermsPage = () => {
    const { navigate } = useAppStore()

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <Helmet><title>Terms & Conditions | Go-Biz</title></Helmet>

            <h1 className="text-3xl font-bold gradient-text">Terms & Conditions</h1>
            <p className="text-muted-foreground text-sm">Last updated: February 20, 2026</p>

            <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
                    <p>By accessing and using the Go-Biz platform ("Service"), you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our Service.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
                    <p>Go-Biz provides a B2B Data Validation API service that enables developers and businesses to validate, verify, and check data formats through our RESTful API endpoints. The Service is intended for lawful business use only.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
                    <p>To access the Service, you must register an account with a valid email address. You are responsible for maintaining the confidentiality of your account credentials, including your API key. You agree to notify us immediately of any unauthorized use of your account.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">4. API Credits & Billing</h2>
                    <p>The Service operates on a prepaid credit system. API credits are purchased in advance and deducted per API call based on the published pricing. Credits are non-transferable between accounts. Pricing is subject to change with prior notice.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">5. Acceptable Use</h2>
                    <p>You agree not to use the Service for any unlawful purpose, to violate any laws in your jurisdiction, to infringe upon the rights of others, to attempt to gain unauthorized access to the Service or its systems, or to interfere with the proper working of the Service.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
                    <p>All content, features, and functionality of the Service are owned by Go-Biz and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our Service without prior written consent.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
                    <p>Go-Biz shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">8. Termination</h2>
                    <p>We reserve the right to terminate or suspend your account at any time, with or without cause, with or without notice. Upon termination, your right to use the Service will immediately cease.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">9. Governing Law</h2>
                    <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Gujarat, India.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
                    <p>For any questions regarding these Terms, please contact us at <a href="mailto:mahendrakumargahelot@gmail.com" className="text-primary hover:underline">mahendrakumargahelot@gmail.com</a>.</p>
                </section>
            </div>

            <button onClick={() => navigate('home')} className="text-primary hover:underline text-sm">← Back to Home</button>
        </div>
    )
}

export default TermsPage
