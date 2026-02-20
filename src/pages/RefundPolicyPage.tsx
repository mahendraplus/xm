import { Helmet } from 'react-helmet-async'
import { useAppStore } from '@/store/appStore'

const RefundPolicyPage = () => {
    const { navigate } = useAppStore()

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <Helmet><title>Refund & Cancellation Policy | Go-Biz</title></Helmet>

            <h1 className="text-3xl font-bold gradient-text">Refund & Cancellation Policy</h1>
            <p className="text-muted-foreground text-sm">Last updated: February 20, 2026</p>

            <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">1. Refund Policy</h2>
                    <p>Refunds are processed within 7 days for unused API credits. Consumed credits are non-refundable.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">2. How to Request a Refund</h2>
                    <p>To request a refund for unused API credits, please contact us via email at <a href="mailto:mahendrakumargahelot@gmail.com" className="text-primary hover:underline">mahendrakumargahelot@gmail.com</a> with your registered email address and the amount you wish to refund. Our team will review your request and process eligible refunds within 7 business days.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">3. Cancellation</h2>
                    <p>You may cancel your account at any time by contacting our support team. Upon cancellation, any remaining unused credits may be refunded as per the refund policy above. Once your account is cancelled, you will no longer have access to the Service.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">4. Non-Refundable Items</h2>
                    <p>The following are non-refundable:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>API credits that have already been consumed (used for API calls)</li>
                        <li>Credits added as promotional or welcome bonuses</li>
                        <li>Accounts terminated due to violation of Terms & Conditions</li>
                    </ul>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">5. Refund Method</h2>
                    <p>Refunds will be processed to the original payment method used for the purchase. Bank processing times may vary and typically take 5-7 business days after the refund is initiated.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">6. Contact</h2>
                    <p>For refund or cancellation requests, contact us at:</p>
                    <ul className="list-none space-y-1 ml-2">
                        <li><strong>Email:</strong> <a href="mailto:mahendrakumargahelot@gmail.com" className="text-primary hover:underline">mahendrakumargahelot@gmail.com</a></li>
                        <li><strong>Phone:</strong> +91 98245 84454</li>
                    </ul>
                </section>
            </div>

            <button onClick={() => navigate('home')} className="text-primary hover:underline text-sm">← Back to Home</button>
        </div>
    )
}

export default RefundPolicyPage
