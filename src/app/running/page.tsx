/**
 * Running Tracker Page
 * AI-powered running records tracking with Gemini Vision API
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  analyzeRunningImage,
  saveRunningRecord,
  getRunningRecords,
  getRunningStats,
  getAICoaching,
  deleteRunningRecord,
} from '@/app/actions/running';
import type {
  RunningRecord,
  RunningStats,
  AICoachingAdvice,
  GeminiAnalysisResult,
} from '@/types/running';

export default function RunningPage() {
  const [records, setRecords] = useState<RunningRecord[]>([]);
  const [stats, setStats] = useState<RunningStats | null>(null);
  const [coaching, setCoaching] = useState<AICoachingAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<GeminiAnalysisResult | null>(
    null
  );
  const [editingData, setEditingData] = useState<Partial<GeminiAnalysisResult> | null>(
    null
  );

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [recordsResult, statsResult, coachingResult] = await Promise.all([
        getRunningRecords(),
        getRunningStats(),
        getAICoaching(),
      ]);

      if (recordsResult.success && recordsResult.records) {
        setRecords(recordsResult.records);
      } else {
        setError(recordsResult.error || 'Failed to load records');
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      if (coachingResult.success && coachingResult.advice) {
        setCoaching(coachingResult.advice);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractedData(null);
    setEditingData(null);
    setError(null);
    setSuccess(null);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeRunningImage(selectedImage);

      if (result.success && result.data) {
        setExtractedData(result.data);
        setEditingData(result.data);
        setSuccess('Image analyzed successfully! Review and save the data below.');
      } else {
        setError(result.error || 'Failed to analyze image');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!editingData) {
      setError('No data to save');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await saveRunningRecord({
        ...editingData,
        image_url: (extractedData as any)?.image_url,
      } as any);

      if (result.success) {
        setSuccess('Running record saved successfully!');
        setSelectedImage(null);
        setPreviewUrl(null);
        setExtractedData(null);
        setEditingData(null);
        loadData();
      } else {
        setError(result.error || 'Failed to save record');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save record');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const result = await deleteRunningRecord(id);
      if (result.success) {
        setSuccess('Record deleted successfully');
        loadData();
      } else {
        setError(result.error || 'Failed to delete record');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete record');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Running Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            AI-powered running records with personalized coaching
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Running Screenshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label
                  htmlFor="running-image"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Select Image
                </label>
                <input
                  id="running-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100
                           border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer
                           bg-white dark:bg-gray-800 focus:outline-none p-2"
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto max-h-96 rounded-lg border border-gray-300 dark:border-gray-700"
                  />
                </div>
              )}

              {/* Analyze Button */}
              {selectedImage && !extractedData && (
                <Button
                  onClick={handleAnalyzeImage}
                  disabled={analyzing}
                  className="w-full"
                >
                  {analyzing ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⚙️</span>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>Analyze Image with AI</>
                  )}
                </Button>
              )}

              {/* Extracted Data Form */}
              {editingData && (
                <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Review Extracted Data
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={editingData.date || ''}
                        onChange={(e) =>
                          setEditingData({ ...editingData, date: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingData.distance || ''}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            distance: parseFloat(e.target.value) || null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration (seconds)
                      </label>
                      <input
                        type="number"
                        value={editingData.duration_seconds || ''}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            duration_seconds: parseInt(e.target.value) || null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Avg Pace (min/km)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingData.pace_minutes || ''}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            pace_minutes: parseFloat(e.target.value) || null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Calories
                      </label>
                      <input
                        type="number"
                        value={editingData.calories || ''}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            calories: parseInt(e.target.value) || null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Course
                      </label>
                      <input
                        type="text"
                        value={editingData.course || ''}
                        onChange={(e) =>
                          setEditingData({ ...editingData, course: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editingData.notes || ''}
                      onChange={(e) =>
                        setEditingData({ ...editingData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Optional notes..."
                    />
                  </div>

                  <Button
                    onClick={handleSaveRecord}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? 'Saving...' : 'Save Record'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card variant="featured">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                  {stats.total_distance.toFixed(1)} km
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Distance
                </div>
              </CardContent>
            </Card>

            <Card variant="featured">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {stats.total_runs}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Runs
                </div>
              </CardContent>
            </Card>

            <Card variant="featured">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {formatPace(stats.average_pace)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Pace
                </div>
              </CardContent>
            </Card>

            <Card variant="featured">
              <CardContent className="text-center py-6">
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                  {stats.this_week.distance.toFixed(1)} km
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  This Week
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Coaching Panel */}
        {coaching && (
          <Card className="mb-8 border-l-4 border-teal-500">
            <CardHeader>
              <CardTitle>AI Coaching Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {coaching.overall_assessment}
                </p>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Strengths:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {coaching.strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Areas for Improvement:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {coaching.areas_for_improvement.map((area, i) => (
                      <li key={i}>{area}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Weekly Goal:
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {coaching.weekly_goal_suggestion}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Training Tips:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {coaching.training_tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Records List */}
        <Card>
          <CardHeader>
            <CardTitle>Running History</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No running records yet. Upload your first screenshot to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">
                          {record.distance.toFixed(2)} km
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatDuration(record.duration_seconds)}
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {formatPace(record.pace_minutes)}/km
                        </span>
                      </div>
                      {record.course && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Course: {record.course}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {record.notes}
                        </p>
                      )}
                      {record.image_url && (
                        <a
                          href={record.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-teal-600 dark:text-teal-400 hover:underline mt-2 inline-block"
                        >
                          View Screenshot
                        </a>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
