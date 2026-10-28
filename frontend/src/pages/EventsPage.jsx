import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEvents } from '../services/api';
import EventGrid from '../components/EventGrid';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Calendar, Search } from 'lucide-react';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'date_asc';

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync state with URL params
  useEffect(() => {
    const params = {};
    if (category && category !== 'All') params.category = category;
    if (search.trim()) params.search = search.trim();
    if (sort) params.sort = sort;
    setSearchParams(params);
  }, [category, search, sort, setSearchParams]);

  // Debounce search and fetch events
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 250);
    return () => clearTimeout(timer);
  }, [category, search, sort]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getEvents({
        category,
        search,
        sort,
      });
      setEvents(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch events from backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCategory('All');
    setSearch('');
    setSort('date_asc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" /> Campus Event Catalog
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Explore College Events
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover hands-on workshops, competitive hackathons, sports, and cultural festivals.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
        />
        <FilterBar
          selectedCategory={category}
          onSelectCategory={setCategory}
          selectedSort={sort}
          onSelectSort={setSort}
        />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800">{events.length}</strong> events
          {category !== 'All' && <span> in <strong className="text-indigo-600">{category}</strong></span>}
          {search && <span> matching "<strong className="text-slate-800">{search}</strong>"</span>}
        </span>
        {(category !== 'All' || search) && (
          <button
            onClick={handleClearFilters}
            className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Main Content Feed */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner text="Searching campus events catalog..." />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchEvents} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events match your criteria"
          description="We couldn't find any college events matching your search or active filter."
          actionText="Reset Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <EventGrid events={events} />
      )}
    </div>
  );
}
