import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const VoiceCheckinModal = ({ isOpen, onClose, victimId = 'V-1042', onCheckinSuccess }) => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [speechText, setSpeechText] = useState('');
  const [mood, setMood] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Voice acoustic metrics state
  const [voiceMetrics, setVoiceMetrics] = useState({
    speakingRate: 130,
    pauseFrequency: 3.2,
    pitchVariation: 22.0
  });

  // Simulated recording timer and waveform
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isOpen) return null;

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate live speech recognition after 3 seconds
      setTimeout(() => {
        const sampleSpoken = "I have been feeling very anxious and terrified about the upcoming court hearing in two days. I cannot sleep at night.";
        setSpeechText(sampleSpoken);
        setTextInput(sampleSpoken);
        setVoiceMetrics({
          speakingRate: 96,
          pauseFrequency: 7.8,
          pitchVariation: 41.5
        });
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalContent = textInput || speechText;
    if (!finalContent) {
      addToast('Please record a voice check-in or type a message.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        victim_id: victimId,
        text_response: finalContent,
        speech_to_text: speechText || finalContent,
        speaking_rate: voiceMetrics.speakingRate,
        pause_frequency: voiceMetrics.pauseFrequency,
        pitch_variation: voiceMetrics.pitchVariation,
        self_reported_mood: mood,
        engagement_delay_days: 0.0
      };

      const result = await api.submitCheckin(payload);
      addToast('Check-in submitted successfully! AI analysis updated your well-being trajectory.', 'success');
      if (onCheckinSuccess) onCheckinSuccess(result);
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Error submitting check-in: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('voice_checkin.modal_title')}</h2>
            <p className="text-xs text-slate-500">{t('victim_dashboard.calm_subtext')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Main Question Card */}
          <div className="bg-gradient-to-br from-teal-50/60 to-slate-50 border border-teal-100/80 rounded-2xl p-4 text-center">
            <p className="text-base font-semibold text-slate-800">
              "{t('voice_checkin.prompt_question')}"
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {t('voice_checkin.prompt_instruction')}
            </p>

            {/* Voice Recorder Action */}
            <div className="my-5 flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleToggleRecording}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-lg ${
                  isRecording
                    ? 'bg-rose-600 text-white shadow-rose-200 animate-pulse'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200 hover:scale-105'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                {isRecording && (
                  <span className="absolute -bottom-6 text-[11px] font-bold font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Recording: 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  </span>
                )}
              </button>

              {/* Animated Waveform Visualizer */}
              {isRecording && (
                <div className="flex items-center gap-1.5 h-8 mt-4">
                  {[40, 75, 90, 60, 100, 45, 80, 95, 50, 85, 65, 30].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-teal-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.max(15, (h * Math.random()).toFixed(0))}%`,
                        animationDuration: `${0.4 + (i % 4) * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Voice Indicators Live Telemetry */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-teal-100/60 text-center">
              <div className="bg-white/80 rounded-xl p-2 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Speaking Rate</div>
                <div className="text-sm font-bold text-slate-800">{voiceMetrics.speakingRate} <span className="text-[10px] text-slate-400">wpm</span></div>
              </div>
              <div className="bg-white/80 rounded-xl p-2 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Pause Frequency</div>
                <div className="text-sm font-bold text-slate-800">{voiceMetrics.pauseFrequency} <span className="text-[10px] text-slate-400">/min</span></div>
              </div>
              <div className="bg-white/80 rounded-xl p-2 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Pitch Variation</div>
                <div className="text-sm font-bold text-slate-800">{voiceMetrics.pitchVariation} <span className="text-[10px] text-slate-400">Hz</span></div>
              </div>
            </div>
          </div>

          {/* Speech to text & Text input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {speechText ? t('voice_checkin.speech_detected') : t('voice_checkin.text_placeholder')}
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={3}
              placeholder="Type your feelings or spoken transcript will appear here..."
              className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Self-reported mood slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('voice_checkin.mood_rating_label')}
              </label>
              <span className="text-sm font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                {mood === 1 ? '1 - Very Low / Anxious' : mood === 2 ? '2 - Low' : mood === 3 ? '3 - Neutral' : mood === 4 ? '4 - Good' : '5 - Calm / Safe'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMood(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                    mood === num
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {t('general.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-100 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  {t('voice_checkin.analyzing')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('voice_checkin.btn_submit_checkin')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
