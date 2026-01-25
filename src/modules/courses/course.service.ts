import { Request, Response, NextFunction } from 'express';
import { Course } from './course.model';
import { Module } from './module.model';
import { Lesson } from './lesson.model';
import createError from 'http-errors';
import slugify from 'slugify';

export class CourseService
{
    static async listInstructorCourses(instructorId: string, query: any)
    {
        const {
            page = 1,
            limit = 10,
            category,
            level,
            pricingType,
            search,
            sort = '-createdAt'
        } = query;

        const filter: any = { instructorId };

        if (category) {
            filter.$or = [ { category }, { subcategory: category } ];
        }
        if (level) {
            filter.level = level;
        }
        if (pricingType) {
            filter[ 'pricing.type' ] = pricingType;
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const courses = await Course.find(filter)
            .populate('instructorId', 'profile')
            .sort(sort as string)
            .skip(skip)
            .limit(parseInt(limit as string));

        const total = await Course.countDocuments(filter);

        return {
            courses,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        };
    }
    static async createCourse(instructorId: string, courseData: any)
    {
        const slug = slugify(courseData.title, { lower: true });
        return await Course.create({ ...courseData, instructorId, slug });
    }

    static async getCourseBySlug(slug: string)
    {
        const course = await Course.findOne({ slug, status: 'published' })
            .populate('instructorId', 'profile')
            .populate('coInstructors', 'profile');
        if (!course) throw createError(404, 'Course not found');
        return course;
    }

    static async addModule(courseId: string, moduleData: any)
    {
        return await Module.create({ ...moduleData, courseId });
    }

    static async addLesson(courseId: string, moduleId: string, lessonData: any)
    {
        return await Lesson.create({ ...lessonData, courseId, moduleId });
    }

    static async getCourseStructure(courseId: string)
    {
        const modules = await Module.find({ courseId }).sort('order');
        const lessons = await Lesson.find({ courseId }).sort('order');

        return modules.map(mod => ({
            ...mod.toObject(),
            lessons: lessons.filter(l => l.moduleId.toString() === mod._id.toString())
        }));
    }

    static async getCoursesByCategory(categoryId: string)
    {
        return await Course.find({
            $or: [ { category: categoryId }, { subcategory: categoryId } ],
            status: 'published'
        })
            .populate('instructorId', 'profile')
            .sort('-createdAt');
    }

    static async listCourses(query: any)
    {
        const {
            page = 1,
            limit = 10,
            category,
            level,
            pricingType,
            search,
            sort = '-createdAt'
        } = query;

        const filter: any = { status: 'published' };

        if (category) {
            filter.$or = [ { category }, { subcategory: category } ];
        }

        if (level) {
            filter.level = level;
        }

        if (pricingType) {
            filter[ 'pricing.type' ] = pricingType;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const courses = await Course.find(filter)
            .populate('instructorId', 'profile')
            .sort(sort as string)
            .skip(skip)
            .limit(parseInt(limit as string));

        const total = await Course.countDocuments(filter);

        return {
            courses,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        };
    }
}
