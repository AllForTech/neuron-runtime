'use client';

import { Plus, LayoutGrid, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyGraphMenuProps {
  onAddNode: () => void;
}

export function EmptyGraphMenu({ onAddNode }: EmptyGraphMenuProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center select-none">
      {/* Subtle Background Glow for context */}
      <div className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-white/[0.03] blur-[100px]" />

      <div className="pointer-events-auto relative flex flex-col items-center gap-6 pt-15">
        {/* The Visual Focal Point */}
        <div className="group relative">
          {/* Pulsing Border Effect */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-white/20 to-white/0 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200" />

          <div className="relative flex h-48 w-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-black/20 backdrop-blur-sm transition-all duration-300 group-hover:border-white/20 group-hover:bg-black/40">
            <div className="rounded-full border border-white/10 bg-white/5 p-3 text-white/50 transition-all group-hover:scale-110 group-hover:text-white">
              <Zap className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium text-white/80">
                Canvas is empty
              </p>
              <p className="text-[11px] text-white/40">
                Start building your automation
              </p>
            </div>
          </div>
        </div>

        {/* The Primary Action */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-full border-white/10 bg-white/5 px-6 text-xs font-semibold shadow-2xl transition-all duration-300 hover:bg-white hover:text-black"
            >
              <Plus className="h-4 w-4" />
              Build Workflow
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-48 rounded-lg border-neutral-800 bg-neutral-900 p-2.5 px-1.5 text-white shadow-xl"
            align="center"
            sideOffset={10}
          >
            <DropdownMenuItem
              className="transition-200 cursor-pointer gap-2 rounded-md py-1.5 text-xs focus:bg-neutral-800"
              onClick={onAddNode}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Add First Node
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg py-2.5 text-xs opacity-50 focus:bg-white focus:text-black"
              disabled
            >
              <Zap className="h-3.5 w-3.5" />
              Use Template (Coming Soon)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
