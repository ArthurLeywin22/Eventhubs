import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export const CATEGORIES = [
  'All',
  'Workshop',
  'Hackathon',
  'Seminar',
  'Cultural',
  'Sports',
  'Technical',
  'Club Activity',
  'Competition',
];

export const SORT_OPTIONS = [
  { value: 'date_asc', label: 'Date: Earliest First' },
  { value: 'date_desc', label: 'Date: Latest First' },
  { value: 'title_asc', label: 'Title: A to Z' },
];

export default function FilterBar({
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
}) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-2">
      {/* Category Pills (horizontally scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
        <ArrowUpDown className="w-4 h-4 text-slate-400" />
        <select
          value={selectedSort}
          onChange={(e) => onSelectSort(e.target.value)}
          className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
