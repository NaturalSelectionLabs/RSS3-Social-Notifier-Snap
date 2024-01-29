import { useToggleNotifications } from '@/hooks/use-toggle-notifications';
import { Checkbox } from '@/components/ui/checkbox';

export function Notifications() {
  const { toggle, platforms } = useToggleNotifications();

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Notifications
        </h3>

        <div className="mt-2 space-y-2">
          <div className="max-w-xl text-sm text-gray-500">
            Choose which platforms you want to receive notifications on.
          </div>
          <div className="flex items-center gap-4">
            {platforms.map((platform) => (
              <label key={platform.id} className="flex items-center gap-2">
                <Checkbox
                  checked={platform.enabled}
                  onCheckedChange={() => toggle(platform.id)}
                />
                {platform.name}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
