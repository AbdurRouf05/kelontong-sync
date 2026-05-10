import { redirect } from 'next/navigation';

export default function SettingsPage() {
  // Redirect otomatis dari /dashboard/settings ke /dashboard/settings/store
  redirect('/dashboard/settings/store');
}
