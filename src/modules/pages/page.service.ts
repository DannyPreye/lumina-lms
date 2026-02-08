
import { Page, IPage } from './page.model';

export const createPage = async (data: Partial<IPage>): Promise<IPage> =>
{
    return await Page.create(data);
};

export const getPages = async (query: any = {}): Promise<IPage[]> =>
{
    // Basic filter implementation
    const filter: any = {};
    if (query.isPublished) filter.isPublished = query.isPublished === 'true';
    if (query.type) filter.type = query.type;

    return await Page.find(filter).sort({ createdAt: -1 });
};

export const getPageBySlug = async (slug: string): Promise<IPage | null> =>
{
    return await Page.findOne({ slug });
};

export const getPageById = async (id: string): Promise<IPage | null> =>
{
    return await Page.findById(id);
};

export const updatePage = async (id: string, data: Partial<IPage>): Promise<IPage | null> =>
{
    return await Page.findByIdAndUpdate(id, data, { new: true });
};

export const deletePage = async (id: string): Promise<IPage | null> =>
{
    return await Page.findByIdAndDelete(id);
};
