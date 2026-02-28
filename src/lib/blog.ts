import { supabase } from './supabase';
import { BlogPost, Profile } from '@/types';

export type CreatePostDTO = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'author'>;

export const blogApi = {
    // PUBLIC / READER FACING
    async getPublishedPosts(): Promise<BlogPost[]> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                author:profiles(*)
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as BlogPost[];
    },

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                author:profiles(*)
            `)
            .eq('slug', slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data as BlogPost;
    },

    // ADMIN FACING
    async getAllPosts(): Promise<BlogPost[]> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                author:profiles(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as BlogPost[];
    },

    async getPostById(id: string): Promise<BlogPost | null> {
        const { data, error } = await supabase
            .from('blog_posts')
            .select(`
                *,
                author:profiles(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data as BlogPost;
    },

    async createPost(post: CreatePostDTO): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .insert([post])
            .select()
            .single();

        if (error) throw error;
        return data as BlogPost;
    },

    async updatePost(id: string, updates: Partial<CreatePostDTO>): Promise<BlogPost> {
        const { data, error } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as BlogPost;
    },

    async deletePost(id: string): Promise<void> {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
