import { useState, useEffect } from 'react';
import { 
  MagnifyingGlass as Search, 
  Trash, 
  WhatsappLogo, 
  EnvelopeSimple, 
  DownloadSimple, 
  Eye, 
  X, 
  ChatTeardropText,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { API_URL } from '../../config';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/contact`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/contact/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setContacts(prev => prev.filter(c => c.id !== id));
        if (selectedContact?.id === id) setSelectedContact(null);
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const exportToCSV = () => {
    if (contacts.length === 0) return;
    const headers = ['Date', 'Name', 'Email', 'Phone', 'Message'];
    const rows = contacts.map(c => [
      new Date(c.created_at || Date.now()).toLocaleString(),
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sourceline_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredContacts = contacts.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.message && c.message.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ChatTeardropText className="text-primary h-7 w-7" />
            Client Inquiries & Leads
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage quote requests, contact submissions, and customer inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchContacts}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            title="Refresh Inquiries"
          >
            <ArrowsClockwise className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={contacts.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition disabled:opacity-50"
          >
            <DownloadSimple className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Leads</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{contacts.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filtered Results</span>
          <p className="text-2xl font-bold text-primary mt-1">{filteredContacts.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Latest Inquiry</span>
          <p className="text-sm font-medium text-gray-700 mt-2 truncate">
            {contacts.length > 0 ? new Date(contacts[0].created_at).toLocaleDateString() : 'None'}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone, or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Inquiries Table */}
      <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
            Loading inquiries...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <ChatTeardropText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-gray-600">No inquiries found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'Try clearing your search keyword' : 'New inquiries from the contact form will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left">Date</th>
                  <th className="px-6 py-3.5 text-left">Client</th>
                  <th className="px-6 py-3.5 text-left">Contact Info</th>
                  <th className="px-6 py-3.5 text-left">Message Snippet</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredContacts.map((contact) => {
                  const phoneClean = (contact.phone || '').replace(/[^0-9]/g, '');
                  const waNumber = phoneClean.startsWith('0') 
                    ? '234' + phoneClean.slice(1) 
                    : phoneClean.startsWith('234') 
                      ? phoneClean 
                      : '234' + phoneClean;
                  const waUrl = phoneClean ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello ${contact.name}, this is Sourceline Limited regarding your survey inquiry.`)}` : null;

                  return (
                    <tr key={contact.id || Math.random()} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs font-mono">
                        {new Date(contact.created_at || Date.now()).toLocaleDateString()}<br />
                        <span className="text-[10px] text-gray-400">{new Date(contact.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-900">{contact.name}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <EnvelopeSimple className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <a href={`mailto:${contact.email}`} className="hover:text-primary hover:underline">{contact.email}</a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-gray-600 font-mono">
                            <span className="text-gray-400">Tel:</span>
                            <a href={`tel:${contact.phone}`} className="hover:text-primary">{contact.phone}</a>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 line-clamp-2 max-w-xs text-xs leading-relaxed">
                          {contact.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="inline-flex items-center p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition"
                          title="View Full Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Chat on WhatsApp"
                          >
                            <WhatsappLogo className="h-4 w-4" />
                          </a>
                        )}
                        <a
                          href={`mailto:${contact.email}?subject=Regarding your inquiry — Sourceline Limited`}
                          className="inline-flex items-center p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Send Email"
                        >
                          <EnvelopeSimple className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          disabled={deletingId === contact.id}
                          className="inline-flex items-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-secondary mb-1">{selectedContact.name}</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">
              Received: {new Date(selectedContact.created_at || Date.now()).toLocaleString()}
            </p>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100 mb-6">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Email</span>
                <p className="font-medium text-gray-900">{selectedContact.email}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Phone</span>
                <p className="font-medium text-gray-900">{selectedContact.phone || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase mb-1 block">Inquiry Message</span>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {selectedContact.message}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedContact.phone && (
                <a
                  href={`https://wa.me/${selectedContact.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium inline-flex items-center gap-2 shadow-sm"
                >
                  <WhatsappLogo className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactList;
