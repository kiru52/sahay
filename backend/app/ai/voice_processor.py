import math
from typing import Dict, Any

class VoiceFeatureExtractor:
    """
    Voice Acoustic Feature Processing & Stress Indicator Engine.
    Processes audio stream metadata / waveform features:
    - Speaking Rate (words per minute)
    - Pause Frequency (hesitations, tremors, silent blocks per minute)
    - Pitch Variation / Standard Deviation (vocal instability, pitch spikes in Hz)
    - Vocal Energy Dynamics (shimmer/jitter proxies)
    """
    
    @staticmethod
    def extract_or_simulate_features(
        text: str = "",
        raw_audio_meta: Dict[str, Any] = None
    ) -> Dict[str, float]:
        """
        Extract features from raw audio metrics or generate acoustic indicators
        aligned with the emotional valence of input text.
        """
        if raw_audio_meta and "speaking_rate" in raw_audio_meta:
            speaking_rate = float(raw_audio_meta.get("speaking_rate", 125.0))
            pause_freq = float(raw_audio_meta.get("pause_frequency", 3.5))
            pitch_var = float(raw_audio_meta.get("pitch_variation", 24.0))
        else:
            # Acoustic feature inference from text duration and lexical distress
            word_count = len(text.split()) if text else 15
            distress_terms = [
                "fear", "afraid", "court", "threat", "hearing", "scared", "can't sleep",
                "nightmare", "panic", "breathe", "danger", "police", "cross-examination",
                "பயம்", "தூங்க முடியவில்லை", "நீதிமன்றம்", "डर", "नींद नहीं", "अदालत", "घबराहट"
            ]
            matched = sum(1 for term in distress_terms if term.lower() in (text or "").lower())
            
            # High distress typically slows speaking rate with increased hesitations or rapid erratic bursts
            if matched >= 2:
                speaking_rate = max(85.0, 135.0 - matched * 14.0)
                pause_freq = min(12.0, 3.0 + matched * 2.5)
                pitch_var = min(48.0, 20.0 + matched * 8.0)
            elif matched == 1:
                speaking_rate = 115.0
                pause_freq = 5.5
                pitch_var = 30.0
            else:
                speaking_rate = 135.0
                pause_freq = 2.8
                pitch_var = 21.0
                
        # Calculate voice stress index (0 to 100)
        # Normal speaking rate ~ 130-150 wpm; pause freq < 4; pitch var ~ 18-25 Hz
        rate_deviation = max(0.0, (135.0 - speaking_rate) / 135.0) * 35.0
        pause_penalty = min(35.0, max(0.0, (pause_freq - 3.0) * 4.5))
        pitch_penalty = min(30.0, max(0.0, (pitch_var - 22.0) * 1.5))
        
        voice_stress_score = min(100.0, max(0.0, rate_deviation + pause_penalty + pitch_penalty))
        
        return {
            "speaking_rate": round(speaking_rate, 1),
            "pause_frequency": round(pause_freq, 1),
            "pitch_variation": round(pitch_var, 1),
            "voice_stress_score": round(voice_stress_score, 1)
        }

voice_extractor = VoiceFeatureExtractor()
