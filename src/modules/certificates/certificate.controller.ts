import { Request, Response, NextFunction } from 'express';
import { CertificateService } from './certificate.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export class CertificateController
{
    static async createTemplate(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            // Ensure the instructor field is set to the current user (if not provided/overridable)
            // Assuming the creator is the instructor.
            const templateData = { ...req.body, instructor: req.user.id };
            const template = await CertificateService.createTemplate(templateData);
            res.status(201).json({ success: true, data: template });
        } catch (error) {
            next(error);
        }
    }

    static async getTemplates(req: Request, res: Response, next: NextFunction)
    {
        try {
            const templates = await CertificateService.getTemplates();
            res.json({ success: true, data: templates });
        } catch (error) {
            next(error);
        }
    }

    static async issue(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const { studentId, courseId, templateId } = req.body;
            const certificate = await CertificateService.generateCertificate(studentId, courseId, templateId);
            res.status(201).json({ success: true, data: certificate });
        } catch (error) {
            next(error);
        }
    }

    static async getMyCertificates(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const certificates = await CertificateService.getUserCertificates(req.user.id);
            res.json({ success: true, data: certificates });
        } catch (error) {
            next(error);
        }
    }

    static async verify(req: Request, res: Response, next: NextFunction)
    {
        try {
            const certificateId = req.params.certificateId as string;
            const certificate = await CertificateService.verifyCertificate(certificateId);
            res.json({ success: true, data: certificate });
        } catch (error) {
            next(error);
        }
    }

    static async revoke(req: AuthRequest, res: Response, next: NextFunction)
    {
        try {
            const id = req.params.id as string;
            const { reason } = req.body;
            const certificate = await CertificateService.revokeCertificate(id, reason);
            res.json({ success: true, data: certificate });
        } catch (error) {
            next(error);
        }
    }
}
