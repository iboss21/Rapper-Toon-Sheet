import { GenerateOptions } from '@rapper-toon-sheet/shared';
import { Info } from 'lucide-react';

interface OptionsFormProps {
  options: GenerateOptions;
  onOptionsChange: (options: GenerateOptions) => void;
}

export function OptionsForm({ options, onOptionsChange }: OptionsFormProps) {
  const updateOption = <K extends keyof GenerateOptions>(
    key: K,
    value: GenerateOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Nickname */}
      <div>
        <label className="label">Character Name/Nickname</label>
        <input
          type="text"
          className="input"
          placeholder="e.g., LIL TECH"
          value={options.nickname || ''}
          onChange={(e) => updateOption('nickname', e.target.value)}
          maxLength={30}
        />
        <p className="text-xs text-gray-400 mt-1">
          This will appear on your character sheet
        </p>
      </div>

      {/* Style Preset */}
      <div>
        <label className="label">Style Preset</label>
        <select
          className="input"
          value={options.stylePreset}
          onChange={(e) => updateOption('stylePreset', e.target.value as any)}
        >
          <option value="cartoon_realism">Cartoon Realism (Default)</option>
          <option value="anime_ish">Anime-ish</option>
          <option value="comic_ink">Comic Ink</option>
          <option value="clean_cell_shade">Clean Cell-shade</option>
        </select>
      </div>

      {/* Layout */}
      <div>
        <label className="label">Reference Sheet Layout</label>
        <select
          className="input"
          value={options.layout}
          onChange={(e) => updateOption('layout', e.target.value as any)}
        >
          <option value="single_poster">Single Poster</option>
          <option value="two_posters">Two Posters</option>
        </select>
      </div>

      {/* Background */}
      <div>
        <label className="label">Background</label>
        <select
          className="input"
          value={options.background}
          onChange={(e) => updateOption('background', e.target.value as any)}
        >
          <option value="neon_city_blur">Neon City Blur (Default)</option>
          <option value="plain_studio_grey">Plain Studio Grey</option>
          <option value="transparent">Transparent</option>
        </select>
      </div>

      {/* Include Options */}
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeTurnaround}
            onChange={(e) => updateOption('includeTurnaround', e.target.checked)}
            className="w-5 h-5 rounded border-gray-700 bg-dark-light text-primary focus:ring-primary"
          />
          <span className="text-gray-300">Include Full Turnarounds (front/side/back)</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeActionPoses}
            onChange={(e) => updateOption('includeActionPoses', e.target.checked)}
            className="w-5 h-5 rounded border-gray-700 bg-dark-light text-primary focus:ring-primary"
          />
          <span className="text-gray-300">Include Action Poses</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.faceConsistencyLock}
            onChange={(e) => updateOption('faceConsistencyLock', e.target.checked)}
            className="w-5 h-5 rounded border-gray-700 bg-dark-light text-primary focus:ring-primary"
          />
          <span className="text-gray-300 flex items-center">
            Face Consistency Lock
            <Info className="w-4 h-4 ml-1 text-gray-500" />
          </span>
        </label>
        {options.faceConsistencyLock && (
          <p className="text-xs text-gray-400 ml-8">
            Generates a reference headshot first to maintain better facial consistency across all views
          </p>
        )}
      </div>

      {/* Seed (Advanced) */}
      <div>
        <label className="label">Seed (Optional - for repeatability)</label>
        <input
          type="number"
          className="input"
          placeholder="Leave empty for random"
          value={options.seed || ''}
          onChange={(e) => updateOption('seed', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <p className="text-xs text-gray-400 mt-1">
          Use the same seed to recreate similar results
        </p>
      </div>
    </div>
  );
}
