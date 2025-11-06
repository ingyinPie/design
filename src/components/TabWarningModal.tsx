import { AlertTriangle, Zap, Eye, CheckCircle } from 'lucide-react';

interface TabWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TabWarningModal({ isOpen, onConfirm, onCancel }: TabWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-3xl max-w-2xl w-full shadow-2xl transform animate-in zoom-in-95 duration-300 border-4 border-red-500">
        <div className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse"></div>

          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <AlertTriangle className="w-12 h-12 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>

            <h2 className="text-4xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 animate-pulse">
              CRITICAL WARNING!
            </h2>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-red-300 shadow-lg">
              <div className="flex items-start gap-3 mb-4">
                <Eye className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-900 mb-2">
                    Tab Must Stay Open for Alarms to Work!
                  </h3>
                  <p className="text-gray-800 leading-relaxed">
                    The alarm system requires this browser tab to remain open. You can minimize the tab or switch to other tabs, but if you CLOSE this tab, your scheduled alarms will NOT trigger.
                  </p>
                </div>
              </div>

              <div className="space-y-3 ml-9">
                <div className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-orange-700">Keep this tab open</span> in the background - you can minimize or switch away from it
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-orange-700">Don't close the tab</span> or your browser completely
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-orange-700">Alarms work in the background</span> as long as the tab remains open
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 mb-6 border-2 border-green-400">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-900 font-medium">
                  This is a browser-based alarm system. For production use, consider implementing server-side scheduling or push notifications.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg animate-pulse"
              >
                I Understand - Schedule Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
