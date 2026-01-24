import { Certificate, ICertificate } from './certificate.model';
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

    static async generateCertificate(userId: string, courseId: string, templateId?: string)
    {
        const user = await User.findById(userId);
        const course = await Course.findById(courseId).populate('instructorId');

        if (!user || !course) throw createError(404, 'User or Course not found');

        let template;
        if (templateId) {
            template = await CertificateTemplate.findById(templateId);
        } else {
            template = await CertificateTemplate.findOne({ isDefault: true });
        }

        if (!template) throw createError(404, 'Certificate template not found');

        const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const credentialId = uuidv4();

        // In a real app, you'd call a PDF generation service here
        // For now, we simulate the URL
        const certificateUrl = `https://cdn.lumina.com/certificates/${credentialId}.pdf`;
        const verificationUrl = `https://lumina.com/verify/${credentialId}`;

        return await Certificate.create({
            userId,
            courseId,
            templateId: template._id,
            certificateNumber,
            credentialId,
            recipientName: `${user.profile.firstName} ${user.profile.lastName}`,
            courseName: course.title,
            instructorName: 'Lumina Instructor', // Simplified for demo
            issueDate: new Date(),
            completionDate: new Date(),
            certificateUrl,
            verificationUrl,
            metadata: {
                hoursCompleted: course.metadata.estimatedHours,
                skillsAcquired: course.tags || [],
                finalScore: 100 // Should come from enrollment/assessments
            },
            status: 'active'
        });
    }

    static async getUserCertificates(userId: string)
    {
        return await Certificate.find({ userId }).populate('courseId', 'title thumbnail');
    }

    static async verifyCertificate(credentialId: string)
    {
        const certificate = await Certificate.findOne({ credentialId, status: 'active' });
        if (!certificate) throw createError(404, 'Valid certificate not found');
        return certificate;
    }

    static async revokeCertificate(certificateId: string, reason: string)
    {
        return await Certificate.findByIdAndUpdate(
            certificateId,
            { status: 'revoked', revokedAt: new Date(), revokeReason: reason },
            { new: true }
        );
    }
}
