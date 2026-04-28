'use client';

import { ArrayFieldSchema } from "@neuron/shared";
import { getValueAtPath } from "@/lib/config/path";
import { ConfigFieldRenderer } from "../ConfigFieldRenderer";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function ArrayField({ field, values, onChange }: {
    field: ArrayFieldSchema;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void
}) {
    const items = getValueAtPath(values, field.path, []) as any[];

    const addItem = () => {
        const newItem = field.defaultItem || {};
        onChange(field.path, [...items, newItem]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(field.path, newItems);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <label className="text-xs font-semibold">{field.label}</label>
                <Button variant="ghost" size="sm" onClick={addItem} className="h-7 px-2 text-[10px]">
                    <Plus className="mr-1 h-3 w-3" /> Add Item
                </Button>
            </div>

            {items.map((item, index) => (
                <div key={index} className="relative group p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="absolute -right-2 -top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>

                    {field.fields.map((subField) => (
                        <ConfigFieldRenderer
                            key={subField.path}
                            // Construct the path for the specific index: e.g., "headers.0.key"
                            field={{ ...subField, path: `${field.path}.${index}.${subField.path}` }}
                            values={values}
                            onChange={onChange}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}