import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { 
  Phone, 
  Clock, 
  Calendar,
  User,
  FileText,
  DollarSign,
  ArrowLeft,
  Download,
  ExternalLink,
  Mic,
  FileAudio,
  Database,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function CallDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ensure the user is authenticated before fetching data
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('authenticated');
      if (isAuth !== 'true') {
        router.replace('/');
        return;
      }
    }
    if (!id) return;
    
    const fetchCall = async () => {
      try {
        const res = await fetch(`/api/calls/${id}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to fetch call details');
        }
        const data = await res.json();
        setCall(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCall();
  }, [id, router]);

  const formatDuration = (ms) => {
    const sec = Math.floor(ms / 1000);
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Call Details</h1>
        <p className="text-gray-600 mt-2">Call ID: {id}</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading call details...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {!loading && call && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-xl font-bold text-slate-900">
                    {call.duration_ms ? formatDuration(call.duration_ms) : '-'}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="text-xl font-bold text-slate-900">
                    {call.call_status || '-'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  call.call_status === 'ended' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Phone className={`w-6 h-6 ${
                    call.call_status === 'ended' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sentiment</p>
                  <p className="text-xl font-bold text-slate-900">
                    {call.call_analysis?.user_sentiment || '-'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  call.call_analysis?.user_sentiment === 'Positive' ? 'bg-green-100' :
                  call.call_analysis?.user_sentiment === 'Negative' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  <User className={`w-6 h-6 ${
                    call.call_analysis?.user_sentiment === 'Positive' ? 'text-green-600' :
                    call.call_analysis?.user_sentiment === 'Negative' ? 'text-red-600' :
                    'text-gray-600'
                  }`} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                  <p className="text-xl font-bold text-slate-900">
                    ${call.call_cost?.combined_cost || '0.00'}
                  </p>
                </div>
                <div className="bg-gold-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-gold-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Call Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-gold-500" />
              Call Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="text-base font-medium text-slate-900 mt-1">
                  {call.start_timestamp ? formatDate(call.start_timestamp) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Time</p>
                <p className="text-base font-medium text-slate-900 mt-1">
                  {call.end_timestamp ? formatDate(call.end_timestamp) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Agent ID</p>
                <p className="text-base font-medium text-slate-900 mt-1">
                  {call.agent_id || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Call Successful</p>
                <div className="flex items-center gap-2 mt-1">
                  {call.call_analysis?.call_successful ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Yes</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-medium">No</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Call Analysis */}
          {call.call_analysis && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-gold-500" />
                Call Analysis
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Call Summary</p>
                  <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">
                    {call.call_analysis.call_summary || 'No summary available'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transcript */}
          {call.transcript && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <Mic className="w-6 h-6 mr-2 text-gold-500" />
                Transcript
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {call.transcript}
                </pre>
              </div>
            </div>
          )}

          {/* Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recording */}
            {call.recording_url && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                  <FileAudio className="w-6 h-6 mr-2 text-gold-500" />
                  Recording
                </h2>
                <audio controls src={call.recording_url} className="w-full mb-4"></audio>
                <a 
                  href={call.recording_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700"
                >
                  <Download className="w-4 h-4" />
                  Download Recording
                </a>
              </div>
            )}

            {/* Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <ExternalLink className="w-6 h-6 mr-2 text-gold-500" />
                Additional Resources
              </h2>
              <div className="space-y-3">
                {call.public_log_url && (
                  <a 
                    href={call.public_log_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gold-600 hover:text-gold-700"
                  >
                    <FileText className="w-4 h-4" />
                    View Public Log
                  </a>
                )}
                {call.knowledge_base_retrieved_contents_url && (
                  <a 
                    href={call.knowledge_base_retrieved_contents_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gold-600 hover:text-gold-700"
                  >
                    <Database className="w-4 h-4" />
                    View Retrieved Knowledge
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          {call.call_cost && call.call_cost.product_costs && call.call_cost.product_costs.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-gold-500" />
                Cost Breakdown
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {call.call_cost.product_costs.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.product}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">${item.unit_price}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">${item.cost}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan="2" className="px-4 py-3 text-sm text-gray-900">Total</td>
                      <td className="px-4 py-3 text-sm text-slate-900">${call.call_cost.combined_cost}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}