import { useState } from 'react';
import { ThumbsUp, X, FileText, Hash, Sparkles } from 'lucide-react';
import type { GeneratedContent, ToneType } from '../types';

interface GeneratedContentApprovalProps {
  content: GeneratedContent;
  onApprove: (tone: ToneType, caption: string, hashtags: string[]) => void;
  onReject: (tone: ToneType) => void;
}

export function GeneratedContentApproval({ content, onApprove, onReject }: GeneratedContentApprovalProps) {
  const [rejectedTones, setRejectedTones] = useState<Set<ToneType>>(new Set());

  const contentCards: Array<{ tone: ToneType; caption: string; label: string; color: string }> = [
    {
      tone: 'formal',
      caption: content.formal,
      label: 'Professional',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      tone: 'casual',
      caption: content.casual,
      label: 'Casual',
      color: 'from-green-500 to-teal-600'
    },
    {
      tone: 'funny',
      caption: content.funny,
      label: 'Fun & Playful',
      color: 'from-orange-500 to-pink-600'
    },
  ];

  const handleReject = (tone: ToneType) => {
    setRejectedTones(prev => new Set(prev).add(tone));
    onReject(tone);
  };

  const visibleCards = contentCards.filter(card => !rejectedTones.has(card.tone));

  if (visibleCards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">All suggestions have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Review AI-Generated Content</h3>
        <p className="text-gray-600">Choose the tone that best fits your brand and approve to add to calendar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCards.map(({ tone, caption, label, color }) => (
          <div
            key={tone}
            className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className={`bg-gradient-to-r ${color} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-white" />
                  <h4 className="text-lg font-bold text-white">{label}</h4>
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  AI Generated
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-600 uppercase">Caption</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {caption}
                </p>
              </div>

              {content.hashtags && content.hashtags.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600 uppercase">Hashtags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {content.hashtags.slice(0, 6).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onApprove(tone, caption, content.hashtags)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(tone)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
