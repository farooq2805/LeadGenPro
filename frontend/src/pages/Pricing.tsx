import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Pricing() {
  const { isAuthenticated } = useAuth();

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'one-time',
      leads: '50',
      desc: 'Perfect for testing the waters.',
      features: [
        '50 free leads',
        'CSV download',
        'Email notifications',
        'Basic filters',
        'Standard support',
      ],
      cta: isAuthenticated ? 'Start Generating' : 'Get 50 Free Leads',
      href: isAuthenticated ? '/generate' : '/signup',
      popular: false,
    },
    {
      name: 'Pay As You Go',
      price: '$0.20',
      period: 'per lead',
      leads: 'Unlimited',
      desc: 'Buy credits as you need them.',
      features: [
        'All Starter features',
        'Unlimited leads',
        'Advanced filters',
        'Priority support',
        'API access',
        'Team sharing',
      ],
      cta: isAuthenticated ? 'Buy Credits' : 'Get Started',
      href: isAuthenticated ? '/dashboard' : '/signup',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'negotiable',
      leads: 'Unlimited',
      desc: 'For teams and agencies at scale.',
      features: [
        'Everything in Pay As You Go',
        'Bulk discounts ($0.10/lead)',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Invoice billing',
      ],
      cta: 'Contact Us',
      href: '#contact',
      popular: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Start with 50 free leads. Pay only when you need more. No subscriptions, no hidden fees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={`gradient-card p-8 flex flex-col ${plan.popular ? 'border-2 border-primary-500 relative' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">Most Popular</div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 text-sm">/{plan.period}</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">{plan.desc}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-4">
                <span className="text-white font-semibold">{plan.leads}</span> leads total
              </p>
              <ul className="space-y-3 text-sm text-gray-300 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link to={plan.href} className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
              plan.popular ? 'gradient-btn' : 'border border-gray-700 text-gray-300 hover:border-gray-500'
            }`}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 gradient-card p-8 max-w-3xl mx-auto text-center">
        <h3 className="text-xl font-bold text-white mb-2">How Pricing Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 text-left">
          <div>
            <div className="text-2xl font-bold gradient-text mb-1">50</div>
            <p className="text-gray-400 text-sm">Free leads on signup</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">$0.20</div>
            <p className="text-gray-400 text-sm">Per additional lead</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">Free</div>
            <p className="text-gray-400 text-sm">To keep your leads</p>
          </div>
        </div>
      </div>
    </div>
  );
}
