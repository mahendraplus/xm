import { Helmet } from 'react-helmet-async'
import { Mail, Phone, MapPin, User, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/appStore'

const ContactUsPage = () => {
    const { navigate } = useAppStore()

    const contactInfo = [
        { icon: User, label: 'Legal Name', value: 'Mahendra Mali' },
        { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with Support', href: 'https://wa.me/919824584454' },
        { icon: Mail, label: 'Email', value: 'mahendrakumargahelot@gmail.com', href: 'mailto:mahendrakumargahelot@gmail.com' },
        { icon: Phone, label: 'Phone', value: '+91 98245 84454', href: 'tel:+919824584454' },
        { icon: MapPin, label: 'Address', value: 'Bhabhar, Gujarat, 385320, India' },
    ]

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <Helmet><title>Contact Us | Go-Biz</title></Helmet>

            <h1 className="text-3xl font-bold gradient-text">Contact Us</h1>
            <p className="text-muted-foreground">Get in touch with us for any queries, support, or feedback.</p>

            <div className="grid gap-4 md:grid-cols-2">
                {contactInfo.map((item) => (
                    <Card key={item.label} className="glass hover:border-primary/30 transition-all">
                        <CardContent className="p-5 flex items-start gap-4">
                            <div className="p-2.5 rounded-lg bg-primary/10">
                                <item.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                                {item.href ? (
                                    <a href={item.href} className="text-foreground font-medium hover:text-primary transition-colors">
                                        {item.value}
                                    </a>
                                ) : (
                                    <p className="text-foreground font-medium">{item.value}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="glass">
                <CardContent className="p-6 space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Business Hours</h2>
                    <p className="text-sm text-muted-foreground">Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
                    <p className="text-sm text-muted-foreground">Sunday: Closed</p>
                    <p className="text-sm text-muted-foreground mt-2">We typically respond to emails within 24 hours on business days.</p>
                </CardContent>
            </Card>

            <button onClick={() => navigate('home')} className="text-primary hover:underline text-sm">← Back to Home</button>
        </div>
    )
}

export default ContactUsPage
