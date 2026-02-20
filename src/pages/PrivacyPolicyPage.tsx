import { Helmet } from 'react-helmet-async'
import { useAppStore } from '@/store/appStore'

const PrivacyPolicyPage = () => {
    const { navigate } = useAppStore()

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <Helmet><title>Privacy Policy | Go-Biz</title></Helmet>

            <h1 className="text-3xl font-bold gradient-text">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm">Last updated: February 20, 2026</p>

            <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
                    <p>We collect information you provide during account registration, including your name and email address. We also collect usage data such as API call logs, timestamps, and IP addresses for service improvement and security purposes.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">2. How We Process API Requests</h2>
                    <p>All API requests are processed securely using industry-standard TLS 1.3 encryption. Request data is processed in real-time and is not stored beyond the session unless explicitly required for billing purposes. We do not share, sell, or distribute any data processed through our API to third parties.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">3. Data Security</h2>
                    <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encrypted data transmission, secure server infrastructure, and regular security audits.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">4. Data Retention</h2>
                    <p>Account information is retained for as long as your account is active. API call logs are retained for billing and audit purposes for a period of 12 months. You may request deletion of your account and associated data at any time.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">5. Cookies & Local Storage</h2>
                    <p>We use local storage to maintain your session preferences such as theme settings and authentication tokens. We do not use third-party tracking cookies. Essential cookies may be used for authentication and security.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">6. Third-Party Services</h2>
                    <p>We use Razorpay as our payment gateway. Razorpay processes payment information under their own privacy policy. We do not store your payment card details on our servers.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">7. Your Rights</h2>
                    <p>You have the right to access, correct, or delete your personal data. You may also request a copy of the data we hold about you. To exercise these rights, contact us at the email address below.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">8. Contact</h2>
                    <p>For privacy-related inquiries, contact us at <a href="mailto:mahendrakumargahelot@gmail.com" className="text-primary hover:underline">mahendrakumargahelot@gmail.com</a>.</p>
                </section>
            </div>

            <button onClick={() => navigate('home')} className="text-primary hover:underline text-sm">← Back to Home</button>
        </div>
    )
}

export default PrivacyPolicyPage
