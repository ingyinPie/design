import { useState, useEffect, useRef } from 'react';
import { Sparkles, CalendarDays, Clock, ChevronDown, ChevronUp, FileText, Hash, Bell as BellIcon, Trash2 } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { CaptionSelector } from './components/CaptionSelector';
import { HashtagDisplay } from './components/HashtagDisplay';
import { PlatformPreviews } from './components/PlatformPreviews';
import { ExportSection } from './components/ExportSection';
import { ContentHistory } from './components/ContentHistory';
import { VisualSuggestions } from './components/VisualSuggestions';
import { PostOutline } from './components/PostOutline';
import { VideoOptimizationTips } from './components/VideoOptimizationTips';
import { Calendar } from './components/Calendar';
import { ScheduledPostsList } from './components/ScheduledPostsList';
import { ContentPlanGenerator } from './components/ContentPlanGenerator';
import { SmartSchedulePlanner } from './components/SmartSchedulePlanner';
import { StepNavigator } from './components/StepNavigator';
import { GeneratedContentApproval } from './components/GeneratedContentApproval';
import { ContentPlanApproval } from './components/ContentPlanApproval';
import { ClockDisplay } from './components/ClockDisplay';
import { AlarmClock } from './components/AlarmClock';
import { GeneratedPostsLibrary } from './components/GeneratedPostsLibrary';
import { GeneratedPostScheduleModal } from './components/GeneratedPostScheduleModal';
import { generateContent } from './services/contentGenerator';
import { resizeImageForPlatforms } from './services/imageResizer';
import { generateVisualSuggestions, generatePostOutline } from './services/visualGenerator';
import { generateWeeklySchedule } from './services/scheduleGenerator';
import type { PlannedPost as PlannedPostServiceType } from './services/contentPlanner';
import { supabase } from './lib/supabase';
import type { GeneratedContent, ToneType, BrandProfile, ResizedImages, ContentHistory as ContentHistoryType, ScheduledPost, PlannedPost, ContentPlan, Alarm } from './types';

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneType>('casual');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resizedImages, setResizedImages] = useState<ResizedImages | undefined>();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [currentDescription, setCurrentDescription] = useState('');

  const [brandProfile] = useState<BrandProfile | null>(null);
  const [contentHistory, setContentHistory] = useState<ContentHistoryType[]>([]);
  const [userId] = useState(() => {
    const stored = localStorage.getItem('autopostr_user_id');
    if (stored && stored.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return stored;
    }
    const newId = crypto.randomUUID();
    localStorage.setItem('autopostr_user_id', newId);
    return newId;
  });

  const [visualSuggestions, setVisualSuggestions] = useState<ReturnType<typeof generateVisualSuggestions>>([]);
  const [postOutline, setPostOutline] = useState<ReturnType<typeof generatePostOutline> | null>(null);
  const [showVideoTips, setShowVideoTips] = useState(false);

  const [showScheduleView, setShowScheduleView] = useState(false);
  const [showGeneratedPostScheduleModal, setShowGeneratedPostScheduleModal] = useState(false);
  const [selectedGeneratedPost, setSelectedGeneratedPost] = useState<ContentHistoryType | null>(null);
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [showSmartPlanner, setShowSmartPlanner] = useState(false);
  const [showAIPlanningView, setShowAIPlanningView] = useState(false);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [plannedPosts, setPlannedPosts] = useState<PlannedPost[]>([]);
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [showApprovalView, setShowApprovalView] = useState(false);
  const [previewSchedule, setPreviewSchedule] = useState<PlannedPost[]>([]);
  const [pendingPlanApproval, setPendingPlanApproval] = useState<{
    planName: string;
    startDate: string;
    endDate: string;
    frequency: string;
    posts: PlannedPost[];
  } | null>(null);

  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const audioRef = useRef<{ play: () => void } | null>(null);
  const checkedAlarms = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadBrandProfile();
    loadContentHistory();
    loadScheduledPosts();
    loadContentPlans();
    setupAudio();
    checkAlarms();

    const alarmCheckInterval = setInterval(checkAlarms, 1000);
    return () => clearInterval(alarmCheckInterval);
  }, []);

  const loadBrandProfile = async () => {
    // Brand profile loading removed
  };

  const loadContentHistory = async () => {
    const { data } = await supabase
      .from('generated_content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setContentHistory(data as ContentHistoryType[]);
    }
  };

  const loadScheduledPosts = async () => {
    const { data, error } = await supabase.rpc('get_scheduled_posts_sg', { user_uuid: userId });

    if (error) {
      console.error('Error loading scheduled posts:', error);
      return;
    }

    if (data) {
      console.log('Loaded scheduled posts:', data);
      setScheduledPosts(data as ScheduledPost[]);
    }
  };

  const loadContentPlans = async () => {
    const [plansData, postsData] = await Promise.all([
      supabase
        .from('content_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase.rpc('get_planned_posts_sg', { user_uuid: userId })
    ]);

    if (plansData.data) {
      setContentPlans(plansData.data as ContentPlan[]);
    }
    if (postsData.data) {
      setPlannedPosts(postsData.data as PlannedPost[]);
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

  const checkAlarms = async () => {
    const { data: alarms } = await supabase
      .from('alarms')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!alarms || alarms.length === 0) return;

    const now = new Date();

    for (const alarm of alarms) {
      if (checkedAlarms.current.has(alarm.id)) continue;

      const alarmTime = new Date(alarm.alarm_datetime);

      if (now >= alarmTime) {
        checkedAlarms.current.add(alarm.id);
        setRingingAlarm(alarm as Alarm);

        if (alarm.sound_enabled) {
          audioRef.current?.play();
        }

        if (alarm.notification_enabled && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(alarm.title, {
            body: alarm.notes || 'Your alarm is ringing!',
            icon: '🔔',
            requireInteraction: true,
          });
        }

        await supabase
          .from('alarms')
          .update({ status: 'triggered' })
          .eq('id', alarm.id);
      }
    }
  };

  const dismissAlarm = async () => {
    if (!ringingAlarm) return;

    await supabase
      .from('alarms')
      .update({ status: 'dismissed' })
      .eq('id', ringingAlarm.id);

    setRingingAlarm(null);
  };


  const saveContentToHistory = async (
    description: string,
    content: GeneratedContent,
    imageUrl: string | null,
    resizedImages: ResizedImages | undefined
  ) => {
    await supabase
      .from('generated_content')
      .insert({
        user_id: userId,
        brand_profile_id: brandProfile?.id || null,
        description,
        formal_caption: content.formal,
        casual_caption: content.casual,
        funny_caption: content.funny,
        hashtags: content.hashtags,
        image_url: imageUrl || '',
        resized_images: resizedImages || {}
      });

    loadContentHistory();
  };

  const handleGenerate = async (companyName: string, productName: string, description: string, uploadedImageUrl: string | null, imageFile?: File) => {
    setIsGenerating(true);
    setCurrentStep(1);

    const fullDescription = `${companyName} ${productName}. ${description}`;
    setCurrentDescription(fullDescription);

    try {
      let resized: ResizedImages | undefined;

      if (imageFile) {
        resized = await resizeImageForPlatforms(imageFile);
        setResizedImages(resized as ResizedImages);
      }

      const content = await generateContent({
        companyName,
        productName,
        description
      }, brandProfile);
      setGeneratedContent(content);
      setImageUrl(uploadedImageUrl);
      setShowApprovalView(true);
      setCurrentStep(2);

      const suggestions = generateVisualSuggestions(fullDescription, brandProfile);
      setVisualSuggestions(suggestions);

      const outline = generatePostOutline(fullDescription, brandProfile?.tone || 'casual', brandProfile);
      setPostOutline(outline);

      await saveContentToHistory(fullDescription, content, uploadedImageUrl, resized as ResizedImages | undefined);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTone = (tone: ToneType) => {
    setSelectedTone(tone);
  };

  const handleStepClick = (step: 1 | 2 | 3) => {
    if (step === 1) {
      setCurrentStep(1);
    } else if (step === 2 && generatedContent) {
      setCurrentStep(2);
    } else if (step === 3 && generatedContent && selectedTone) {
      setCurrentStep(3);
    }
  };

  const handleLoadContent = (content: ContentHistoryType) => {
    setGeneratedContent({
      formal: content.formal_caption,
      casual: content.casual_caption,
      funny: content.funny_caption,
      hashtags: content.hashtags
    });
    setImageUrl(content.image_url || null);
    setResizedImages(content.resized_images as ResizedImages);
    setCurrentDescription(content.description);
    setShowApprovalView(false);
    setCurrentStep(2);

    const suggestions = generateVisualSuggestions(content.description, brandProfile);
    setVisualSuggestions(suggestions);

    const outline = generatePostOutline(content.description, brandProfile?.tone || 'casual', brandProfile);
    setPostOutline(outline);
  };

  const handleDeleteContent = async (id: string) => {
    await supabase
      .from('generated_content')
      .delete()
      .eq('id', id);

    loadContentHistory();
  };


  const handleScheduleFromLibrary = (generatedPost: ContentHistoryType) => {
    setSelectedGeneratedPost(generatedPost);
    setShowGeneratedPostScheduleModal(true);
  };

  const handleScheduleGeneratedPost = async (scheduleData: {
    title: string;
    caption: string;
    hashtags: string[];
    scheduledDate: string;
    scheduledTime: string;
    platforms: string[];
    notes: string;
  }) => {
    const postData = {
      user_id: userId,
      brand_profile_id: brandProfile?.id || null,
      title: scheduleData.title,
      caption: scheduleData.caption,
      hashtags: scheduleData.hashtags,
      platforms: scheduleData.platforms,
      image_url: selectedGeneratedPost?.image_url || '',
      scheduled_date: scheduleData.scheduledDate,
      scheduled_time: scheduleData.scheduledTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: 'scheduled',
      notes: scheduleData.notes
    };

    const { data: insertedPost, error } = await supabase
      .from('scheduled_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Error scheduling post:', error);
      return;
    }

    if (insertedPost) {
      const alarmDateTime = new Date(`${scheduleData.scheduledDate}T${scheduleData.scheduledTime}`);

      await supabase.from('alarms').insert({
        user_id: userId,
        alarm_datetime: alarmDateTime.toISOString(),
        title: `Post: ${scheduleData.title}`,
        scheduled_post_id: insertedPost.id,
        sound_enabled: true,
        notification_enabled: true,
        notes: `Reminder for: ${scheduleData.title}`,
        status: 'active'
      });
    }

    await loadScheduledPosts();
    setShowGeneratedPostScheduleModal(false);
    setSelectedGeneratedPost(null);
  };

  const handleDeleteScheduledPost = async (id: string) => {
    await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id);

    loadScheduledPosts();
  };

  const handleDeletePlannedPost = async (id: string) => {
    await supabase
      .from('planned_posts')
      .delete()
      .eq('id', id);

    loadContentPlans();
  };

  const handleDeleteContentPlan = async (planId: string) => {
    const { data: postsToDelete } = await supabase
      .from('planned_posts')
      .select('id')
      .eq('content_plan_id', planId);

    if (postsToDelete) {
      const postIds = postsToDelete.map(p => p.id);
      await supabase
        .from('alarms')
        .delete()
        .in('planned_post_id', postIds);
    }

    await supabase
      .from('planned_posts')
      .delete()
      .eq('content_plan_id', planId);

    await supabase
      .from('content_plans')
      .delete()
      .eq('id', planId);

    loadContentPlans();
  };

  const handleDeletePost = async (id: string, type: 'scheduled' | 'planned') => {
    if (type === 'scheduled') {
      await handleDeleteScheduledPost(id);
    } else {
      await handleDeletePlannedPost(id);
    }
  };

  const handleEditScheduledPost = (post: ScheduledPost | PlannedPost) => {
    setEditingPost(post as ScheduledPost);
  };

  const handleGenerateContentPlan = async (planData: {
    planName: string;
    startDate: string;
    endDate: string;
    frequency: string;
    posts: PlannedPostServiceType[];
  }) => {
    const postsWithIds = planData.posts.map((post, index) => ({
      id: `temp-${Date.now()}-${index}`,
      content_plan_id: '',
      user_id: userId,
      title: post.title,
      suggested_date: post.suggestedDate.toISOString().split('T')[0],
      suggested_time: post.suggestedTime,
      rationale: post.rationale,
      content_generated: false,
      caption: '',
      hashtags: [],
      platforms: post.platforms,
      image_url: '',
      status: 'suggested' as const,
      order_in_plan: index,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    setPendingPlanApproval({
      planName: planData.planName,
      startDate: planData.startDate,
      endDate: planData.endDate,
      frequency: planData.frequency,
      posts: postsWithIds
    });
    setShowPlanGenerator(false);
  };

  const handleApprovePlanPost = (postId: string) => {
    console.log('Approved post:', postId);
  };

  const handleRejectPlanPost = (postId: string) => {
    if (pendingPlanApproval) {
      setPendingPlanApproval({
        ...pendingPlanApproval,
        posts: pendingPlanApproval.posts.filter(p => p.id !== postId)
      });
    }
  };

  const handleApproveAllPlanPosts = async () => {
    if (!pendingPlanApproval) return;

    const { data: planRecord } = await supabase
      .from('content_plans')
      .insert({
        user_id: userId,
        brand_profile_id: brandProfile?.id || null,
        plan_name: pendingPlanApproval.planName,
        start_date: pendingPlanApproval.startDate,
        end_date: pendingPlanApproval.endDate,
        frequency: pendingPlanApproval.frequency,
        total_posts: pendingPlanApproval.posts.length,
        status: 'active'
      })
      .select()
      .single();

    if (planRecord) {
      const plannedPostsData = pendingPlanApproval.posts.map((post, index) => ({
        content_plan_id: planRecord.id,
        user_id: userId,
        title: post.title,
        suggested_date: post.suggested_date,
        suggested_time: post.suggested_time,
        rationale: post.rationale,
        platforms: post.platforms,
        status: 'suggested' as const,
        order_in_plan: index
      }));

      const { data: insertedPosts } = await supabase
        .from('planned_posts')
        .insert(plannedPostsData)
        .select();

      if (insertedPosts) {
        const alarmData = insertedPosts.map((post) => {
          const alarmDateTime = new Date(`${post.suggested_date}T${post.suggested_time}`);

          return {
            user_id: userId,
            alarm_datetime: alarmDateTime.toISOString(),
            title: `Post: ${post.title}`,
            planned_post_id: post.id,
            sound_enabled: true,
            notification_enabled: true,
            notes: `Reminder to post: ${post.title}`,
            status: 'active'
          };
        });

        await supabase.from('alarms').insert(alarmData);
      }

      await loadContentPlans();
      setPendingPlanApproval(null);
      setShowScheduleView(true);
      setShowAIPlanningView(false);
      setShowContentGenerator(false);
      setShowVideoTips(false);
    }
  };

  const handleSchedulePreviewChange = (preview: { numberOfPosts: number; startDate: string } | null) => {
    if (!preview) {
      setPreviewSchedule([]);
      return;
    }

    const slots = generateWeeklySchedule(preview.startDate, preview.numberOfPosts);

    const previewPosts: PlannedPost[] = slots.map((slot, index) => {
      const year = slot.date.getFullYear();
      const month = String(slot.date.getMonth() + 1).padStart(2, '0');
      const day = String(slot.date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      return {
        id: `preview-${index}`,
        user_id: userId,
        content_plan_id: null,
        title: `Suggested: ${slot.day.charAt(0).toUpperCase() + slot.day.slice(1)}`,
        description: `Post ${index + 1}`,
        suggested_date: dateStr,
        suggested_time: slot.time,
        platforms: ['instagram'],
        target_audience: '',
        key_message: '',
        content_type: 'post',
        status: 'suggested',
        order_index: index
      };
    });

    setPreviewSchedule(previewPosts);
  };

  const handleGenerateSmartSchedule = async (scheduleData: {
    numberOfPosts: number;
    startDate: string;
  }) => {
    const slots = generateWeeklySchedule(
      scheduleData.startDate,
      scheduleData.numberOfPosts
    );

    const scheduledPostsData = slots.map((slot, index) => {
      const year = slot.date.getFullYear();
      const month = String(slot.date.getMonth() + 1).padStart(2, '0');
      const day = String(slot.date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      return {
        user_id: userId,
        brand_profile_id: brandProfile?.id || null,
        title: `Weekly Post #${index + 1}`,
        caption: 'Content to be generated',
        hashtags: [],
        platforms: ['instagram'],
        image_url: '',
        scheduled_date: dateStr,
        scheduled_time: slot.time,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'draft' as const,
        notes: `Auto-generated weekly schedule for ${slot.day}`
      };
    });

    await supabase.from('scheduled_posts').insert(scheduledPostsData);

    const alarmData = slots.map((slot, index) => {
      const alarmDateTime = new Date(slot.date);
      const [hours, minutes] = slot.time.split(':').map(Number);
      alarmDateTime.setHours(hours, minutes, 0, 0);

      return {
        user_id: userId,
        alarm_datetime: alarmDateTime.toISOString(),
        title: `Post: Weekly Post #${index + 1}`,
        sound_enabled: true,
        notification_enabled: true,
        notes: `Reminder to post on ${slot.day} at ${slot.time}`,
        status: 'active'
      };
    });

    await supabase.from('alarms').insert(alarmData);

    setScheduledPosts((prev) => [...prev, ...scheduledPostsData]);

    await loadScheduledPosts();
    setPreviewSchedule([]);
    setShowScheduleView(true);
    setShowContentGenerator(false);
    setShowAIPlanningView(false);
    setShowVideoTips(false);
  };

  const getSelectedCaption = () => {
    if (!generatedContent) return '';
    const baseCaption = generatedContent[selectedTone];
    const cta = generatedContent.ctaVariations?.[selectedTone];
    return cta ? `${baseCaption}\n\n${cta}` : baseCaption;
  };

  const getPostTitle = (): string => {
    const maxLength = 50;
    const desc = currentDescription.trim();

    const firstSentence = desc.split(/[.!?]/)[0];
    if (firstSentence.length <= maxLength) {
      return firstSentence;
    }

    return desc.substring(0, maxLength) + '...';
  };

  const togglePostExpanded = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleApproveContent = (tone: ToneType, caption: string, hashtags: string[]) => {
    setSelectedTone(tone);
    setShowApprovalView(false);
  };

  const handleRejectContent = (tone: ToneType) => {
    console.log('Rejected tone:', tone);
  };

  const handleGenerateContentForPost = async (post: PlannedPost) => {
    try {
      const description = `${post.title}. ${post.rationale}`;

      const content = await generateContent(
        { description, companyName: brandProfile?.name },
        brandProfile
      );

      const updatedPost = {
        caption: content.casual,
        hashtags: content.hashtags,
        content_generated: true
      };

      const { error } = await supabase
        .from('planned_posts')
        .update(updatedPost)
        .eq('id', post.id);

      if (!error) {
        await loadContentPlans();
      }
    } catch (error) {
      console.error('Error generating content for post:', error);
    }
  };

  const handleGenerateContentForAllPosts = async (posts: PlannedPost[]) => {
    for (const post of posts) {
      await handleGenerateContentForPost(post);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30 animate-gradient-shift"></div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] text-6xl animate-float-slow opacity-20">📱</div>
        <div className="absolute top-[20%] right-[10%] text-5xl animate-float-medium opacity-20">💬</div>
        <div className="absolute top-[40%] left-[5%] text-7xl animate-float-fast opacity-15">📸</div>
        <div className="absolute top-[60%] right-[20%] text-6xl animate-float-slow opacity-20">👍</div>
        <div className="absolute top-[75%] left-[25%] text-5xl animate-float-medium opacity-15">🎥</div>
        <div className="absolute top-[85%] right-[15%] text-6xl animate-float-fast opacity-20">✨</div>
        <div className="absolute top-[30%] right-[40%] text-5xl animate-float-slow opacity-15">💡</div>
        <div className="absolute top-[50%] left-[40%] text-6xl animate-float-medium opacity-20">🚀</div>
        <div className="absolute top-[15%] left-[50%] text-5xl animate-float-fast opacity-15">❤️</div>
        <div className="absolute top-[70%] right-[45%] text-6xl animate-float-slow opacity-20">⭐</div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AutoPostr
            </h1>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            AI-Powered Content Generator with Visual Suggestions
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setShowContentGenerator(!showContentGenerator);
                setShowScheduleView(false);
                setShowAIPlanningView(false);
                setShowVideoTips(false);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm font-medium ${
                showContentGenerator
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Content Generator
            </button>
            <button
              onClick={() => {
                setShowScheduleView(!showScheduleView);
                setShowAIPlanningView(false);
                setShowContentGenerator(false);
                setShowVideoTips(false);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm font-medium ${
                showScheduleView
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Calendar & Schedule
            </button>
            <button
              onClick={() => {
                setShowAIPlanningView(!showAIPlanningView);
                setShowScheduleView(false);
                setShowContentGenerator(false);
                setShowVideoTips(false);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm font-medium ${
                showAIPlanningView
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Content Strategy
            </button>
            <button
              onClick={() => {
                setShowVideoTips(!showVideoTips);
                setShowContentGenerator(false);
                setShowScheduleView(false);
                setShowAIPlanningView(false);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm font-medium ${
                showVideoTips
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Video Tips
            </button>
          </div>
        </header>

        {showVideoTips && (
          <VideoOptimizationTips />
        )}

        {showAIPlanningView && (
          <>
            {pendingPlanApproval ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <ContentPlanApproval
                  planName={pendingPlanApproval.planName}
                  startDate={pendingPlanApproval.startDate}
                  endDate={pendingPlanApproval.endDate}
                  frequency={pendingPlanApproval.frequency}
                  posts={pendingPlanApproval.posts}
                  onApproveAll={handleApproveAllPlanPosts}
                  onApprovePost={handleApprovePlanPost}
                  onRejectPost={handleRejectPlanPost}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Content Strategy</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Let our AI analyze your brand and industry to create an optimized content plan with smart scheduling recommendations
                  </p>
                </div>

              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-green-50 to-teal-100 rounded-xl p-6 border border-green-200">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Create AI-Powered Content Plan
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Let AI create a complete content plan optimized for your brand, industry, and target audience
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">•</span>
                          <span>AI-optimized posting times</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">•</span>
                          <span>Content theme suggestions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">•</span>
                          <span>Platform-specific strategies</span>
                        </li>
                      </ul>
                    </div>
                    <button
                      onClick={() => setShowPlanGenerator(true)}
                      className="mt-auto px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Create Content Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )}

            {!pendingPlanApproval && (contentPlans.length > 0 || plannedPosts.length > 0) && (
              <div className="space-y-6">
                {contentPlans.map(plan => {
                  const planPosts = plannedPosts.filter(post => post.content_plan_id === plan.id);

                  return (
                    <div key={plan.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                      <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-white">{plan.plan_name}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                plan.status === 'active' ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-gray-500/20 text-white backdrop-blur-sm'
                              }`}>
                                {plan.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-white/90 text-sm">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4" />
                                {new Date(plan.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(plan.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                {plan.total_posts} posts • {plan.frequency}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {planPosts.some(p => !p.caption && !p.hashtags?.length) && (
                              <button
                                onClick={() => handleGenerateContentForAllPosts(planPosts.filter(p => !p.caption && !p.hashtags?.length))}
                                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-sm text-white rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
                              >
                                <Sparkles className="w-4 h-4" />
                                Generate All Content
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setShowScheduleView(true);
                                setShowAIPlanningView(false);
                                setShowContentGenerator(false);
                                setShowVideoTips(false);
                              }}
                              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
                            >
                              View on Calendar →
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${plan.plan_name}" and all its posts?`)) {
                                  handleDeleteContentPlan(plan.id);
                                }
                              }}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white rounded-lg transition-all"
                              title="Delete content plan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {planPosts.length > 0 ? (
                          <div className="space-y-4">
                            {(() => {
                              const postsByDate = planPosts.reduce((acc, post) => {
                                const date = post.suggested_date;
                                if (!acc[date]) {
                                  acc[date] = [];
                                }
                                acc[date].push(post);
                                return acc;
                              }, {} as Record<string, typeof planPosts>);

                              const sortedDates = Object.keys(postsByDate).sort();

                              return sortedDates.map((date, dateIndex) => {
                                const postsOnDate = postsByDate[date];
                                const dateObj = new Date(date);

                                return (
                                  <div key={date} className="relative">
                                    {dateIndex > 0 && (
                                      <div className="absolute left-6 top-0 w-0.5 h-4 bg-gradient-to-b from-green-300 to-transparent -translate-y-4"></div>
                                    )}

                                    <div className="flex gap-4">
                                      <div className="flex-shrink-0 relative">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                                          <span className="text-xs font-medium uppercase">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                                          <span className="text-lg font-bold leading-none">{dateObj.getDate()}</span>
                                        </div>
                                        {dateIndex < sortedDates.length - 1 && (
                                          <div className="absolute left-1/2 top-12 w-0.5 h-full bg-gradient-to-b from-green-300 via-teal-200 to-transparent -translate-x-1/2"></div>
                                        )}
                                      </div>

                                      <div className="flex-1 space-y-3 pb-4">
                                        <div className="text-sm font-semibold text-gray-500 mb-3">
                                          {dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>

                                        {postsOnDate.map((post) => {
                                          const isExpanded = expandedPosts.has(post.id);

                                          return (
                                            <div key={post.id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl overflow-hidden hover:border-green-300 hover:shadow-lg transition-all group">
                                              <div className="p-4">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                  <h4 className="font-semibold text-gray-900 text-base flex-1 group-hover:text-green-600 transition-colors">
                                                    {post.title}
                                                  </h4>
                                                  <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {post.suggested_time}
                                                  </div>
                                                </div>

                                                {post.rationale && (
                                                  <div className="bg-blue-50/80 border-l-4 border-blue-400 p-3 rounded-r-lg mb-3">
                                                    <p className="text-xs text-gray-700">
                                                      <span className="font-semibold text-blue-600">💡 AI Insight:</span> {post.rationale}
                                                    </p>
                                                  </div>
                                                )}

                                                <div className="flex items-center justify-between gap-2">
                                                  <div className="flex items-center gap-2">
                                                    {post.platforms.map(platform => (
                                                      <span key={platform} className="px-3 py-1.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-lg text-xs font-medium capitalize shadow-sm border border-gray-300">
                                                        {platform}
                                                      </span>
                                                    ))}
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    {!post.caption && !post.hashtags?.length && (
                                                      <button
                                                        onClick={() => handleGenerateContentForPost(post)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors"
                                                      >
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        Generate Content
                                                      </button>
                                                    )}
                                                    {(post.caption || post.hashtags?.length > 0) && (
                                                      <button
                                                        onClick={() => togglePostExpanded(post.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                                                      >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        {isExpanded ? 'Hide' : 'View'} Content
                                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              {isExpanded && (post.caption || post.hashtags?.length > 0) && (
                                                <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 space-y-3">
                                                  {post.caption && (
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                                      <div className="flex items-center gap-2 mb-2">
                                                        <FileText className="w-4 h-4 text-gray-600" />
                                                        <span className="text-xs font-semibold text-gray-600 uppercase">Caption</span>
                                                      </div>
                                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.caption}</p>
                                                    </div>
                                                  )}

                                                  {post.hashtags && post.hashtags.length > 0 && (
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                                      <div className="flex items-center gap-2 mb-2">
                                                        <Hash className="w-4 h-4 text-gray-600" />
                                                        <span className="text-xs font-semibold text-gray-600 uppercase">Hashtags</span>
                                                      </div>
                                                      <div className="flex flex-wrap gap-2">
                                                        {post.hashtags.map((tag, idx) => (
                                                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                            #{tag}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No posts in this plan yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!pendingPlanApproval && contentPlans.length === 0 && plannedPosts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
                  No AI-generated plans yet. Create your first content plan above!
                </p>
              </div>
            )}
          </>
        )}

        {showScheduleView && (
          <>
            <div className="mb-6 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    Smart Schedule Planner
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create recurring posting schedules automatically
                  </p>
                </div>
                <button
                  onClick={() => setShowSmartPlanner(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  Generate Schedule
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <Calendar
                  scheduledPosts={scheduledPosts}
                  plannedPosts={[...plannedPosts, ...previewSchedule]}
                  onDateSelect={setSelectedDate}
                  onPostClick={handleEditScheduledPost}
                  selectedDate={selectedDate}
                />
              </div>
              <div>
                <ScheduledPostsList
                  scheduledPosts={scheduledPosts}
                  plannedPosts={plannedPosts}
                  selectedDate={selectedDate}
                  onEdit={handleEditScheduledPost}
                  onDelete={handleDeletePost}
                />
              </div>
            </div>

            <AlarmClock userId={userId} />
          </>
        )}

        {showContentGenerator && (
          <>
            <StepNavigator
              currentStep={currentStep}
              onStepClick={handleStepClick}
              canNavigate={{
                step1: true,
                step2: generatedContent !== null,
                step3: generatedContent !== null && selectedTone !== null
              }}
            />
            {currentStep === 1 && (
              <>
                <InputSection onGenerate={handleGenerate} isGenerating={isGenerating} />
                <ContentHistory
                  history={contentHistory}
                  onLoadContent={handleLoadContent}
                  onDeleteContent={handleDeleteContent}
                />
                <GeneratedPostsLibrary
                  history={contentHistory}
                  onSchedulePost={handleScheduleFromLibrary}
                  onDeleteContent={handleDeleteContent}
                />
              </>
            )}

            {currentStep === 2 && generatedContent && (
              <>
                {showApprovalView ? (
                  <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <GeneratedContentApproval
                      content={generatedContent}
                      onApprove={handleApproveContent}
                      onReject={handleRejectContent}
                    />
                  </div>
                ) : (
                  <>
                    {visualSuggestions.length > 0 && (
                      <VisualSuggestions suggestions={visualSuggestions} />
                    )}

                    {postOutline && <PostOutline outline={postOutline} />}

                    <CaptionSelector content={generatedContent} onSelectTone={handleSelectTone} />
                    <HashtagDisplay
                      hashtags={generatedContent.hashtags}
                      onHashtagsChange={(updatedHashtags) => {
                        setGeneratedContent({
                          ...generatedContent,
                          hashtags: updatedHashtags
                        });
                      }}
                    />
                  </>
                )}
              </>
            )}

            {currentStep === 3 && generatedContent && (
              <>
                <PlatformPreviews
                  caption={getSelectedCaption()}
                  hashtags={generatedContent.hashtags}
                  imageUrl={imageUrl}
                  resizedImages={resizedImages}
                />

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Content saved!</h3>
                        <p className="text-sm text-gray-600">Your content is saved in Generated Posts. Create more content or schedule it from Calendar & Schedule.</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setCurrentStep(1);
                            setGeneratedContent(null);
                            setSelectedTone('casual');
                            setImageUrl(null);
                            setResizedImages(undefined);
                            setVisualSuggestions([]);
                            setPostOutline(null);
                            setShowApprovalView(false);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                        >
                          <Sparkles className="w-5 h-5" />
                          Save & Create New
                        </button>
                        <button
                          onClick={() => {
                            setShowScheduleView(true);
                            setShowContentGenerator(false);
                            setShowAIPlanningView(false);
                            setShowVideoTips(false);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center gap-2"
                        >
                          <CalendarDays className="w-5 h-5" />
                          Calendar & Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <ExportSection content={generatedContent} selectedCaption={getSelectedCaption()} />
              </>
            )}

            {!generatedContent && !isGenerating && brandProfile && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
                  Enter your description to generate on-brand content with AI visual suggestions
                </p>
              </div>
            )}
          </>
        )}
      </div>


      <ContentPlanGenerator
        isOpen={showPlanGenerator}
        onClose={() => setShowPlanGenerator(false)}
        onGeneratePlan={handleGenerateContentPlan}
        brandProfile={brandProfile}
      />

      <SmartSchedulePlanner
        isOpen={showSmartPlanner}
        onClose={() => setShowSmartPlanner(false)}
        onGenerateSchedule={handleGenerateSmartSchedule}
        onPreviewChange={handleSchedulePreviewChange}
      />

      <GeneratedPostScheduleModal
        isOpen={showGeneratedPostScheduleModal}
        onClose={() => {
          setShowGeneratedPostScheduleModal(false);
          setSelectedGeneratedPost(null);
        }}
        onSchedule={handleScheduleGeneratedPost}
        content={selectedGeneratedPost}
      />

      {ringingAlarm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-pulse">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <BellIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {ringingAlarm.title}
              </h2>
              {ringingAlarm.notes && (
                <p className="text-gray-600 mb-6">{ringingAlarm.notes}</p>
              )}
              <p className="text-sm text-gray-500 mb-6">
                {new Date(ringingAlarm.alarm_datetime).toLocaleString('en-SG', {
                  timeZone: 'Asia/Singapore',
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
              <button
                onClick={dismissAlarm}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold hover:from-orange-600 hover:to-red-700 transition-all"
              >
                Dismiss Alarm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
