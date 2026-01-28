import { Certificate } from './certificate.model';
import { CertificateTemplate } from './certificate-template.model';
import { User } from '../users/user.model';
import { Course } from '../courses/course.model';
import createError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

export class CertificateService
{
    static async createTemplate(templateData: any)
    {
        return await CertificateTemplate.create(templateData);
    }

    static async getTemplates()
    {
        return await CertificateTemplate.find();
    }

    static async getTemplateById(id: string)
    {
        return await CertificateTemplate.findById(id);
    }

    static async generateCertificate(studentId: string, courseId: string, templateId: string)
    {
        const student = await User.findById(studentId);
        const course = await Course.findById(courseId).populate('instructorId');

        if (!student || !course) throw createError(404, 'Student or Course not found');

        const template = await CertificateTemplate.findById(templateId);
        if (!template) throw createError(404, 'Certificate template not found');

        // Generate a unique certificate ID (e.g. CERT-YYYY-UUID)
        const certificateId = `CERT-${new Date().getFullYear()}-${uuidv4().split('-')[ 0 ].toUpperCase()}`;

        // Flatten instructor name safely
        const instructorName = (course as any).instructorId ?
            `${(course as any).instructorId.firstName} ${(course as any).instructorId.lastName}` :
            'Instructor';

        return await Certificate.create({
            certificateId,
            template: template._id,
            student: studentId,
            course: courseId,
            metadata: {
                studentName: `${student.profile?.firstName} ${student.profile?.lastName}`,
                courseName: course.title,
                instructorName: instructorName,
                completionDate: new Date(),
                grade: 'Completed'
            },
            issueDate: new Date(),
            isValid: true
        });
    }

    static async getUserCertificates(studentId: string)
    {
        return await Certificate.find({ student: studentId })
            .populate('course', 'title thumbnail')
            .populate('template', 'name');
    }

    static async verifyCertificate(certificateId: string)
    {
        const certificate = await Certificate.findOne({ certificateId, isValid: true })
            .populate('student', 'profile')
            .populate('course', 'title')
            .populate('template');

        if (!certificate) throw createError(404, 'Valid certificate not found');
        return certificate;
    }

    static async revokeCertificate(id: string, reason: string)
    {
        // Note: The schema only has isValid boolean, we might want to store revocation reason in metadata or separate field if needed.
        // However strictly following the schema provided:
        return await Certificate.findByIdAndUpdate(
            id,
            { isValid: false }, // schema doesn't have revocation reason, just boolean
            { new: true }
        );
    }
}
