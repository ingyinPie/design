import { Bell, X, Clock, Calendar as CalendarIcon, Check, X as XIcon } from 'lucide-react';
import type { ScheduledPost, PlannedPost } from '../types';

interface AlarmApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onDecline: () => void;
  post: ScheduledPost | PlannedPost;
}

export function AlarmApprovalModal({ isOpen, onClose, onApprove, onDecline }: AlarmApprovalModalProps) {
  if (!isOpen) return null;

  const handleApprove = () => {
    onApprove();
    onClose();
  };

  const handleDecline = () => {
    onDecline();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Set Reminder Alarm?</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900 mb-4">
              Would you like to set an automatic reminder alarm for this post? The alarm will notify you 15 minutes before the scheduled time.
            </p>

            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">Alarm Time:</span>
                <span>15 minutes before post time</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span className="font-semibold">Includes:</span>
                <span>Sound + Browser notification</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Reminder will be set for:</p>
            <p className="font-semibold text-gray-800 text-sm">15 minutes before your scheduled post time</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <XIcon className="w-4 h-4" />
              No Thanks
            </button>
            <button
              onClick={handleApprove}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Set Alarm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
