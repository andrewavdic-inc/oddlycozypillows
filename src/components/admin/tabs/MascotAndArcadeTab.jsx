import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  Trash2,
  RotateCcw,
  Volume2,
  Upload,
  Check,
  MessageSquare,
  Video,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { DEFAULT_MASCOT_PITCHES } from '../../../data/initialAdminData';
import { uploadImageFile } from '../../../services/firebaseClient';
import { resolveLogoVariant } from '../../../utils/publicManifest';
import { soundFX } from '../../../utils/soundEffects';

const PITCH_SECTIONS = [
  { key: 'category-bubbles-menu', label: 'Floating Category Button Menu (Top Row)' },
  { key: 'winter-collection', label: 'Winter & Holiday Collection (Home Top)' },
  { key: 'most-popular', label: 'Most Popular Favorites (Home Middle)' },
  { key: 'customizer-section', label: 'Interactive Customizer Studio (Home Bottom)' },
  { key: 'printed-pillows', label: 'Category: Printed Pillows' },
  { key: 'oddly-cozy-pillows', label: 'Category: Oddly Cozy Pillows (Plushies)' },
  { key: 'printed-blankets', label: 'Category: Printed Blankets' },
  { key: 'oddly-cozy-blankets', label: 'Category: Oddly Cozy Blankets' },
  { key: 'matching-sets', label: 'Category: Matching Sets' },
  { key: 'rugs', label: 'Category: Cozy Rugs' },
  { key: 'toys', label: 'Category: Toys & Squishies' },
];

export default function MascotAndArcadeTab({ onLaunchTestGame }) {
  const {
    cms,
    updateCms,
    highScores,
    deleteHighScore,
    resetHighScores,
    addHighScore,
  } = useStore();

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [manualScoreName, setManualScoreName] = useState('');
  const [manualScorePts, setManualScorePts] = useState('');

  const mascotLogo = resolveLogoVariant({ theme: 'color', blink: false, withUrl: false });
  const currentPitches = {
    ...DEFAULT_MASCOT_PITCHES,
    ...(cms.mascotPitches || {}),
  };

  const handlePitchChange = (sectionKey, newText) => {
    updateCms({
      mascotPitches: {
        ...currentPitches,
        [sectionKey]: newText,
      },
    });
  };

  const handleResetPitches = () => {
    updateCms({ mascotPitches: DEFAULT_MASCOT_PITCHES });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2200);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    try {
      const url = await uploadImageFile(file, 'arcade');
      updateCms({ gameIntroVideo: url });
    } catch (err) {
      alert('Could not upload video file. Try placing the MP4 in public/ or check Firebase Storage.');
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleAddManualScore = (e) => {
    e.preventDefault();
    if (!manualScoreName || !manualScorePts) return;
    addHighScore({
      name: manualScoreName,
      score: Number(manualScorePts),
      survivalSec: Math.round(Number(manualScorePts) / 14),
    });
    setManualScoreName('');
    setManualScorePts('');
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header & Quick Test Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold flex items-center gap-2.5">
            <span>Puff Mascot & Cloud Dash Arcade</span>
            <Sparkles className="w-7 h-7 text-amber-500" />
          </h2>
          <p className="text-sm text-slate-600">
            Customize Puff’s scroll-aware sales pitches, manage the 9:20 portrait Cloud Dash game, and moderate the live High Score Leaderboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => soundFX.playWakeupSequenceSound()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-300 hover:bg-amber-400 text-slate-900 font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24]"
          >
            <Volume2 className="w-4 h-4" />
            Test Puff Sounds
          </button>

          <button
            type="button"
            onClick={onLaunchTestGame}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8AC926] hover:bg-lime-400 text-slate-900 font-extrabold text-xs border-2 border-slate-900 shadow-[0_3px_0_#1E1E24]"
          >
            <Gamepad2 className="w-4 h-4" />
            Launch Cloud Dash Game Now
          </button>
        </div>
      </div>

      {savedBanner && (
        <div className="p-3 rounded-2xl bg-emerald-100 border-2 border-emerald-700 text-emerald-900 text-xs font-extrabold flex items-center gap-2">
          <Check className="w-4 h-4" />
          Mascot & Arcade settings synced to cloud!
        </div>
      )}

      {/* 1. PUFF MASCOT MASTER SETTINGS & DIALOGUE */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={mascotLogo}
              alt="Puff Mascot"
              className="w-14 h-14 object-contain drop-shadow"
            />
            <div>
              <h3 className="font-display text-xl font-bold">
                1. Puff Floating Mascot Controls
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Toggle Puff on/off on the storefront and set which promo code he copies when shoppers click his speech bubble.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-100 border-2 border-slate-900 cursor-pointer">
            <input
              type="checkbox"
              checked={cms.mascotEnabled !== false}
              onChange={(e) => updateCms({ mascotEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-600"
            />
            <span className="text-xs font-extrabold text-slate-900">
              {cms.mascotEnabled !== false ? 'Puff Mascot Active on Store' : 'Puff Hidden'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Promo Code Puff Copies on Click
            </label>
            <input
              type="text"
              value={cms.mascotPromoCode || 'COZY15'}
              onChange={(e) =>
                updateCms({ mascotPromoCode: e.target.value.toUpperCase() })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 font-extrabold text-sm uppercase"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetPitches}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border-2 border-slate-300 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore Default Section Pitches
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#FF595E]" />
            Section-by-Section Sales Pitches (Auto-Saves as You Type)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {PITCH_SECTIONS.map((sec) => (
              <div
                key={sec.key}
                className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-1"
              >
                <label className="block text-[11px] font-extrabold text-slate-700">
                  {sec.label}
                </label>
                <textarea
                  rows={2}
                  value={currentPitches[sec.key] || ''}
                  onChange={(e) => handlePitchChange(sec.key, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:border-slate-900 bg-white text-xs font-semibold outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PUFF'S CLOUD DASH GAME SETTINGS & INTRO VIDEO */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-3">
          <div>
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-600" />
              2. Cloud Dash Intro Video & Discount Reward Rules
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Configure the looping 9:20 portrait intro video and the score/time needed to unlock the secret discount code.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold border-2 border-slate-900 shadow-[0_3px_0_#1E1E24] cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>
              {isUploadingVideo ? 'Uploading MP4...' : 'Upload New Intro MP4'}
            </span>
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Looping Intro Video Path / URL
            </label>
            <input
              type="text"
              value={cms.gameIntroVideo || '/game_intro.mp4'}
              onChange={(e) => updateCms({ gameIntroVideo: e.target.value })}
              placeholder="/game_intro.mp4"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Points Needed for Prize
            </label>
            <input
              type="number"
              value={cms.gameRewardScore ?? 500}
              onChange={(e) =>
                updateCms({ gameRewardScore: Number(e.target.value) })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Or Survival Seconds
            </label>
            <input
              type="number"
              value={cms.gameRewardSeconds ?? 45}
              onChange={(e) =>
                updateCms({ gameRewardSeconds: Number(e.target.value) })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1">
              Secret Reward Promo Code Unlocked on Win
            </label>
            <input
              type="text"
              value={cms.gameRewardCode || 'SKYDASH20'}
              onChange={(e) =>
                updateCms({ gameRewardCode: e.target.value.toUpperCase() })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 text-sm font-extrabold uppercase text-emerald-700"
            />
          </div>
        </div>
      </div>

      {/* 3. LIVE HIGH SCORE LEADERBOARD MODERATION */}
      <div className="bg-white rounded-3xl border-3 border-slate-900 p-6 shadow-[0_6px_0_#1E1E24] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-3">
          <div>
            <h3 className="font-display text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              3. Cloud Dash High Score Leaderboard ({highScores.length} Entries)
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Remove test or inappropriate entries, add a target score to beat, or reset the board for a new contest.
            </p>
          </div>

          <button
            type="button"
            onClick={resetHighScores}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border-2 border-rose-300 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Leaderboard to Defaults
          </button>
        </div>

        {/* Add Custom Target Score */}
        <form
          onSubmit={handleAddManualScore}
          className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200"
        >
          <span className="text-xs font-extrabold text-slate-700 mr-1">
            Add Target Score:
          </span>
          <input
            type="text"
            maxLength={12}
            placeholder="Name (e.g. PUFF_BOSS)"
            value={manualScoreName}
            onChange={(e) => setManualScoreName(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-bold uppercase"
          />
          <input
            type="number"
            placeholder="Points (e.g. 1500)"
            value={manualScorePts}
            onChange={(e) => setManualScorePts(e.target.value)}
            className="w-32 px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-bold"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-amber-300 font-extrabold text-xs"
          >
            + Add Score
          </button>
        </form>

        {/* Leaderboard Table */}
        <div className="space-y-2">
          {highScores.map((entry, idx) => (
            <div
              key={entry.id || idx}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-slate-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-amber-300 font-display font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div>
                  <span className="font-display font-bold text-sm text-slate-900 block">
                    {entry.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Survived {entry.survivalSec}s • {entry.date || 'Live'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-display font-bold text-base text-emerald-700">
                  {entry.score} pts
                </span>
                <button
                  type="button"
                  onClick={() => deleteHighScore(entry.id)}
                  title="Delete this score"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
