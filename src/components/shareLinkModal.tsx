import React, { useState, useEffect } from 'react';

interface ShareLinkModalProps {
  quizId: string;
  quizTitle: string;
  onClose: () => void;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ quizId, quizTitle, onClose }) => {
  const [copied, setCopied] = useState(false);

  // This function builds a full, shareable URL.
  // It works correctly in a standard hosting environment.
  const getBaseUrl = () => {
    const { protocol, host, pathname } = window.location;
    // Handles cases where the app might be running in a subdirectory.
    const path = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    return `${protocol}//${host}${path}`;
  };

  const quizLink = `${getBaseUrl()}#/quiz/${quizId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizLink).then(() => {
      setCopied(true);
    });
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-indigo-400">{quizTitle}: Shareable Link</h2>
        
        <p className="text-gray-400 mb-4">Share this link with candidates to start the quiz.</p>

        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-700 rounded-lg p-3">
          <input
            type="text"
            value={quizLink}
            readOnly
            className="bg-transparent text-gray-200 w-full outline-none font-mono"
          />
          <button
            onClick={copyToClipboard}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;