import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardProps = {
  content: {
    title?: string;
    description: ReactNode;
    button?: ReactNode;
  };
  disabled?: boolean;
  fullWidth?: boolean;
};

export const Card = ({ content, disabled = false, fullWidth }: CardProps) => {
  const { title, description, button } = content;
  return (
    <div
      className={cn('flex flex-col p-4 border border-solid rounded-lg', [
        fullWidth ? 'w-full' : 'w-[300px]',
        disabled ? 'opacity-40' : '',
      ])}
    >
      {title && <h2 className="text-lg">{title}</h2>}
      <div className="my-10">{description}</div>
      {button}
    </div>
  );
};
