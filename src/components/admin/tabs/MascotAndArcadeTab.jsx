import React, { useState } from 'react';
import {
  Gamepad2,
  Trophy,
  Trash2,
  RotateCcw,
  Upload,
  Play,
  Square,
  MessageSquare,
  Volume2,
  Music,
} from 'lucide-react';
import { getApps } from 'firebase/app';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useStore } from '../../../context/StoreContext';
import { DEFAULT_MASCOT_PITCHES } from '../../../data/initialAdminData';
import { uploadImageFile } from '../../../services/firebaseClient';
import { getPublicSoundFiles } from '../../../utils/publicManifest';
import { soundFX } from '../../../utils/soundEffects';

const PITCH_LABELS = [
  { key: 'category-bubbles-menu', label: 'Top Category Buttons Menu Reaction' },
  { key: 'winter-collection', label: 'Winter & Holiday Collection Section' },
  { key: 'most-popular', label: 'Most Popular Favorites Section' },
  { key: 'customizer-section', label: 'Bottom Inline Customizer Studio' },
  { key: 'printed-pillows', label: 'Category: Printed Pillows' },
  { key: 'oddly-cozy-pillows', label: 'Category: Oddly Cozy Pillows' },
  { key: 'printed-blankets', label: 'Category: Printed Blankets' },
  { key: 'oddly-cozy-blankets', label: 'Category: Oddly Cozy Blankets' },
  { key: 'matching-sets', label: 'Category: Matching Sets' },
  { key: 'rugs', label: 'Category: Cozy Rugs' },
  { key: 'toys', label: 'Category: Toys & Squishies' },
];

const AUDIO_SLOTS = [
  {
    cmsKey: 'gameIntroMusic',
    label: '1. Intro Video Song ("Tap to Start" Screen)',
    subtitle: 'Loops while the portrait intro video plays before the player taps to take off.',
    defaultVal: '',
    isMusic: true,
  },
  {
    cmsKey: 'gameBgMusic',
    label: '2. Gameplay Background Music',
    subtitle: 'Loops while Puff is flying through the clouds.',
    defaultVal: '/sounds/bm.mp3',
    isMusic: true,
  },
  {
    cmsKey: 'gamePowerupSound',
    label: '3. Health Powerup SFX (Catching Pillows)',
    subtitle: 'Plays when Puff catches a cozy pillow or plushie to restore Star Health.',
    defaultVal: '/sounds/powerup.mp3',
    isMusic: false,
  },
  {
    cmsKey: 'gameBonkSound',
    label: '4. Hazard Hit / Bonk SFX (Taking Damage)',
    subtitle: 'Plays when Puff hits a storm cloud, alarm clock, or icicle.',
    defaultVal: '/sounds/bonk.mp3',
    isMusic: false,
  },
  {
    cmsKey: 'gameMoonbeamSound',
    label: '5. Moonbeam Shield SFX (2x Starlight Mode)',
    subtitle: 'Plays when Puff catches a glowing Moonbeam orb.',
    defaultVal: '/sounds/moonbeam.mp3',
    isMusic: false,
  },
];

async function uploadAudioAsset(file) {
  // 1. Try Firebase Cloud Storage first (supports full-length MP3 songs of any size)
  try {
    const apps = getApps();
    if (apps.length > 0) {
      const storage = getStorage(apps[0]);
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = storageRef(storage, `sounds/${Date.now()}_${cleanName}`);
      const snap = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snap.ref);
      if (downloadUrl) return downloadUrl;
    }
  } catch (err) {
    console.warn('Firebase Storage audio upload unavailable, checking fallback:', err.message);
  }

  // 2. If under 600KB (e.g. sound effects or short loops), encode as Data URL so it syncs directly in Firestore
  if (file.size <= 600 * 1024) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 3. For large MP3 songs when Firebase Storage isn't enabled, reference /sounds/<filename>
  alert(
    `Uploaded "${file.name}"! Because this song is ${(file.size / (1024 * 1024)).toFixed(
      1
    )}MB, also drop "${file.name}" into your public/sounds/ folder (or enable Firebase Storage) so it plays on all devices.`
  );
  return `/sounds/${file.name}`;
}

export default function MascotAndArcadeTab({ onLaunchTestGame }) {
  const {
    cms,
    updateCms,
    highScores,
    addHighScore,
    deleteHighScore,
    resetHighScores,
  } = useStore();

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadingAudioKey, setUploadingAudioKey] = useState(null);
  const [playingPreviewKey, setPlayingPreviewKey] = useState(null);

  const [newScoreName, setNewScoreName] = useState('');
  const [newScorePts, setNewScorePts] = useState(750);
  const [newScoreSec, setNewScoreSec] = useState(50);

  const availableSoundFiles = getPublicSoundFiles();
  const pitches = { ...DEFAULT_MASCOT_PITCHES, ...(cms.mascotPitches || {}) };

  const handlePitchChange = (sectionKey, newText) => {
    updateCms({
      mascotPitches: {
        ...pitches,
        [sectionKey]: newText,
      },
    });
  };

  const handleResetPitches = () => {
    updateCms({ mascotPitches: DEFAULT_MASCOT_PITCHES });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    try {
      const url = await uploadImageFile(file, 'arcade');
      updateCms({ gameIntroVideo: url });
    } catch (err) {
      alert('Video upload failed. Place the MP4 in public/ and type its path (e.g. /game_intro.mp4).');
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleAudioSlotUpload = async (cmsKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudioKey(cmsKey);
    try {
      const audioUrl = await uploadAudioAsset(file);
      updateCms({ [cmsKey]: audioUrl });
    } catch (err) {
      alert('Could not upload audio file. Please try an MP3, WAV, or OGG file.');
    } finally {
      setUploadingAudioKey(null);
      e.target.value = '';
    }
  };

  const handlePreviewSound = (slot) => {
    if (playingPreviewKey === slot.cmsKey) {
      soundFX.stopPreviewAudio();
      setPlayingPreviewKey(null);
      return;
    }
    const url = cms[slot.cmsKey] ?? slot.defaultVal;
    if (!url) {
      alert('No audio file selected for this slot yet! Pick a track or upload an MP3 first.');
      return;
    }
    const vol = slot.isMusic
      ? Number(cms.gameMusicVolume ?? 0.45)
      : Number(cms.gameSfxVolume ?? 0.85);
    setPlayingPreviewKey(slot.cmsKey);
    soundFX.previewAudioUrl(url, vol);
  };

  const handleResetDefaultAudio = () => {
    soundFX.stopPreviewAudio();
    setPlayingPreviewKey(null);
    updateCms({
      gameIntroMusic: '',
      gameBgMusic: '/sounds/bm.mp3',
      gamePowerupSound: '/sounds/powerup.mp3',
      gameBonkSound: '/sounds/bonk.mp3',
      gameMoonbeamSound: '/sounds/moonbeam.mp3',
      gameMusicVolume: 0.45,
      gameSfxVolume: 0.85,
    });
  };

  const handleAddManualScore = (e) => {
    e.preventDefault();
    if (!newScoreName) return;
    addHighScore({
      name: newScoreName,
      score: Number(newScorePts),
      survivalSec: Number(newScoreSec),
    });
    setNewScoreName('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">
            Puff Mascot AI, Cloud Dash Audio Studio & Leaderboard
          </h2>
          <p className="text-sm text-slate-600">
            Customize Puff’s sales pitches, upload custom intro/gameplay music & sound effects, and manage the High Score board.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.stopPreviewAudio();
            setPlayingPreviewKey(null);
            onLaunchTestGame();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8AC926] hover:bg-lime-400 text-slate-900 font-display font-bold text-base border-2 border-slate-900 shadow-[0_4px_0_#1E1E24] transition-transform hover:-translate-y-0.5"
        >
          <Play className="w-5 h-5 fill-slate-900" />
          Launch & Test Cloud Dash Game
        </button>
      </div>

      {/* SECTION 1: CLOUD DASH SOUND STUDIO & INTRO VIDEO MUSIC MANAGER */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
          <div>
            <h3 className="font-display text-2xl font-bold flex items-center gap-2">
              <Music className="w-6 h-6 text-[#FF595E]" />
              Cloud Dash Sound Studio & Intro Video Music
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Choose from existing files in <code className="font-mono">public/sounds/</code>, paste a URL, or upload a new MP3/WAV for the Intro Video, Gameplay Music, and Sound Effects!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {playingPreviewKey && (
              <button
                type="button"
                onClick={() => {
                  soundFX.stopPreviewAudio();
                  setPlayingPreviewKey(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500 text-white font-extrabold text-xs border-2 border-slate-900 flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                Stop Audio Preview
              </button>
            )}

            <button
              type="button"
              onClick={handleResetDefaultAudio}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs border-2 border-slate-900 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Default Sounds
            </button>
          </div>
        </div>

        {/* Master Volume Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/80 border-2 border-slate-900">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-extrabold uppercase text-slate-800 flex items-center justify-between">
              <span>🎵 Intro & Gameplay Music Volume</span>
              <span className="text-[#FF595E]">
                {Math.round(Number(cms.gameMusicVolume ?? 0.45) * 100)}%
              </span>
            </span>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={cms.gameMusicVolume ?? 0.45}
              onChange={(e) =>
                updateCms({ gameMusicVolume: parseFloat(e.target.value) })
              }
              className="accent-[#FF595E]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-extrabold uppercase text-slate-800 flex items-center justify-between">
              <span>🔊 Sound Effects Volume (Powerup, Bonk, Moonbeam)</span>
              <span className="text-indigo-600">
                {Math.round(Number(cms.gameSfxVolume ?? 0.85) * 100)}%
              </span>
            </span>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={cms.gameSfxVolume ?? 0.85}
              onChange={(e) =>
                updateCms({ gameSfxVolume: parseFloat(e.target.value) })
              }
              className="accent-indigo-600"
            />
          </label>
        </div>

        {/* 5 Audio Slot Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {AUDIO_SLOTS.map((slot) => {
            const currentVal =
              cms[slot.cmsKey] !== undefined ? cms[slot.cmsKey] : slot.defaultVal;
            const isDataUrl =
              typeof currentVal === 'string' && currentVal.startsWith('data:');
            const isTesting = playingPreviewKey === slot.cmsKey;

            return (
              <div
                key={slot.cmsKey}
                className={`p-4 rounded-2xl border-2 border-slate-900 flex flex-col justify-between gap-3 ${
                  slot.cmsKey === 'gameIntroMusic'
                    ? 'bg-indigo-50/90 lg:col-span-2'
                    : 'bg-slate-50'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display font-bold text-base text-slate-900">
                      {slot.label}
                    </h4>
                    <p className="text-xs text-slate-600">{slot.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreviewSound(slot)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs border-2 border-slate-900 flex items-center gap-1.5 shadow-[0_2px_0_#1E1E24] ${
                        isTesting
                          ? 'bg-rose-500 text-white'
                          : 'bg-[#FFCA3A] hover:bg-amber-300 text-slate-900'
                      }`}
                    >
                      {isTesting ? (
                        <>
                          <Square className="w-3 h-3 fill-white" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          Test Sound
                        </>
                      )}
                    </button>

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs border-2 border-slate-900 shadow-[0_2px_0_#1E1E24] cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {uploadingAudioKey === slot.cmsKey
                          ? 'Uploading...'
                          : 'Upload MP3/WAV'}
                      </span>
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.ogg,.m4a"
                        onChange={(e) => handleAudioSlotUpload(slot.cmsKey, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Dropdown to quick-pick from public/sounds/ */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                      Quick-Pick from public/sounds/
                    </label>
                    <select
                      value={
                        availableSoundFiles.includes(currentVal) ? currentVal : ''
                      }
                      onChange={(e) => {
                        soundFX.stopPreviewAudio();
                        setPlayingPreviewKey(null);
                        updateCms({ [slot.cmsKey]: e.target.value });
                      }}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold bg-white"
                    >
                      <option value="">
                        {slot.cmsKey === 'gameIntroMusic'
                          ? '-- No Intro Music (Silent Video) --'
                          : '-- Custom Uploaded / URL --'}
                      </option>
                      {availableSoundFiles.map((soundUrl) => (
                        <option key={soundUrl} value={soundUrl}>
                          {soundUrl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Direct Path / URL Input */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                      Active Audio Path or URL
                    </label>
                    <input
                      type="text"
                      value={isDataUrl ? 'Uploaded Custom Audio File (Data URL)' : currentVal}
                      readOnly={isDataUrl}
                      onChange={(e) => updateCms({ [slot.cmsKey]: e.target.value })}
                      placeholder={
                        slot.cmsKey === 'gameIntroMusic'
                          ? 'Upload an MP3 or type /sounds/intro.mp3'
                          : slot.defaultVal
                      }
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-semibold bg-white"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PUFF MASCOT DIALOGUE & HIGH SCORE LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-5">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#FF595E]" />
              Puff Floating Mascot Controls
            </h3>

            <label className="inline-flex items-center gap-2 text-xs font-extrabold cursor-pointer bg-slate-100 px-3 py-1.5 rounded-full border border-slate-300">
              <input
                type="checkbox"
                checked={cms.mascotEnabled !== false}
                onChange={(e) => updateCms({ mascotEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-600"
              />
              <span>Show Puff on Storefront</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                Promo Code Puff Copies on Click
              </label>
              <input
                type="text"
                value={cms.mascotPromoCode || 'COZY15'}
                onChange={(e) =>
                  updateCms({ mascotPromoCode: e.target.value.toUpperCase() })
                }
                className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-900 font-extrabold text-sm uppercase"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetPitches}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs border-2 border-slate-900 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Pitches to Default
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {PITCH_LABELS.map((item) => (
              <div key={item.key} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  {item.label}
                </label>
                <textarea
                  rows={2}
                  value={pitches[item.key] || ''}
                  onChange={(e) => handlePitchChange(item.key, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-semibold bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-indigo-600" />
              Cloud Dash Reward & Intro Video File
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Target Score
                </label>
                <input
                  type="number"
                  value={cms.gameRewardScore ?? 500}
                  onChange={(e) =>
                    updateCms({ gameRewardScore: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Or Survival (Sec)
                </label>
                <input
                  type="number"
                  value={cms.gameRewardSeconds ?? 45}
                  onChange={(e) =>
                    updateCms({ gameRewardSeconds: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                  Prize Promo Code
                </label>
                <input
                  type="text"
                  value={cms.gameRewardCode || 'SKYDASH20'}
                  onChange={(e) =>
                    updateCms({ gameRewardCode: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 font-extrabold text-sm uppercase text-emerald-700"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-extrabold uppercase text-slate-500">
                Looping Intro Video Path (.mp4)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cms.gameIntroVideo || '/game_intro.mp4'}
                  onChange={(e) => updateCms({ gameIntroVideo: e.target.value })}
                  placeholder="/game_intro.mp4"
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-900 text-xs font-bold"
                />
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs border-2 border-slate-900 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingVideo ? 'Uploading...' : 'Upload MP4'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                High Score Leaderboard ({highScores.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset High Score board back to default scores?')) {
                    resetHighScores();
                  }
                }}
                className="px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-extrabold border border-rose-300"
              >
                Reset Board
              </button>
            </div>

            <form onSubmit={handleAddManualScore} className="flex gap-2">
              <input
                type="text"
                maxLength={12}
                placeholder="Player Name"
                value={newScoreName}
                onChange={(e) => setNewScoreName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-bold uppercase"
              />
              <input
                type="number"
                value={newScorePts}
                onChange={(e) => setNewScorePts(e.target.value)}
                className="w-20 px-2 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-bold"
                title="Points"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-900 font-extrabold text-xs border-2 border-slate-900"
              >
                + Add
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {highScores.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div>
                    <span className="font-extrabold text-slate-900">
                      #{idx + 1} {entry.name}
                    </span>
                    <span className="text-slate-400 text-[10px] ml-2">
                      {entry.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-indigo-600">
                      {entry.score} pts ({entry.survivalSec}s)
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteHighScore(entry.id)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Delete score"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
