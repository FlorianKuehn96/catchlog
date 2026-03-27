'use client';

import { useState } from 'react';
import LureRecommendationModal from './LureRecommendationModal';
import { LureRecommendation, Weather } from '@/types';

interface LureRecommendationButtonProps {
  fishType: string;
  weather?: Weather;
  waterType?: string;
  onRecommendationSelected?: (recommendation: LureRecommendation) => void;
  disabled?: boolean;
}

export default function LureRecommendationButton({
  fishType,
  weather,
  waterType,
  onRecommendationSelected,
  disabled = false,
}: LureRecommendationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    if (fishType) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled || !fishType}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${disabled || !fishType
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'
          }
        `}
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
          />
        </svg>
        💡 Köderempfehlung
      </button>

      <LureRecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fishType={fishType}
        weather={weather}
        waterType={waterType}
        onApply={onRecommendationSelected}
      />
    </>
  );
}
