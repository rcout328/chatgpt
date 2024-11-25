"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStoredInput } from '@/hooks/useStoredInput';
import StartupChatbot from '@/components/StartupChatbot';

export default function Home() {
  return <StartupChatbot />;
} 