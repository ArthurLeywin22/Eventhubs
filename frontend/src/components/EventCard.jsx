import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

export const categoryColors = {
  Workshop: 'bg-blue-50 text-blue-700 border-blue-200',
  Hackathon: 'bg-purple-50 text-purple-700 border-purple-200',
  Seminar: 'bg-amber-50 text-amber-700 border-amber-200',
  Cultural: 'bg-rose-50 text-rose-700 border-rose-200',
  Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Technical: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Club Activity': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Competition: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function EventCard({ event }) {
  if (!event) return null;

  const categoryBadgeClass =
    categoryColors[event.category] || 'bg-slate-50 text-slate-700 border-slate-200';

  const defaultImage =
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

  const remaining = typeof event.remaining_seats === 'number'
    ? event.remaining_seats
    : Math.max(0, event.max_participants - (event.registration_count || 0));

  const isFull = event.is_full || remaining <= 0;
  const isClosed = event.is_closed;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1">
      {/* Banner Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={event.image_url || defaultImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border backdrop-blur-md shadow-xs ${categoryBadgeClass}`}>
            {event.category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isClosed ? (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-900/80 text-white backdrop-blur-md">
              Closed
            </span>
          ) : isFull ? (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-600/90 text-white backdrop-blur-md">
              Full
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600/90 text-white backdrop-blur-md">
              Open
            </span>
          )}
        </div>

        {/* Date on banner overlay */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center gap-1.5 text-xs font-semibold drop-shadow-sm">
            <Calendar className="w-3.5 h-3.5" />
            <span>{event.event_date}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
            {event.title}
          </h3>

          <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </p>

          {/* Metadata badges */}
          <div className="space-y-1.5 text-xs text-slate-600 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{event.start_time} - {event.end_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>
                {remaining} seats left <span className="text-slate-400">/ {event.max_participants} max</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer / View Details */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 truncate max-w-[130px]">
            By {event.organizer}
          </span>
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-all"
          >
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
