import { supabaseAdmin } from '../config/supabase.js';
import { eventIdParamSchema } from '../schemas/registrationSchema.js';

/**
 * POST /api/events/:id/register
 * Student: Register for an event with complete 10-step validation
 */
export const registerForEvent = async (req, res, next) => {
  try {
    // 1. User authenticated (guaranteed by requireAuth middleware)
    const userId = req.user.id;

    // 2. Validate event ID param format
    const paramValidation = eventIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event identifier',
      });
    }
    const eventId = paramValidation.data.id;

    // 3. Check event exists
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // 4 & 5. Check registration deadline & current date
    const today = new Date().toISOString().split('T')[0];
    if (event.registration_deadline < today) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed for this event',
      });
    }

    if (event.event_date < today) {
      return res.status(400).json({
        success: false,
        message: 'This event has already concluded',
      });
    }

    // 6. Count current registrations
    const { count: regCount, error: countError } = await supabaseAdmin
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (countError) {
      throw countError;
    }

    // 7. Check available capacity
    if ((regCount || 0) >= event.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'This event is full',
      });
    }

    // 8. Check whether user is already registered
    const { data: existingReg, error: checkRegError } = await supabaseAdmin
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingReg) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }

    // Ensure student profile exists in profiles table before registering
    const { data: studentProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!studentProfile) {
      // Sync profile if not created yet
      await supabaseAdmin.from('profiles').insert([{
        id: userId,
        full_name: req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'Student',
        email: req.user.email,
        college: req.user.user_metadata?.college || '',
        department: req.user.user_metadata?.department || '',
        year: req.user.user_metadata?.year || '',
        role: 'student',
      }]);
    }

    // 9. Insert registration record
    const { data: newReg, error: insertError } = await supabaseAdmin
      .from('event_registrations')
      .insert([{
        event_id: eventId,
        user_id: userId,
      }])
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'You are already registered for this event',
        });
      }
      throw insertError;
    }

    // 10. Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful! See you at the event.',
      data: newReg,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/events/:id/register
 * Student: Cancel registration for an event
 */
export const cancelRegistration = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: eventId } = req.params;

    // Check existing registration
    const { data: reg, error: findError } = await supabaseAdmin
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (findError || !reg) {
      return res.status(404).json({
        success: false,
        message: 'No active registration found for this event',
      });
    }

    // Delete registration
    const { error: deleteError } = await supabaseAdmin
      .from('event_registrations')
      .delete()
      .eq('id', reg.id);

    if (deleteError) {
      throw deleteError;
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/my-events
 * Student: Get events registered by the logged-in student
 */
export const getMyRegisteredEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: registrations, error } = await supabaseAdmin
      .from('event_registrations')
      .select(`
        id,
        registered_at,
        events (
          id,
          title,
          description,
          category,
          event_date,
          start_time,
          end_time,
          venue,
          organizer,
          image_url,
          max_participants,
          registration_deadline
        )
      `)
      .eq('user_id', userId)
      .order('registered_at', { ascending: false });

    if (error) {
      throw error;
    }

    const today = new Date().toISOString().split('T')[0];

    const formattedList = (registrations || [])
      .filter(item => item.events) // ensure event wasn't deleted
      .map(item => {
        const event = item.events;
        const isUpcoming = event.event_date >= today;
        return {
          registration_id: item.id,
          registered_at: item.registered_at,
          status: isUpcoming ? 'Upcoming' : 'Completed',
          ...event,
        };
      });

    res.json({
      success: true,
      count: formattedList.length,
      data: formattedList,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/events/:id/registrations
 * Admin: View registered students for a specific event
 */
export const getEventRegistrations = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;

    // Fetch event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, max_participants')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Fetch registrations with student profile
    const { data: registrations, error: regError } = await supabaseAdmin
      .from('event_registrations')
      .select(`
        id,
        registered_at,
        profiles (
          id,
          full_name,
          email,
          college,
          department,
          year
        )
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: true });

    if (regError) {
      throw regError;
    }

    const students = (registrations || []).map(r => ({
      registration_id: r.id,
      registered_at: r.registered_at,
      student_id: r.profiles?.id,
      full_name: r.profiles?.full_name || 'N/A',
      email: r.profiles?.email || 'N/A',
      college: r.profiles?.college || 'N/A',
      department: r.profiles?.department || 'N/A',
      year: r.profiles?.year || 'N/A',
    }));

    res.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        max_participants: event.max_participants,
        total_registered: students.length,
      },
      data: students,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/dashboard
 * Admin: Overview statistics and recent events & registrations
 */
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Total events count
    const { count: totalEvents } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true });

    // 2. Upcoming events count
    const { count: upcomingEvents } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('event_date', today);

    // 3. Total registrations count
    const { count: totalRegistrations } = await supabaseAdmin
      .from('event_registrations')
      .select('*', { count: 'exact', head: true });

    // 4. Total students count
    const { count: totalStudents } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    // 5. Recent events (top 5)
    const { data: recentEvents } = await supabaseAdmin
      .from('events')
      .select('id, title, category, event_date, venue, max_participants, created_at, event_registrations(count)')
      .order('created_at', { ascending: false })
      .limit(5);

    const formattedRecentEvents = (recentEvents || []).map(e => ({
      ...e,
      registration_count: e.event_registrations?.[0]?.count || 0,
      event_registrations: undefined,
    }));

    // 6. Recent registrations (top 5)
    const { data: recentRegistrations } = await supabaseAdmin
      .from('event_registrations')
      .select(`
        id,
        registered_at,
        events (id, title),
        profiles (id, full_name, email, department)
      `)
      .order('registered_at', { ascending: false })
      .limit(6);

    res.json({
      success: true,
      stats: {
        total_events: totalEvents || 0,
        upcoming_events: upcomingEvents || 0,
        total_registrations: totalRegistrations || 0,
        total_students: totalStudents || 0,
      },
      recent_events: formattedRecentEvents,
      recent_registrations: (recentRegistrations || []).map(r => ({
        id: r.id,
        registered_at: r.registered_at,
        event_title: r.events?.title || 'Unknown Event',
        student_name: r.profiles?.full_name || 'Student',
        student_email: r.profiles?.email || '',
        department: r.profiles?.department || '',
      })),
    });
  } catch (err) {
    next(err);
  }
};
