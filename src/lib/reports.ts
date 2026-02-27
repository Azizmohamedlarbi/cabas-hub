import { supabase } from './supabase';

export type ReportTargetType = 'product' | 'trip' | 'profile' | 'other';
export type ReportStatusType = 'pending' | 'resolved' | 'dismissed';

export interface Report {
    id: string;
    reporter_id: string;
    reported_id?: string;
    target_type: ReportTargetType;
    target_id?: string;
    reason: string;
    details?: string;
    status: ReportStatusType;
    created_at: string;
    updated_at: string;
    reporter?: any;
    reported?: any;
}

export const reportsApi = {
    async createReport(data: {
        reporter_id: string;
        reported_id?: string;
        target_type: ReportTargetType;
        target_id?: string;
        reason: string;
        details?: string;
    }) {
        const { error } = await supabase
            .from('reports')
            .insert(data);

        if (error) throw error;
    },

    async getAdminReports() {
        const { data, error } = await supabase
            .from('reports')
            .select(`
                *,
                reporter:profiles!reports_reporter_id_fkey(*),
                reported:profiles!reports_reported_id_fkey(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Report[];
    },

    async updateReportStatus(id: string, status: ReportStatusType) {
        const { error } = await supabase
            .from('reports')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteReport(id: string) {
        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
