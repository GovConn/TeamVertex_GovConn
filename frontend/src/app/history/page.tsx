// app/history/page.tsx
"use client";
import HistoryPage from '@/components/HistoryPage';
import { useRouter } from 'next/navigation';

export default function History() {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Goes to previous page
    // Or redirect to a specific page:
    //router.push('/dashboard');
  };

  return <HistoryPage onBack={handleBack} />;
}
