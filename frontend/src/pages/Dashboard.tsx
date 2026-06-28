import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Dashboard() {
  const { user } = useAuth();
  const [queries, setQueries] = useState<any[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.leads.list().then(setQueries).catch(() => {}),
      api.credits.get().then(setCredits).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const totalLeadsGenerated = queries.reduce((sum: number, q: any) => sum + q._count?.leads || 0, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome back, {user?.name}</p>
        </div>
        <Link to="/generate" className="gradient-btn px-6 py-2.5 rounded-lg text-sm mt-4 sm:mt-0 inline-block text-center">
          New Lead Generation
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="gradient-card p-5">
          <p className="text-gray-400 text-sm mb-1">Free Leads Left</p>
          <p className="text-3xl font-bold text-white">{credits?.freeRemaining ?? 0}</p>
          <p className="text-xs text-gray-500">of {credits?.totalFreeLeads ?? 50} free</p>
        </div>
        <div className="gradient-card p-5">
          <p className="text-gray-400 text-sm mb-1">Purchased Credits</p>
          <p className="text-3xl font-bold text-white">{credits?.purchasedRemaining ?? 0}</p>
          <p className="text-xs text-gray-500">available to use</p>
        </div>
        <div className="gradient-card p-5">
          <p className="text-gray-400 text-sm mb-1">Total Generated</p>
          <p className="text-3xl font-bold text-white">{totalLeadsGenerated}</p>
          <p className="text-xs text-gray-500">leads across all queries</p>
        </div>
        <div className="gradient-card p-5">
          <p className="text-gray-400 text-sm mb-1">Queries Run</p>
          <p className="text-3xl font-bold text-white">{queries.length}</p>
        </div>
      </div>

      {credits && credits.freeRemaining === 0 && credits.purchasedRemaining === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-5 py-3 rounded-xl mb-8 text-sm flex items-center justify-between">
          <span>You've used all your credits. Purchase more to continue generating leads.</span>
          <Link to="/dashboard" className="text-white font-semibold underline ml-2">Buy Credits</Link>
        </div>
      )}

      <div className="gradient-card overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Recent Lead Generations</h2>
        </div>
        {queries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No lead generations yet</p>
            <Link to="/generate" className="gradient-btn px-6 py-2.5 rounded-lg text-sm inline-block">
              Generate Your First Leads
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                  <th className="p-4 font-medium">Prompt</th>
                  <th className="p-4 font-medium">Leads</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((q) => (
                  <tr key={q.id} className="border-b border-gray-800/50 text-sm hover:bg-gray-800/30">
                    <td className="p-4 text-white max-w-xs truncate">{q.prompt}</td>
                    <td className="p-4 text-gray-300">{q._count?.leads ?? 0}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        q.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                        q.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>{q.status}</span>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Link to={`/results/${q.id}`} className="text-primary-400 hover:text-primary-300 transition-colors">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
