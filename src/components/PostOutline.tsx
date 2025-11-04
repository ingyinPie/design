import { FileText, Clock, Target, Zap, Check } from 'lucide-react';
import { useState } from 'react';
import type { PostOutline as PostOutlineType } from '../services/visualGenerator';

interface PostOutlineProps {
  outline: PostOutlineType;
}

export function PostOutline({ outline }: PostOutlineProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  return (
    <div className="card-float p-6 mb-6 animate-fade-in">
      <div className="gradient-header-bg mb-6 inline-block">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold gradient-text">Post Structure Outline</h2>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-6">Optimized content strategy for maximum engagement</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="card-float p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">💡 Opening Hook</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed pl-10">{outline.hook}</p>
          </div>

          <div className="card-float p-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">📝 Main Message</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed pl-10">{outline.mainMessage}</p>
          </div>

          <div className="card-float p-4 bg-gradient-to-br from-orange-50 to-red-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">🎯 Call-to-Action</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed pl-10">{outline.callToAction}</p>
          </div>

          <div className="card-float p-4 bg-gradient-to-br from-green-50 to-teal-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">⏰ Best Time to Post</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed pl-10">{outline.bestTimeToPost}</p>
          </div>
        </div>

        <div className="card-float p-5 bg-white">
          <div className="gradient-header-bg mb-4 inline-block">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content Structure Blueprint
            </h3>
          </div>
          <div className="space-y-2">
            {outline.structure.map((item, index) => (
              <div
                key={index}
                className={`workflow-step cursor-pointer ${completedSteps.includes(index) ? 'completed' : ''}`}
                onClick={() => toggleStep(index)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    completedSteps.includes(index)
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                  }`}>
                    {completedSteps.includes(index) ? (
                      <Check className="w-4 h-4 check-bounce" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs text-gray-700 leading-relaxed flex-1">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-xl border border-yellow-200">
        <p className="text-xs text-gray-700">
          <strong>📊 Engagement Tip:</strong> Posts that follow this structure typically see 2-3x higher
          engagement rates. Start with a strong hook, deliver value, and always include a clear call-to-action.
        </p>
      </div>
    </div>
  );
}
