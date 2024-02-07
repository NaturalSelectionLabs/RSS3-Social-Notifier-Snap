import React from 'react';
import { InfoCircledIcon } from '@radix-ui/react-icons';

import type { FeatureToCheck } from '@/utils';
import { useIsFeatureSupported } from '@/hooks/use-is-feature-supported';
import { cn } from '@/lib/utils';
import { useInstallSnap } from '@/hooks/use-install-snap';

export type FeatureGuardProps = {
  feature: FeatureToCheck;
} & React.HTMLAttributes<HTMLDivElement>;

export function FeatureGuard({
  feature,
  children,
  className,
  ...props
}: FeatureGuardProps) {
  const isFeatureSupported = useIsFeatureSupported(feature);
  const installSnap = useInstallSnap();

  return (
    <div
      {...props}
      className={cn(
        'relative',
        !isFeatureSupported && 'min-h-[3rem]',
        className,
      )}
    >
      {isFeatureSupported ? (
        children
      ) : (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InfoCircledIcon
                className="h-5 w-5 text-yellow-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-yellow-700">
                Current installed version does not support this feature. Click
                the Reinstall button to install the latest version.
              </p>
              <p className="mt-3 text-sm md:ml-6 md:mt-0">
                <button
                  onClick={installSnap}
                  className="whitespace-nowrap font-medium text-yellow-700 hover:text-yellow-600"
                >
                  Reinstall
                  <span aria-hidden="true"> &rarr;</span>
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
