import { useState, useEffect, useRef } from 'react';
import { Clock, Bell, Plus, Trash2, AlertCircle, Volume2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Alarm } from '../types';

interface AlarmClockProps {
  userId: string;
}

export function AlarmClock({ userId }: AlarmClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarmDateTime, setNewAlarmDateTime] = useState('');
  const [alarmTitle, setAlarmTitle] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [alarmNotes, setAlarmNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const audioRef = useRef<{ play: () => void } | null>(null);
  const checkedAlarms = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    setupAudio();
    loadAlarms();

    const subscription = supabase
      .channel('alarms_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'alarms', filter: `user_id=eq.${userId}` },
        () => {
          loadAlarms();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    checkAlarms();
  }, [currentTime, alarms]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const setupAudio = () => {
    audioRef.current = {
      play: () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }

          const playBellRing = (startTime: number) => {
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator1.frequency.value = 800;
            oscillator2.frequency.value = 1000;
            oscillator1.type = 'sine';
            oscillator2.type = 'sine';

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

            oscillator1.start(startTime);
            oscillator2.start(startTime);
            oscillator1.stop(startTime + 0.5);
            oscillator2.stop(startTime + 0.5);
          };

          const now = audioContext.currentTime;
          const ringPattern = [
            0, 0.15, 0.3, 0.6, 0.75, 0.9,
            1.5, 1.65, 1.8,
            2.5, 2.65, 2.8,
            3.5, 3.65, 3.8,
            4.5, 4.65, 4.8,
            5.5, 5.65, 5.8
          ];

          ringPattern.forEach(delay => {
            playBellRing(now + delay);
          });
        } catch (error) {
          console.error('Error playing alarm sound:', error);
        }
      }
    };
  };

  const loadAlarms = async () => {
    const { data, error } = await supabase
      .from('alarms')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active'])
      .order('alarm_datetime', { ascending: true });

    if (error) {
      console.error('Error loading alarms:', error);
      return;
    }

    if (data) {
      setAlarms(data as Alarm[]);
    }
  };

  const checkAlarms = () => {
    const now = currentTime.getTime();

    alarms.forEach((alarm) => {
      if (alarm.status === 'active' && !checkedAlarms.current.has(alarm.id)) {
        const alarmTime = new Date(alarm.alarm_datetime).getTime();
        const timeDiff = now - alarmTime;

        if (timeDiff >= 0 && timeDiff < 5000) {
          checkedAlarms.current.add(alarm.id);
          triggerAlarm(alarm);
        }
      }
    });
  };

  const triggerAlarm = async (alarm: Alarm) => {
    setRingingAlarm(alarm);

    if (alarm.sound_enabled && audioRef.current) {
      audioRef.current.play();
    }

    if (alarm.notification_enabled && Notification.permission === 'granted') {
      const notification = new Notification('Alarm Ringing!', {
        body: alarm.title + (alarm.notes ? `\n${alarm.notes}` : ''),
        icon: '/favicon.ico',
        tag: alarm.id,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        dismissAlarm(alarm.id);
      };
    }

    await supabase
      .from('alarms')
      .update({ status: 'triggered' })
      .eq('id', alarm.id);
  };

  const dismissAlarm = async (alarmId: string) => {
    await supabase
      .from('alarms')
      .update({ status: 'dismissed' })
      .eq('id', alarmId);

    setRingingAlarm(null);
    checkedAlarms.current.delete(alarmId);
    loadAlarms();
  };

  const handleSetAlarm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAlarmDateTime || !alarmTitle.trim()) {
      alert('Please enter both alarm title and date/time');
      return;
    }

    const localDateTime = new Date(newAlarmDateTime);

    const { data, error } = await supabase
      .from('alarms')
      .insert({
        user_id: userId,
        title: alarmTitle.trim(),
        alarm_datetime: localDateTime.toISOString(),
        scheduled_post_id: null,
        planned_post_id: null,
        status: 'active',
        sound_enabled: soundEnabled,
        notification_enabled: notificationEnabled,
        notes: alarmNotes.trim(),
        metadata: {}
      })
      .select();

    if (error) {
      console.error('Error setting alarm:', error);
      alert(`Failed to set alarm: ${error.message}`);
      return;
    }

    console.log('Alarm created successfully:', data);
    setNewAlarmDateTime('');
    setAlarmTitle('');
    setAlarmNotes('');
    setSoundEnabled(true);
    setNotificationEnabled(true);
    setShowAddForm(false);
    await loadAlarms();
  };

  const handleDeleteAlarm = async (alarmId: string) => {
    const { error } = await supabase
      .from('alarms')
      .delete()
      .eq('id', alarmId);

    if (error) {
      console.error('Error deleting alarm:', error);
      return;
    }

    checkedAlarms.current.delete(alarmId);
    loadAlarms();
  };

  const handleClearAllAlarms = async () => {
    if (!confirm('Are you sure you want to delete all alarms?')) {
      return;
    }

    const { error } = await supabase
      .from('alarms')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing alarms:', error);
      return;
    }

    checkedAlarms.current.clear();
    loadAlarms();
  };

  const formatSingaporeTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-SG', {
      timeZone: 'Asia/Singapore',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const formatSingaporeDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-SG', {
      timeZone: 'Asia/Singapore',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatAlarmDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-SG', {
      timeZone: 'Asia/Singapore',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getTimeUntilAlarm = (dateTimeStr: string) => {
    const alarmTime = new Date(dateTimeStr).getTime();
    const now = currentTime.getTime();
    const diff = alarmTime - now;

    if (diff < 0) return 'Past due';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `in ${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `in ${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `in ${minutes}m ${seconds}s`;
    return `in ${seconds}s`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold">Alarm Clock</h1>
        </div>

        <div className="text-center">
          <div className="text-6xl font-bold font-mono mb-2 tracking-wider">
            {formatSingaporeTime(currentTime)}
          </div>
          <div className="text-xl opacity-90">
            {formatSingaporeDate(currentTime)}
          </div>
          <div className="text-sm opacity-75 mt-2">
            Asia/Singapore (SGT)
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-600" />
            Your Alarms
          </h2>
          <div className="flex gap-2">
            {alarms.length > 0 && (
              <button
                onClick={handleClearAllAlarms}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {showAddForm ? 'Cancel' : 'Set Alarm'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleSetAlarm} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 mb-6 border-2 border-orange-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alarm Title *
                </label>
                <input
                  type="text"
                  value={alarmTitle}
                  onChange={(e) => setAlarmTitle(e.target.value)}
                  placeholder="e.g., Wake up, Meeting reminder"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={newAlarmDateTime}
                  onChange={(e) => setNewAlarmDateTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter time in your local timezone - it will be displayed in Singapore time above
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={alarmNotes}
                  onChange={(e) => setAlarmNotes(e.target.value)}
                  placeholder="Add any notes or reminders..."
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Volume2 className="w-4 h-4" />
                      Play Sound
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationEnabled}
                      onChange={(e) => setNotificationEnabled(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Bell className="w-4 h-4" />
                      Browser Notification
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => audioRef.current?.play()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Test Bell Sound
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
              >
                Set Alarm
              </button>
            </div>
          </form>
        )}

        {alarms.length > 0 ? (
          <div className="space-y-3">
            {alarms.map((alarm, index) => {
              const isPastDue = new Date(alarm.alarm_datetime).getTime() < currentTime.getTime();
              return (
                <div
                  key={alarm.id}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    index === 0
                      ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-red-50'
                      : isPastDue
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {index === 0 && !isPastDue && (
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded uppercase">
                            Next
                          </span>
                        )}
                        <h3 className="font-bold text-gray-800 text-lg">
                          {alarm.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatAlarmDateTime(alarm.alarm_datetime)}</span>
                      </div>

                      <div className={`text-sm font-semibold ${isPastDue ? 'text-red-600' : 'text-orange-600'}`}>
                        {getTimeUntilAlarm(alarm.alarm_datetime)}
                      </div>

                      {alarm.notes && (
                        <p className="text-xs text-gray-500 mt-2 italic">{alarm.notes}</p>
                      )}

                      <div className="flex gap-2 mt-2">
                        {alarm.sound_enabled && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            Sound
                          </span>
                        )}
                        {alarm.notification_enabled && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            Notification
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAlarm(alarm.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete alarm"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Alarms Set</h3>
            <p className="text-gray-600 text-sm">
              Click "Set Alarm" to create your first alarm
            </p>
          </div>
        )}
      </div>

      {ringingAlarm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-pulse">
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-6 text-white text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold mb-2">ALARM RINGING!</h2>
              <p className="text-lg opacity-90">Time to wake up</p>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                {ringingAlarm.title}
              </h3>
              {ringingAlarm.notes && (
                <p className="text-gray-600 mb-6 text-center">{ringingAlarm.notes}</p>
              )}
              <button
                onClick={() => dismissAlarm(ringingAlarm.id)}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <X className="w-6 h-6" />
                Dismiss Alarm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
