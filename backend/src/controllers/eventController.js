import { supabaseAdmin } from '../config/supabase.js';
import { eventSchema, eventUpdateSchema } from '../schemas/eventSchema.js';

/**
 * GET /api/events
 * Fetch all events with optional search, category filter, and sorting
 */
export const getEvents = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;

    let query = supabaseAdmin
      .from('events')
      .select('*, event_registrations(count)');

    // Apply category filter
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // Apply search filter (title, description, venue, or organizer)
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query = query.or(`title.ilike.${term},description.ilike.${term},venue.ilike.${term},organizer.ilike.${term}`);
    }

    // Apply sorting
    if (sort === 'date_desc') {
      query = query.order('event_date', { ascending: false });
    } else if (sort === 'title_asc') {
      query = query.order('title', { ascending: true });
    } else {
      // Default: earliest first
      query = query.order('event_date', { ascending: true });
    }

    const { data: events, error } = await query;

    if (error) {
      throw error;
    }

    // Format events with clean registration count and remaining seats
    const formattedEvents = (events || []).map(event => {
      const regCount = event.event_registrations?.[0]?.count || 0;
      const remainingSeats = Math.max(0, event.max_participants - regCount);
      const isFull = remainingSeats <= 0;
      const today = new Date().toISOString().split('T')[0];
      const isClosed = event.registration_deadline < today;

      return {
        ...event,
        registration_count: regCount,
        remaining_seats: remainingSeats,
        is_full: isFull,
        is_closed: isClosed,
        event_registrations: undefined, // remove nested array
      };
    });

    res.json({
      success: true,
      count: formattedEvents.length,
      data: formattedEvents,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/events/:id
 * Fetch single event details and user registration status if authenticated
 */
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select('*, event_registrations(count)')
      .eq('id', id)
      .single();

    if (error || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const regCount = event.event_registrations?.[0]?.count || 0;
    const remainingSeats = Math.max(0, event.max_participants - regCount);
    const today = new Date().toISOString().split('T')[0];
    const isClosed = event.registration_deadline < today;
    const isFull = remainingSeats <= 0;

    // Check if the current user is registered for this event
    let isUserRegistered = false;
    if (req.user) {
      const { data: reg } = await supabaseAdmin
        .from('event_registrations')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', req.user.id)
        .maybeSingle();

      isUserRegistered = !!reg;
    }

    res.json({
      success: true,
      data: {
        ...event,
        registration_count: regCount,
        remaining_seats: remainingSeats,
        is_full: isFull,
        is_closed: isClosed,
        is_user_registered: isUserRegistered,
        event_registrations: undefined,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/events
 * Admin: Create a new event
 */
export const createEvent = async (req, res, next) => {
  try {
    // Validate request body using Zod
    const validationResult = eventSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const eventData = validationResult.data;

    const { data: newEvent, error } = await supabaseAdmin
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/events/:id
 * Admin: Update an existing event
 */
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validationResult = eventUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    // Check if event exists
    const { data: existingEvent, error: checkError } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const updatePayload = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedEvent, error: updateError } = await supabaseAdmin
      .from('events')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/events/:id
 * Admin: Delete an event (cascades registrations)
 */
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const { data: event, error: findError } = await supabaseAdmin
      .from('events')
      .select('id, title')
      .eq('id', id)
      .single();

    if (findError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Delete event (foreign keys have ON DELETE CASCADE)
    const { error: deleteError } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    res.json({
      success: true,
      message: `Event "${event.title}" and associated registrations deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};
