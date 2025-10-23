'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Book,
  History,
} from "lucide-react";            

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState('pending'); 
  const [pendingRequests, setPendingRequests] = useState([]); 
  const [history, setHistory] = useState([]); 
  const [knowledgeBase, setKnowledgeBase] = useState([]); 
  const [selectedRequest, setSelectedRequest] = useState(null); 
  const [supervisorAnswer, setSupervisorAnswer] = useState('');
  const [question, setQuestion] = useState(""); 

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

 
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [pendingRes, historyRes, kbRes] = await Promise.all([
        axios.get(`${BASE_URL}/help_requests`),
        axios.get(`${BASE_URL}/help_request_history`),
        axios.get(`${BASE_URL}/knowledge_base`)
      ]);
      setPendingRequests(pendingRes.data);
      setHistory(historyRes.data);
      setKnowledgeBase(kbRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleCreateHelpRequest = async () => {
    if (!question) return;
    const id = Math.random().toString(36).substring(2, 12); // Simple unique id
    await axios.post(`${BASE_URL}/help_requests`, { question, request_id: id });
    setQuestion("");
    fetchAllData(); 
  };

  // When Respond button is clicked in Pending tab
  const handleRespond = (request) => {
    setSelectedRequest(request); 
    setSupervisorAnswer(''); 
  };

  // Handle submitting answer through modal; status is 'resolved' or 'unresolved'
  const handleSubmit = async (status) => {
    if (!selectedRequest) return;

    const res_id = Math.random().toString(36).substring(2, 12);
    try {
      await axios.post(`${BASE_URL}/supervisor_response`, {
        id: res_id,
        answer: supervisorAnswer,
        question: selectedRequest.question,
        request_id: selectedRequest.request_id,
        status, 
      });

      // If resolved and answer present, update knowledge base endpoint accordingly
      if (status === 'resolved' && supervisorAnswer.trim()) {
        await axios.post(`${BASE_URL}/knowledge_base`, {
          question: selectedRequest.question,
          answer: supervisorAnswer,
          learnedDate: new Date().toISOString(),
        });
      }

      fetchAllData(); 
    } catch (error) {
      console.error("Error submitting response:", error);
    }

    setSelectedRequest(null); 
    setSupervisorAnswer('');
  };

  
  const getTimeRemaining = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Format date to readable string
  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AI Supervisor Dashboard</h1>
                <p className="text-sm text-slate-500">Monitor and respond to AI escalations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">{pendingRequests.filter(r => r.status === 'pending').length} Pending</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-4 bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Create a Help Request</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateHelpRequest}
            disabled={!question.trim()}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Pending Requests
            {pendingRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'pending' ? 'bg-blue-600' : 'bg-blue-100 text-blue-700'
              }`}>
                {pendingRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
              activeTab === 'knowledge'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Book className="w-4 h-4" />
            Knowledge Base
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Pending Requests Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingRequests.filter(req => req.status === 'pending').length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">All caught up!</h3>
                <p className="text-slate-500">No pending requests at the moment.</p>
              </div>
            ) : (
              pendingRequests.filter(req => req.status === 'pending').map(request => (
                <div key={request.request_id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1">
                          🟡 Pending
                        </span>
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {getTimeRemaining(request.timestamp)}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm text-slate-600 mb-1">
                          Customer: <span className="font-medium text-slate-900">{request.customerName || 'Unknown'}</span>
                          <span className="text-slate-400 mx-2">•</span>
                          <span className="text-slate-500">{request.customerId || request.request_id}</span>
                        </div>
                        <div className="text-sm text-slate-500">
                          {formatDate(request.timestamp)}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                        <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Question</div>
                        <p className="text-slate-900 text-base">{request.question}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRespond(request)}
                      className="ml-4 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                    >
                      Respond
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Answer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {history.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">{item.question}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-md">{item.answer || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.customerId || item.request_id}</td>
                      <td className="px-6 py-4">
                        {item.status === 'resolved' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            <XCircle className="w-3 h-3" />
                            Unresolved
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(item.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Answer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Learned Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {knowledgeBase.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-xs">{item.question}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-md">{item.answer}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(item.learnedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">Respond to Request</h2>
              <p className="text-sm text-slate-500 mt-1">
                Customer: {selectedRequest.customerName || 'Unknown'} ({selectedRequest.customerId || selectedRequest.request_id})
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Original Question</label>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-slate-900">{selectedRequest.question}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Answer</label>
                <textarea
                  value={supervisorAnswer}
                  onChange={(e) => setSupervisorAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <strong>Note:</strong> When you mark this as "Resolved", your answer will be added to the Knowledge Base for future AI responses.
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit('resolved')}
                disabled={!supervisorAnswer.trim()}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                Submit & Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


