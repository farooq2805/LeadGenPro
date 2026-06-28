import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Generate() {
  const [prompt, setPrompt] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.credits.get().then(setCredits).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.leads.generate({
        prompt,
        industry: industry || undefined,
        location: location || undefined,
        title: title || undefined,
        count,
      });
      navigate(`/results/${result.queryId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Generate Leads</h1>
        <p className="text-gray-400 text-sm mt-1">Describe your ideal customer and our AI will find matching leads.</p>
      </div>

      {credits && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="gradient-card px-4 py-2.5 text-sm">
            <span className="text-gray-400">Free credits: </span>
            <span className="text-white font-semibold">{credits.freeRemaining}</span>
            <span className="text-gray-500"> / {credits.totalFreeLeads}</span>
          </div>
          <div className="gradient-card px-4 py-2.5 text-sm">
            <span className="text-gray-400">Purchased: </span>
            <span className="text-white font-semibold">{credits.purchasedRemaining}</span>
          </div>
          <div className="gradient-card px-4 py-2.5 text-sm">
            <span className="text-gray-400">Total available: </span>
            <span className="text-white font-semibold">{credits.totalAvailable}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-xl mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="gradient-card p-6">
          <label className="block text-sm font-medium text-white mb-2">Describe Your Ideal Lead</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Senior software engineers at SaaS companies in San Francisco who are responsible for cloud infrastructure decisions..."
            required
            minLength={10}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors resize-none"
          />
          <p className="text-gray-500 text-xs mt-1">Be specific about industry, role, location, and any other criteria.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Industry (optional)</label>
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., SaaS, Healthcare" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Location (optional)</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., San Francisco, Remote" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Job Title (optional)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., CEO, CTO, VP Sales" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors" />
          </div>
        </div>

        <div className="gradient-card p-6">
          <label className="block text-sm font-medium text-white mb-2">Number of Leads</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="flex-1 accent-primary-500"
            />
            <span className="text-white font-semibold min-w-[3rem] text-center">{count}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>100</span>
          </div>
          {credits && count > credits.totalAvailable && (
            <p className="text-amber-400 text-xs mt-2">You only have {credits.totalAvailable} credits available. Purchase more to generate {count} leads.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (credits && count > credits.totalAvailable)}
          className="w-full gradient-btn py-3.5 rounded-xl text-lg disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
              Generating leads...
            </span>
          ) : (
            `Generate ${count} Leads${credits ? ` (${count > credits.freeRemaining ? `$${((count - credits.freeRemaining) * 0.2).toFixed(1)}` : 'Free'})` : ''}`
          )}
        </button>
      </form>
    </div>
  );
}
