import { Request, Response, NextFunction } from 'express';
import { Course } from './course.model';
import { Module } from './module.model';
import { Lesson } from './lesson.model';
import { Enrollment } from '../enrollments/enrollment.model';
import createError from 'http-errors';
import slugify from 'slugify';

export class CourseService
{
    private static async recalculateDurations(courseId: string, moduleId: string)
    {
        // Calculate total module duration from lessons
        const lessons = await Lesson.find({ moduleId });
        const moduleDuration = lessons.reduce((acc, curr) => acc + (curr.estimatedDuration || 0), 0);

        await Module.findByIdAndUpdate(moduleId, { $set: { estimatedDuration: moduleDuration } });

        // Calculate total course duration (in hours) from all modules
        const modules = await Module.find({ courseId });
        const totalDurationMinutes = modules.reduce((acc, curr) => acc + (curr.estimatedDuration || 0), 0);
        const estimatedHours = Math.round((totalDurationMinutes / 60) * 10) / 10; // Round to 1 decimal place

        await Course.findByIdAndUpdate(courseId, {
            $set: {
                'metadata.estimatedHours': estimatedHours,
                'metadata.lastUpdated': new Date()
            }
        });
    }

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
            .populate('instructorId', 'email instructorProfile')
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort(sort as string)
            .select('title pricing coverImage thumbnail level slug shortDescription category subcategory instructorId metadata status createdAt')
            .skip(skip)
            .limit(parseInt(limit as string))
            .lean();

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
            .populate('instructorId', 'email instructorProfile')
            .populate('coInstructors', 'email instructorProfile');
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

        await this.recalculateDurations(courseId, moduleId);
        return lesson;
    }

    static async getCourseStructure(courseId: string)
    {
        const modules = await Module.find({ courseId }).sort('order').lean();
        const lessons = await Lesson.find({ courseId }).sort('order')
            .select('title description order contentType videoContent.videoDuration videoContent.thumbnailUrl textContent.readingTime estimatedDuration isFree moduleId')
            .lean();


        return modules.map(mod => ({
            ...mod,
            lessons: lessons.filter(l => l.moduleId.toString() === mod._id.toString()),
            totalLessons: lessons.filter(l => l.moduleId.toString() === mod._id.toString()).length
        }));
    }

    static async getEnrolledCourseDetail(courseId: string, userId: string)
    {
        const enrollment = await Enrollment.findOne({ userId, courseId }).lean();
        if (!enrollment) throw createError(403, 'You are not enrolled in this course');

        const course = await Course.findById(courseId)
            .populate('instructorId', 'profile')
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .lean();

        if (!course) throw createError(404, 'Course not found');

        const modules = await Module.find({ courseId }).sort('order').lean();
        const lessons = await Lesson.find({ courseId }).sort('order').lean();

        const structure = modules.map(mod => ({
            ...mod,
            lessons: lessons.filter(l => l.moduleId.toString() === mod._id.toString()),
            totalLessons: lessons.filter(l => l.moduleId.toString() === mod._id.toString()).length
        }));

        return {
            course,
            enrollment,
            structure
        };
    }

    static async getCoursesByCategory(categoryId: string)
    {
        return await Course.find({
            $or: [ { category: categoryId }, { subcategory: categoryId } ],
            status: 'published'
        })
            .populate('instructorId', 'email instructorProfile')
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort('-createdAt')
            .select('title pricing coverImage thumbnail level slug shortDescription category subcategory instructorId metadata status createdAt')
            .lean();
    }

    static async getInstructorCourseById(courseId: string, instructorId: string, isAdmin: boolean = false)
    {
        const filter = isAdmin ? { _id: courseId } : { _id: courseId, instructorId };
        const course = await Course.findOne(filter)
            .populate('instructorId', 'email instructorProfile')
            .populate('category', 'name')
            .populate('subcategory', 'name');
        if (!course) throw createError(404, 'Course not found or you are not authorized');
        return course;
    }

    static async updateCourseStatus(courseId: string, instructorId: string, status: string, isAdmin: boolean = false)
    {
        const filter = isAdmin ? { _id: courseId } : { _id: courseId, instructorId };
        const course = await Course.findOne(filter);
        if (!course) throw createError(404, 'Course not found or you are not authorized');

        const allowedStatuses = [ 'draft', 'published', 'archived' ];
        if (!allowedStatuses.includes(status)) {
            throw createError(400, 'Invalid status');
        }

        const updateData: any = { status };
        if (status === 'published' && !course.publishedAt) {
            updateData.publishedAt = new Date();
        }

        return await Course.findByIdAndUpdate(courseId, { $set: updateData }, { new: true });
    }

    static async updateCourse(courseId: string, instructorId: string, updateData: any, isAdmin: boolean = false)
    {
        const filter = isAdmin ? { _id: courseId } : { _id: courseId, instructorId };
        const course = await Course.findOne(filter);
        if (!course) throw createError(404, 'Course not found or you are not authorized');

        if (updateData.title && updateData.title !== course.title) {
            updateData.slug = slugify(updateData.title, { lower: true });
        }

        return await Course.findByIdAndUpdate(courseId, { $set: updateData }, { new: true });
    }

    static async deleteCourse(courseId: string, instructorId: string, isAdmin: boolean = false)
    {
        const filter = isAdmin ? { _id: courseId } : { _id: courseId, instructorId };
        const course = await Course.findOne(filter);
        if (!course) throw createError(404, 'Course not found or you are not authorized');

        // Delete modules and lessons associated with this course
        await Module.deleteMany({ courseId });
        await Lesson.deleteMany({ courseId });

        return await Course.findByIdAndDelete(courseId);
    }

    static async updateModule(courseId: string, moduleId: string, instructorId: string, updateData: any, isAdmin: boolean = false)
    {
        const filter = isAdmin ? { _id: courseId } : { _id: courseId, instructorId };
        const course = await Course.findOne(filter);
        if (!course) throw createError(404, 'Course not found or you are not authorized');

        const module = await Module.findOneAndUpdate({ _id: moduleId, courseId }, { $set: updateData }, { new: true });
        if (!module) throw createError(404, 'Module not found');
        return module;
    }

    static async deleteModule(courseId: string, moduleId: string, instructorId: string, isAdmin: boolean = false)
    {
        const filter = isAdmin ? { _id: courseId } : { _id: courseId, instructorId };
        const course = await Course.findOne(filter);
        if (!course) throw createError(404, 'Course not found or you are not authorized');

        const module = await Module.findOneAndDelete({ _id: moduleId, courseId });
        if (!module) throw createError(404, 'Module not found');

        // Delete lessons associated with this module
        await Lesson.deleteMany({ moduleId });

        // Update course metadata
        const totalModules = await Module.countDocuments({ courseId });
        const totalLessons = await Lesson.countDocuments({ courseId });
        await Course.findByIdAndUpdate(courseId, {
            $set: {
                'metadata.totalModules': totalModules,
                'metadata.totalLessons': totalLessons,
                'metadata.lastUpdated': new Date()
            }
        });

        // Recalculate course duration after module deletion (module has no lessons anymore in DB, so we pass any valid module id or handle it in course total)
        // Since the module is deleted, we just need to update the course total.
        const allModules = await Module.find({ courseId });
        const totalDurationMinutes = allModules.reduce((acc, curr) => acc + (curr.estimatedDuration || 0), 0);
        const estimatedHours = Math.round((totalDurationMinutes / 60) * 10) / 10;
        await Course.findByIdAndUpdate(courseId, { $set: { 'metadata.estimatedHours': estimatedHours } });

        return module;
    }

    static async updateLesson(courseId: string, moduleId: string, lessonId: string, instructorId: string, updateData: any, isAdmin: boolean = false)
    {
        const filter = isAdmin ? { _id: courseId } : { _id: courseId, instructorId };
        const course = await Course.findOne(filter);
        if (!course) throw createError(404, 'Course not found or you are not authorized');

        const lesson = await Lesson.findOneAndUpdate({ _id: lessonId, moduleId, courseId }, { $set: updateData }, { new: true });
        if (!lesson) throw createError(404, 'Lesson not found');

        await this.recalculateDurations(courseId, moduleId);
        return lesson;
    }

    static async deleteLesson(courseId: string, moduleId: string, lessonId: string, instructorId: string, isAdmin: boolean = false)
    {
        const filter = isAdmin ? { _id: courseId } : { _id: courseId, instructorId };
        const course = await Course.findOne(filter);
        if (!course) throw createError(404, 'Course not found or you are not authorized');

        const lesson = await Lesson.findOneAndDelete({ _id: lessonId, moduleId, courseId });
        if (!lesson) throw createError(404, 'Lesson not found');

        // Update course metadata
        const totalLessons = await Lesson.countDocuments({ courseId });
        await Course.findByIdAndUpdate(courseId, {
            $set: { 'metadata.totalLessons': totalLessons, 'metadata.lastUpdated': new Date() }
        });

        await this.recalculateDurations(courseId, moduleId);
        return lesson;
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
            .populate('instructorId', 'email instructorProfile')
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort(sort as string)
            .select('title pricing coverImage thumbnail level slug shortDescription category subcategory instructorId metadata status createdAt')
            .skip(skip)
            .limit(parseInt(limit as string))
            .lean();

        const total = await Course.countDocuments(filter);

        return {
            courses,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        };
    }
}
