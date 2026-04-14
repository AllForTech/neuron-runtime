'use client';

import { Button } from '@/components/ui/button';

export const WorkflowErrorState = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20">
      <p className="text-destructive font-medium">Failed to load workflows</p>
      <p className="text-muted-foreground text-sm">{message}</p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );
};
