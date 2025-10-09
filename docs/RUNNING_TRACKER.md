# Running Tracker System Documentation

## Overview

The Running Tracker is an AI-powered running records management system that uses Google Gemini Vision API to automatically extract data from running app screenshots. It provides personalized coaching advice based on your running performance.

## Features

### 1. AI-Powered Image Analysis
- **Automatic Data Extraction**: Upload a screenshot from any running app (Strava, Nike Run Club, etc.)
- **Gemini Vision API**: Analyzes images and extracts:
  - Date of run
  - Distance (km)
  - Duration (seconds)
  - Average pace (min/km)
  - Calories burned
  - Course/location information
  - Additional notes (weather, time of day, etc.)

### 2. Running Records Management
- **CRUD Operations**: Create, read, update, and delete running records
- **Data Review**: Review and edit AI-extracted data before saving
- **Image Storage**: Original screenshots stored in Supabase Storage
- **History View**: Complete running history with detailed information

### 3. Statistics Dashboard
- **Total Distance**: Lifetime running distance
- **Total Runs**: Number of completed runs
- **Average Pace**: Overall average pace per km
- **Weekly Progress**: Distance and runs this week
- **Monthly Progress**: Distance and runs this month
- **Best Pace**: Personal best pace
- **Longest Run**: Maximum distance achieved

### 4. AI Coaching Advice
Personalized coaching based on recent performance (last 30 days):
- **Overall Assessment**: Summary of your recent performance
- **Strengths**: What you're doing well
- **Areas for Improvement**: Where you can improve
- **Weekly Goal**: Specific, achievable goal for next week
- **Training Tips**: 4-5 actionable training tips
- **Rest Recommendation**: Advice on recovery and rest days

## Technical Architecture

### Frontend (`/src/app/running/page.tsx`)
- **Framework**: Next.js 15 with React Server Components
- **UI Components**: Custom Card and Button components with Tailwind CSS
- **State Management**: React useState and useEffect hooks
- **File Upload**: Native HTML file input with preview
- **Real-time Updates**: Automatic data reload after mutations

### Backend (`/src/app/actions/running.ts`)
Server Actions for all operations:

1. **analyzeRunningImage(imageFile)**
   - Uploads image to Supabase Storage (`running-images` bucket)
   - Converts image to base64
   - Sends to Gemini Vision API with structured prompt
   - Parses JSON response
   - Returns extracted data with image URL

2. **saveRunningRecord(data)**
   - Validates required fields (date, distance, duration)
   - Calculates pace if not provided
   - Inserts record into `running_records` table
   - Generates AI coaching advice
   - Revalidates `/running` page cache

3. **getRunningRecords(limit, offset)**
   - Fetches records for current user
   - Ordered by date (newest first)
   - Supports pagination

4. **getRunningStats()**
   - Calculates comprehensive statistics
   - Aggregates data for weekly/monthly metrics
   - Returns formatted statistics object

5. **getAICoaching(userId?)**
   - Fetches last 30 days of records
   - Generates personalized coaching with Gemini AI
   - Returns structured advice object

6. **deleteRunningRecord(recordId)**
   - Deletes record (RLS ensures user ownership)
   - Revalidates page cache

7. **updateRunningRecord(recordId, updates)**
   - Updates specific fields
   - RLS ensures user ownership

### Database Schema

**Table**: `running_records`

```sql
CREATE TABLE running_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  distance NUMERIC,
  duration_seconds INTEGER,
  pace_minutes NUMERIC,
  calories INTEGER,
  course TEXT,
  weather TEXT,
  temperature NUMERIC,
  run_type TEXT,
  notes TEXT,
  ai_analysis JSONB,
  ai_advice TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Users can only view/edit their own records
- Authenticated users can insert new records
- Public cannot access running records

### Storage Bucket

**Bucket**: `running-images`
- **Public**: Yes (for viewing images)
- **Path Structure**: `{user_id}/{timestamp}-{filename}`
- **Policies**:
  - Public can view all images
  - Authenticated users can upload to their own folder
  - Users can only delete/update their own images

## Usage Guide

### 1. Upload Screenshot
1. Click "Select Image" button
2. Choose a running app screenshot from your device
3. Preview appears automatically

### 2. Analyze with AI
1. Click "Analyze Image with AI" button
2. Wait for Gemini Vision API to process (5-10 seconds)
3. Extracted data appears in editable form

### 3. Review and Edit
1. Review all extracted fields
2. Edit any incorrect values
3. Add optional notes
4. Click "Save Record"

### 4. View Statistics
- Automatically updated after saving
- Real-time statistics dashboard
- Color-coded metrics

### 5. Get AI Coaching
- Updates automatically based on recent runs
- Personalized advice refreshes after each save
- Considers training patterns and consistency

## Environment Variables

Required in `.env.local`:

```bash
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xhzqhvjkkfpeavdphoit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Getting Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and paste into `.env.local`

## API Integration Details

### Gemini Vision API

**Model**: `gemini-1.5-flash`
**Input Format**:
```typescript
{
  inlineData: {
    data: base64_encoded_image,
    mimeType: "image/jpeg" or "image/png"
  }
}
```

**Prompt Structure**:
- Requests JSON-formatted response
- Specifies exact field names and types
- Handles null values for missing data
- Includes validation rules

**Response Parsing**:
- Extracts JSON from markdown code blocks
- Validates structure
- Fallback to manual entry on parse errors

### Supabase Storage API

**Upload**:
```typescript
supabase.storage
  .from('running-images')
  .upload(fileName, file, {
    contentType: file.type,
    upsert: false
  });
```

**Get Public URL**:
```typescript
supabase.storage
  .from('running-images')
  .getPublicUrl(fileName);
```

## Error Handling

### Image Analysis Errors
- **No JSON in response**: Prompts manual entry
- **Upload failure**: Shows error message with details
- **API rate limits**: Suggests waiting before retry

### Database Errors
- **Missing required fields**: Validation before save
- **RLS policy violations**: Proper error messages
- **Network errors**: Retry suggestions

### File Upload Errors
- **File too large**: 5MB limit enforced by Supabase
- **Invalid file type**: Only images accepted
- **Upload timeout**: Retry mechanism

## Performance Optimizations

1. **Image Compression**: Consider implementing client-side compression
2. **Caching**: Statistics cached and revalidated on updates
3. **Pagination**: Records loaded in batches (default 50)
4. **Lazy Loading**: AI coaching loads after initial page render

## Future Enhancements

### Planned Features
- [ ] Manual record entry (without image)
- [ ] Record editing UI
- [ ] Export to CSV/JSON
- [ ] Training plan generator
- [ ] Progress charts (distance/pace over time)
- [ ] Goal setting and tracking
- [ ] Route mapping integration
- [ ] Social sharing
- [ ] Weekly summary emails

### Technical Improvements
- [ ] Image compression before upload
- [ ] Batch analysis (multiple images)
- [ ] OCR fallback if Gemini fails
- [ ] Voice input for notes
- [ ] Mobile app integration
- [ ] Strava/Nike Run Club direct sync

## Troubleshooting

### Images Not Uploading
1. Check file size (< 5MB)
2. Verify file format (JPG, PNG)
3. Check Supabase Storage bucket exists
4. Verify RLS policies are correct

### AI Analysis Not Working
1. Check GEMINI_API_KEY in .env.local
2. Verify API quota not exceeded
3. Check image quality (clear, readable text)
4. Try different image format

### No Coaching Advice
1. Upload at least 3 runs
2. Check date range (last 30 days)
3. Verify Gemini API is responding
4. Check browser console for errors

### Statistics Not Updating
1. Hard refresh page (Ctrl+Shift+R)
2. Check if record was saved successfully
3. Verify database connection
4. Check RLS policies

## Testing

### Manual Testing Steps
1. **Image Upload**: Upload a test running screenshot
2. **AI Analysis**: Verify correct data extraction
3. **Data Edit**: Modify extracted values
4. **Save**: Confirm record appears in history
5. **Statistics**: Verify stats update correctly
6. **Coaching**: Check AI advice is relevant
7. **Delete**: Remove test record

### Test Images
Use screenshots from:
- Strava
- Nike Run Club
- Apple Health
- Google Fit
- Garmin Connect

## Support and Documentation

- **Main Documentation**: `/docs/RUNNING_TRACKER.md` (this file)
- **Type Definitions**: `/src/types/running.ts`
- **Server Actions**: `/src/app/actions/running.ts`
- **Frontend**: `/src/app/running/page.tsx`
- **Migration**: `/supabase/migrations/create_running_images_bucket.sql`

## License

Part of metaldragon.co.kr personal portal project.
