'use client';

import React from 'react';
import { Menu } from 'lucide-react';

export function MobileMenuButton() {
  const handleToggle = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
  };

  return (
    <button
      onClick={handleToggle}
      className="lg:hidden p-2.5 rounded-xl bg-earth-100 hover:bg-primary-100 dark:bg-earth-900 dark:hover:bg-primary-900/30 text-earth-700 dark:text-earth-300 cursor-pointer flex items-center justify-center shrink-0"
      aria-label="Open navigation menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
