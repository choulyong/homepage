'use client';

/**
 * Concert Form Component
 * Client component for creating new concerts
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Band {
  id: string;
  name: string;
  country: string | null;
}

interface ConcertFormProps {
  bands: Band[];
}

export default function ConcertForm({ bands }: ConcertFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    band_id: '',
    title: '',
    venue: '',
    city: '',
    country: '',
    event_date: '',
    ticket_url: '',
    youtube_url: '',
    youtube_playlist_url: '',
    poster_url: '',
    description: '',
    past_event: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error: insertError } = await supabase
        .from('concerts')
        .insert([
          {
            ...formData,
            band_id: formData.band_id || null,
            event_date: formData.event_date || null,
            created_by: 'admin',
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Success - redirect to concert page
      router.push(`/concerts/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create concert');
    } finally {
      setLoading(false);
    }
  };

  const handleBandChange = (bandId: string) => {
    const selectedBand = bands.find((b) => b.id === bandId);
    setFormData({
      ...formData,
      band_id: bandId,
      country: selectedBand?.country || formData.country,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Band Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Band <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.band_id}
          onChange={(e) => handleBandChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select a band...</option>
          {bands.map((band) => (
            <option key={band.id} value={band.id}>
              {band.name} {band.country && `(${band.country})`}
            </option>
          ))}
        </select>
      </div>

      {/* Concert Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Concert Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., World Tour 2025 - Seoul"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Venue, City, Country */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Venue</label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            placeholder="e.g., Olympic Stadium"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g., Seoul"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="e.g., South Korea"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Event Date & Past Event Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Event Date</label>
          <input
            type="datetime-local"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.past_event}
              onChange={(e) => setFormData({ ...formData, past_event: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 dark:border-zinc-700"
            />
            <span className="text-sm font-medium">Mark as Past Event</span>
          </label>
        </div>
      </div>

      {/* URLs */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Ticket URL</label>
          <input
            type="url"
            value={formData.ticket_url}
            onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">YouTube Video URL</label>
          <input
            type="url"
            value={formData.youtube_url}
            onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">YouTube Playlist URL</label>
          <input
            type="url"
            value={formData.youtube_playlist_url}
            onChange={(e) => setFormData({ ...formData, youtube_playlist_url: e.target.value })}
            placeholder="https://www.youtube.com/playlist?list=..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Poster Image URL</label>
          <input
            type="url"
            value={formData.poster_url}
            onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          placeholder="Concert description..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : '<¤ Create Concert'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
