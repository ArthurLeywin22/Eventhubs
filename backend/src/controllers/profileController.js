import { supabaseAdmin } from '../config/supabase.js';
import { profileUpdateSchema } from '../schemas/registrationSchema.js';

/**
 * GET /api/profile
 * Get authenticated user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      // Lazy provision if not yet created
      const { data: created, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([{
          id: userId,
          full_name: req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'Student',
          email: req.user.email,
          college: req.user.user_metadata?.college || '',
          department: req.user.user_metadata?.department || '',
          year: req.user.user_metadata?.year || '',
          role: req.user.user_metadata?.role || 'student',
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      profile = created;
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/profile
 * Update authenticated user profile details (prevents role modification)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Validate request body
    const validationResult = profileUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
      });
    }

    const { full_name, college, department, year } = validationResult.data;

    // Strictly ensure 'role' is never modified by this endpoint
    const updatePayload = {
      full_name,
      college: college || '',
      department: department || '',
      year: year || '',
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (err) {
    next(err);
  }
};
