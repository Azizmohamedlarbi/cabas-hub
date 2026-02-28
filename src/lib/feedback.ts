import { supabase } from './supabase';

export interface Feedback {
    id: string;
    user_id?: string;
    feature: string;
    rating: number;
    comment?: string;
    created_at: string;
    user?: any; // Expanded profile
}

export const feedbackApi = {
    /**
     * Submit a new PMF feedback rating/comment for a specific feature
     */
    async submitFeedback(data: { user_id?: string | null; feature: string; rating: number; comment?: string }) {
        const { error } = await supabase
            .from('feedbacks')
            .insert([{
                user_id: data.user_id || null, // Ensure undefined becomes null for Supabase
                feature: data.feature,
                rating: data.rating,
                comment: data.comment
            }]);

        if (error) {
            console.error("Error submitting feedback:", error);
            throw error;
        }
        return true;
    },

    /**
     * Get all feedbacks (Admin only)
     * Optional filters for feature string and min/max ratings
     */
    async getFeedbacks(filters?: { feature?: string; minRating?: number; maxRating?: number }) {
        let query = supabase
            .from('feedbacks')
            .select(`
                *,
                user:profiles(id, first_name, last_name, user_type)
            `)
            .order('created_at', { ascending: false });

        if (filters?.feature && filters.feature !== 'all') {
            query = query.eq('feature', filters.feature);
        }
        if (filters?.minRating) {
            query = query.gte('rating', filters.minRating);
        }
        if (filters?.maxRating) {
            query = query.lte('rating', filters.maxRating);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching feedbacks:", error);
            throw error;
        }

        return data as Feedback[];
    },

    /**
     * Delete a single feedback entry (Admin only)
     */
    async deleteFeedback(id: string) {
        const { error } = await supabase
            .from('feedbacks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting feedback:", error);
            throw error;
        }
        return true;
    }
};
