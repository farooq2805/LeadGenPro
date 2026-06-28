import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const features = [
  { title: 'AI-Powered Targeting', desc: 'Describe your ideal customer and our AI finds the perfect leads for you.' },
  { title: '50 Free Leads', desc: 'Get started with 50 free leads. No credit card required.' },
  { title: 'CSV Export', desc: 'Download all your leads as CSV with one click.' },
  { title: 'Email Notifications', desc: 'Get notified instantly when your leads are ready.' },
  { title: 'Smart Filtering', desc: 'Filter by industry, location, company size, and more.' },
  { title: 'Pay As You Grow', desc: 'Only $0.20 per lead after your free credits. No subscriptions.' },
];

const steps = [
  { num: '01', title: 'Describe Your Ideal Lead', desc: 'Tell us about your target audience — industry, role, location, company size.' },
  { num: '02', title: 'AI Finds the Matches', desc: 'Our engine searches and qualifies leads matching your criteria.' },
  { num: '03', title: 'Download & Connect', desc: 'Download your leads as CSV or view them in your dashboard.' },
];

const faqs = [
  { q: 'How do free leads work?', a: 'Every new user gets 50 free leads to try ProspectPro. No credit card required.' },
  { q: 'What happens after I use my free leads?', a: 'After your 50 free leads, you can purchase additional leads at $0.20 per lead.' },
  { q: 'How do I get my leads?', a: 'Leads are displayed in your dashboard and can be downloaded as CSV. We also send an email notification.' },
  { q: 'What kind of data do I get?', a: 'Each lead includes name, email, phone, company, title, LinkedIn URL, location, and industry.' },
  { q: 'Can I get refunds?', a: 'Yes, we offer full refunds on unused purchased leads within 30 days.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/50 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 text-sm text-primary-300 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            AI-Powered Lead Generation
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Find Your Next
            <br />
            <span className="gradient-text">Best Customers</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Describe your ideal customer. Our AI finds the leads — with names, emails, and LinkedIn profiles.
            Start with <span className="text-white font-semibold">50 free leads</span>, then pay only $0.20 per lead.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/generate" className="gradient-btn px-8 py-3.5 rounded-xl text-lg">Generate Leads Now</Link>
            ) : (
              <Link to="/signup" className="gradient-btn px-8 py-3.5 rounded-xl text-lg">Start Free — 50 Leads</Link>
            )}
            <Link to="/pricing" className="px-8 py-3.5 rounded-xl text-lg border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors">View Pricing</Link>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500">
            <span>✦ No credit card</span>
            <span>✦ 50 free leads</span>
            <span>✦ CSV export</span>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why ProspectPro?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Stop buying outdated lead lists. Get fresh, targeted leads that match exactly what you're looking for.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="gradient-card p-6 hover:border-primary-500/50 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Three simple steps to get high-quality leads.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">{s.num}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{s.title}</h3>
                <p className="text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-gray-400">Start free, pay only when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="gradient-card p-8 border-2 border-primary-500/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Free</div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-2">$0</div>
                <div className="text-gray-400">50 leads to start</div>
              </div>
              <ul className="space-y-3 text-sm text-gray-300 mb-8">
                <li className="flex items-center gap-2">✓ 50 free leads</li>
                <li className="flex items-center gap-2">✓ CSV download</li>
                <li className="flex items-center gap-2">✓ Email notifications</li>
                <li className="flex items-center gap-2">✓ Basic filters</li>
              </ul>
              {isAuthenticated ? (
                <Link to="/generate" className="block text-center gradient-btn py-3 rounded-xl">Start Generating</Link>
              ) : (
                <Link to="/signup" className="block text-center gradient-btn py-3 rounded-xl">Get 50 Free Leads</Link>
              )}
            </div>
            <div className="gradient-card p-8">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-2">$0.20</div>
                <div className="text-gray-400">per additional lead</div>
              </div>
              <ul className="space-y-3 text-sm text-gray-300 mb-8">
                <li className="flex items-center gap-2">✓ All free features</li>
                <li className="flex items-center gap-2">✓ Unlimited leads</li>
                <li className="flex items-center gap-2">✓ Priority support</li>
                <li className="flex items-center gap-2">✓ Advanced filters</li>
                <li className="flex items-center gap-2">✓ API access</li>
              </ul>
              {isAuthenticated ? (
                <Link to="/dashboard" className="block text-center gradient-btn py-3 rounded-xl">Buy Credits</Link>
              ) : (
                <Link to="/signup" className="block text-center gradient-btn py-3 rounded-xl">Get Started</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="gradient-card group">
                <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-gray-400 text-sm">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Find Your Next Customer?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Join thousands of businesses using ProspectPro to generate high-quality leads.</p>
          {isAuthenticated ? (
            <Link to="/generate" className="gradient-btn px-8 py-3.5 rounded-xl text-lg inline-block">Generate Leads Now</Link>
          ) : (
            <Link to="/signup" className="gradient-btn px-8 py-3.5 rounded-xl text-lg inline-block">Get 50 Free Leads</Link>
          )}
        </div>
      </section>
    </div>
  );
}
