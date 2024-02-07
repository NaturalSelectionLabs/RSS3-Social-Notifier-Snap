import React from 'react';

import { Notifications } from '@/modules/preferences/notifications';

export function Preferences() {
  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold leading-7 text-gray-900 mb-6 mt-12">
        Preferences
      </h2>

      <Notifications />
    </div>
  );
}
