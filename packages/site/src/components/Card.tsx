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
      className={cn('flex flex-col my-10 p-10 border border-solid', [
        fullWidth ? 'w-full' : 'w-[400px]',
        disabled ? 'opacity-40' : '',
      ])}
    >
      {title && <h2 className="text-lg">{title}</h2>}
      <div className="my-10">{description}</div>
      {button}
    </div>
  );
};
