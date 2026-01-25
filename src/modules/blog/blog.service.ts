import { BlogPost, IBlogPost } from './blog.model';
import slugify from 'slugify';
import createError from 'http-errors';
import { Types } from 'mongoose';

export class BlogService
{
    static async createPost(authorId: string, postData: any)
    {
        const slug = slugify(postData.title, { lower: true, strict: true });

        // Calculate reading time (avg 200 words per minute)
        const words = postData.content.split(/\s+/).length;
        const readingTime = Math.ceil(words / 200);

        const post = await BlogPost.create({
            ...postData,
            authorId,
            slug,
            readingTime,
            publishedAt: postData.status === 'published' ? new Date() : undefined
        });

        return post;
    }

    static async listUserBlogs(authorId: string, query: any)
    {
        const {
            page = 1,
            limit = 10,
            category,
            tag,
            search,
            status,
            sort = '-createdAt'
        } = query;

        const filter: any = { authorId };
        if (status) filter.status = status;
        if (category) filter.categoryId = category;
        if (tag) filter.tags = tag;
        if (search) {
            filter.$text = { $search: search };
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const posts = await BlogPost.find(filter)
            .populate('authorId', 'profile.firstName profile.lastName profile.displayName profile.avatar')
            .populate('categoryId', 'name slug')
            .sort(sort as string)
            .skip(skip)
            .limit(parseInt(limit as string));

        const total = await BlogPost.countDocuments(filter);

        return {
            posts,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        };
    }

    static async listPosts(query: any)
    {
        const {
            page = 1,
            limit = 10,
            category,
            tag,
            search,
            status = 'published',
            sort = '-publishedAt'
        } = query;

        const filter: any = { status };

        if (category) filter.categoryId = category;
        if (tag) filter.tags = tag;

        if (search) {
            filter.$text = { $search: search };
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const posts = await BlogPost.find(filter)
            .populate('authorId', 'profile.firstName profile.lastName profile.displayName profile.avatar')
            .populate('categoryId', 'name slug')
            .sort(sort as string)
            .skip(skip)
            .limit(parseInt(limit as string));

        const total = await BlogPost.countDocuments(filter);

        return {
            posts,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        };
    }

    static async getPostBySlug(slug: string)
    {
        const post = await BlogPost.findOne({ slug, status: 'published' })
            .populate('authorId', 'profile.firstName profile.lastName profile.displayName profile.avatar')
            .populate('categoryId', 'name slug');

        if (!post) throw createError(404, 'Blog post not found');

        // Increment views in background
        BlogPost.updateOne({ _id: post._id }, { $inc: { views: 1 } }).exec();

        return post;
    }

    static async updatePost(postId: string, authorId: string, updateData: any)
    {
        const post = await BlogPost.findOne({ _id: postId });
        if (!post) throw createError(404, 'Post not found');

        // Check if user is author or admin (admin check would ideally be in controller/middleware)
        if (post.authorId.toString() !== authorId) {
            throw createError(403, 'You are not authorized to edit this post');
        }

        if (updateData.title && updateData.title !== post.title) {
            updateData.slug = slugify(updateData.title, { lower: true, strict: true });
        }

        if (updateData.content) {
            const words = updateData.content.split(/\s+/).length;
            updateData.readingTime = Math.ceil(words / 200);
        }

        if (updateData.status === 'published' && post.status !== 'published') {
            updateData.publishedAt = new Date();
        }

        return await BlogPost.findByIdAndUpdate(postId, updateData, { new: true });
    }

    static async deletePost(postId: string, authorId: string)
    {
        const post = await BlogPost.findOne({ _id: postId });
        if (!post) throw createError(404, 'Post not found');

        if (post.authorId.toString() !== authorId) {
            throw createError(403, 'You are not authorized to delete this post');
        }

        return await BlogPost.findByIdAndDelete(postId);
    }
}
