
import { Request, Response, NextFunction } from 'express';
import * as PageService from './page.service';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

// Create a page
export const createPage = async (req: AuthRequest, res: Response, next: NextFunction) =>
{
    try {
        // Assume req.body contains valid page data
        // TenantId is handled by the model/plugin via context
        const page = await PageService.createPage(req.body);
        res.status(201).json({ success: true, data: page });
    } catch (error) {
        next(error);
    }
};

// Get all pages (filtered by tenant context in service/model)
export const getPages = async (req: Request, res: Response, next: NextFunction) =>
{
    try {
        const pages = await PageService.getPages(req.query);
        res.status(200).json({ success: true, data: pages });
    } catch (error) {
        next(error);
    }
};

// Get single page by slug
export const getPageBySlug = async (req: Request, res: Response, next: NextFunction) =>
{
    try {
        const page = await PageService.getPageBySlug(req.params.slug as string);
        if (!page) {
            res.status(404).json({ success: false, message: 'Page not found' });
            return;
        }
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        next(error);
    }
};

// Get single page by ID
export const getPageById = async (req: Request, res: Response, next: NextFunction) =>
{
    try {
        const page = await PageService.getPageById(req.params.id as string);
        if (!page) {
            res.status(404).json({ success: false, message: 'Page not found' });
            return;
        }
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        next(error);
    }
};

// Update page
export const updatePage = async (req: AuthRequest, res: Response, next: NextFunction) =>
{
    try {
        const page = await PageService.updatePage(req.params.id as string, req.body);
        if (!page) {
            res.status(404).json({ success: false, message: 'Page not found' });
            return;
        }
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        next(error);
    }
};

// Delete page
export const deletePage = async (req: AuthRequest, res: Response, next: NextFunction) =>
{
    try {
        const page = await PageService.deletePage(req.params.id as string);
        if (!page) {
            res.status(404).json({ success: false, message: 'Page not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Page deleted' });
    } catch (error) {
        next(error);
    }
};
