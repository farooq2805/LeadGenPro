import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.leads.get(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link to="/dashboard" className="text-primary-400 hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const leads = data?.leads || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Results</h1>
          <p className="text-gray-400 text-sm mt-1">{leads.length} leads generated</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <a
            href={api.leads.downloadUrl(id!)}
            className="gradient-btn px-5 py-2.5 rounded-lg text-sm inline-block text-center"
          >
            Download CSV
          </a>
          <Link to="/generate" className="px-5 py-2.5 rounded-lg text-sm border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors inline-block text-center">
            New Search
          </Link>
        </div>
      </div>

      <div className="gradient-card p-5 mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-1">Your Prompt</h3>
        <p className="text-white">{data?.prompt}</p>
        {(data?.industry || data?.location || data?.title) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {data.industry && <span className="bg-primary-500/10 text-primary-300 px-2.5 py-1 rounded-full text-xs">{data.industry}</span>}
            {data.location && <span className="bg-primary-500/10 text-primary-300 px-2.5 py-1 rounded-full text-xs">{data.location}</span>}
            {data.title && <span className="bg-primary-500/10 text-primary-300 px-2.5 py-1 rounded-full text-xs">{data.title}</span>}
          </div>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="gradient-card p-12 text-center">
          <p className="text-gray-500">No leads found for this query.</p>
        </div>
      ) : (
        <div className="gradient-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-gray-800/50 text-sm hover:bg-gray-800/30">
                    <td className="p-4 text-white font-medium">{lead.name}</td>
                    <td className="p-4 text-gray-300">{lead.email || '-'}</td>
                    <td className="p-4 text-gray-300">{lead.company || '-'}</td>
                    <td className="p-4 text-gray-300">{lead.title || '-'}</td>
                    <td className="p-4 text-gray-300">{lead.location || '-'}</td>
                    <td className="p-4">
                      {lead.score && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          lead.score >= 80 ? 'bg-green-500/10 text-green-400' :
                          lead.score >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>{lead.score}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
            Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
