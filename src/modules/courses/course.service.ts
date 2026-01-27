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
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort(sort as string)
            .select('-fullDescription -tags -settings -learningObjectives -learningObjectives -certification')
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
        const decodedSlug = decodeURIComponent(slug);
        const course = await Course.findOne({ slug: decodedSlug, status: 'published' })
            .populate('instructorId', 'profile')
            .populate('coInstructors', 'profile');
        if (!course) throw createError(404, 'Course not found');
        return course;
    }

    static async addModule(courseId: string, moduleData: any)
    {
        const module = await Module.create({ ...moduleData, courseId });
        // Update course metadata: totalModules
        const totalModules = await Module.countDocuments({ courseId });
        await Course.findByIdAndUpdate(courseId, {
            $set: { 'metadata.totalModules': totalModules, 'metadata.lastUpdated': new Date() }
        });
        return module;
    }

    static async addLesson(courseId: string, moduleId: string, lessonData: any)
    {
        const lesson = await Lesson.create({ ...lessonData, courseId, moduleId });
        // Update course metadata: totalLessons
        const totalLessons = await Lesson.countDocuments({ courseId });
        await Course.findByIdAndUpdate(courseId, {
            $set: { 'metadata.totalLessons': totalLessons, 'metadata.lastUpdated': new Date() }
        });
        return lesson;
    }

    static async getCourseStructure(courseId: string)
    {
        const modules = await Module.find({ courseId }).sort('order');
        const lessons = await Lesson.find({ courseId }).sort('order');

        console.log('Modules:', modules);

        return modules.map(mod => ({
            ...mod.toObject(),
            lessons: lessons.filter(l => l.moduleId.toString() === mod._id.toString()),
            totalLessons: lessons.filter(l => l.moduleId.toString() === mod._id.toString()).length
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


        console.log(filter);

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const courses = await Course.find(filter)
            .populate('instructorId', 'profile')
            .populate('instructorId', 'profile')
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort(sort as string)
            .select('-fullDescription -tags -settings -learningObjectives -learningObjectives -certification')
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
