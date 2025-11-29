/**
 * Admin Concert Creation Page
 * METALDRAGON Rock Community
 * Admin-only page to create concert entries
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ConcertForm from './ConcertForm';

export default async function NewConcertPage() {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'admin') {
    redirect('/');
  }

  // Get all bands for the dropdown
  const { data: bands } = await supabase
    .from('bands')
    .select('id, name, country')
    .order('name', { ascending: true });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-8">
          <span className="gradient-text">Create New Concert</span>
        </h1>

        <ConcertForm bands={bands || []} />
      </div>
    </div>
  );
}
