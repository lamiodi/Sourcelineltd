import { useState, useEffect } from 'react';
import { 
  EnvelopeSimple, 
  Trash, 
  DownloadSimple, 
  MagnifyingGlass as Search,
  ArrowsClockwise,
  CheckCircle,
  UsersThree
} from '@phosphor-icons/react';
import { API_URL } from '../../config';

const SubscriberList = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/newsletter`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber from the newsletter list?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/newsletter/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting subscriber:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const exportToCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Subscribed Date', 'Email', 'Active'];
    const rows = subscribers.map(s => [
      new Date(s.subscribed_at || Date.now()).toLocaleDateString(),
      `"${s.email}"`,
      s.is_active !== false ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sourceline_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.email && s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <EnvelopeSimple className="text-primary h-7 w-7" />
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Audience subscribed to market updates, survey guides, and company news.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubscribers}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <ArrowsClockwise className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition disabled:opacity-50"
          >
            <DownloadSimple className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <UsersThree className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscribers</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{subscribers.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Status</span>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">100%</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <EnvelopeSimple className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery System</span>
            <p className="text-sm font-semibold text-gray-800 mt-1">Resend Verified</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by subscriber email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
            Loading subscribers...
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <EnvelopeSimple className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-gray-600">No subscribers found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'Try clearing your search keyword' : 'Subscribers who join via the Blog will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left">Email Address</th>
                  <th className="px-6 py-3.5 text-left">Date Subscribed</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id || subscriber.email} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <EnvelopeSimple className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${subscriber.email}`} className="hover:text-primary transition-colors">
                          {subscriber.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs font-mono">
                      {new Date(subscriber.subscribed_at || Date.now()).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        disabled={deletingId === subscriber.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Remove Subscriber"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
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
};

export default SubscriberList;
