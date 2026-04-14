'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Textarea } from '@headlessui/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Option {
  label: string;
  value: string;
}

interface FormFieldProps {
  label: string;
  type?:
    | 'text'
    | 'number'
    | 'email'
    | 'select'
    | 'switch'
    | 'textArea'
    | 'card';
  value: any;
  path: string;
  onChange: (path: string, value: unknown) => void;
  placeholder?: string;
  options?: Option[];
  disabled?: boolean;
  description?: string;
  className?: string;
}

export default function FormField({
  label,
  type = 'text',
  value,
  path,
  onChange,
  placeholder,
  options = [],
  disabled = false,
  description,
  className = '',
}: FormFieldProps) {
  return (
    <div
      className={cn(
        `grid w-full grid-cols-3 items-start justify-start gap-1 py-2 ${className}`,
        type === 'card' && 'grid-cols-1 gap-6'
      )}
    >
      <div className="space-y-1">
        <Label className="text-secondary-foreground text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </div>

      <div className="col-span-2">
        {type === 'select' && (
          <Select
            value={value}
            onValueChange={(val: string) => onChange(path, val)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                className={cn('text-secondary-foreground text-xs font-medium')}
                placeholder={placeholder || 'Select option'}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  className={cn(
                    'text-secondary-foreground text-xs font-medium'
                  )}
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {type === 'switch' && (
          <div className="flex items-center">
            <Switch
              checked={value}
              onCheckedChange={(checked) => onChange(path, checked)}
              disabled={disabled}
            />
          </div>
        )}

        {(type === 'text' || type === 'number' || type === 'email') && (
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}

        {type === 'textArea' && (
          <Textarea
            value={value}
            className={cn(
              'bg-secondary/30 text-secondary-foreground min-h-30 w-full rounded-md border-[0.7] border-neutral-600 p-1.5 text-xs font-medium backdrop-blur-md'
            )}
            onChange={(e) => onChange(path, e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}

        {type === 'card' && (
          <div
            className={cn(
              `grid min-h-35 w-full auto-rows-min grid-cols-3 items-center gap-2.5`
            )}
          >
            {options.map((option) => (
              <Card
                onClick={(e: any) => onChange(path, option.value)}
                className={cn(
                  'bg-secondary/30 flex-col items-start justify-between rounded-md p-4 backdrop-blur-md transition',
                  'hover:border-primary border-[1.3px] border-neutral-700',
                  value === option.value && 'border-primary'
                )}
                key={option.value}
              >
                <CardHeader className={'w-fit'}>
                  <CardTitle className={'text-sm font-semibold text-nowrap'}>
                    {option.label}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground flex-col gap-1.5 text-xs">
                    {option.value}
                  </p>
                  <div className={cn('center h-5 w-full')}></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
