import { supabase } from './supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'order';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

export const notificationsApi = {
    async getNotifications(userId: string) {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data as Notification[];
    },

    async markAsRead(id: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    },

    async sendNotification(userId: string, payload: {
        type: NotificationType;
        title: string;
        message: string;
        link?: string;
    }) {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                ...payload
            });

        if (error) throw error;
    },

    async getUnreadCount(userId: string) {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    }
};
