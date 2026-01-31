import cloudinary from '../../config/cloudinary.config';
import { Asset, Folder } from './asset.model';
import createError from 'http-errors';
import streamifier from 'streamifier';

export class AssetService
{
    /**
     * Upload an asset to Cloudinary and save to DB
     */
    static async uploadAsset(userId: string, file: Express.Multer.File, folder: string = 'lumina/general')
    {
        return new Promise((resolve, reject) =>
        {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto',
                },
                async (error, result) =>
                {
                    if (error) return reject(createError(500, 'Cloudinary upload failed'));
                    if (!result) return reject(createError(500, 'Cloudinary upload resulted in no data'));

                    try {
                        const asset = await Asset.create({
                            userId: userId,
                            fileName: file.originalname,
                            fileUrl: result.secure_url,
                            publicId: result.public_id,
                            fileType: result.resource_type,
                            fileSize: result.bytes,
                            folder: folder,
                            mimeType: file.mimetype,
                            metadata: result
                        });
                        resolve(asset);
                    } catch (dbError) {
                        reject(dbError);
                    }
                }
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    /**
     * List user assets with filters and pagination
     */
    static async listAssets(userId: string, query: any, isAdmin: boolean)
    {
        const {
            page = 1,
            limit = 20,
            folder,
            type,
            search
        } = query;


        const filter: any = {};
        if (!isAdmin) filter.userId = userId;
        if (folder) filter.folder = { $regex: folder, $options: 'i' };
        if (type) filter.fileType = type;
        if (search) {
            filter.$or = [
                { fileName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const assets = await Asset.find(filter)
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit as string));

        const total = await Asset.countDocuments(filter);

        return {
            assets,
            total,
            page: parseInt(page as string),
            pages: Math.ceil(total / parseInt(limit as string))
        };
    }

    /**
     * Delete an asset from Cloudinary and DB
     */
    static async deleteAsset(userId: string, assetId: string, isAdmin: boolean)
    {
        const asset = isAdmin
            ? await Asset.findOne({ _id: assetId })
            : await Asset.findOne({ _id: assetId, userId });

        if (!asset) throw createError(404, 'Asset not found');

        try {
            // Remove from Cloudinary
            await cloudinary.uploader.destroy(asset.publicId, { resource_type: asset.fileType });

            // Remove from DB
            await Asset.findByIdAndDelete(assetId);
            return true;
        } catch (error) {
            throw createError(500, 'Failed to delete asset');
        }
    }

    /**
     * Get a folder by name for a user
     */
    static async getFolderByName(userId: string, name: string)
    {
        return await Folder.findOne({ userId, name });
    }

    /**
     * Create a new folder
     */
    static async createFolder(userId: string, name: string)
    {
        // Normalize path: lumina/user_id/folder_name
        const path = `lumina/${userId}/${name.toLowerCase().replace(/\s+/g, '_')}`;

        const existing = await Folder.findOne({ userId, name });
        if (existing) return existing; // Return existing instead of throwing

        const folder = await Folder.create({
            userId,
            name,
            path
        });

        return folder;
    }


    /**
     * Delete a folder and all its contents
     */
    static async deleteFolder(userId: string, folderId: string, isAdmin: boolean)
    {
        const folder = isAdmin
            ? await Folder.findOne({ _id: folderId })
            : await Folder.findOne({ _id: folderId, userId });

        if (!folder) throw createError(404, 'Folder not found');

        // 1. Get all assets in this folder
        const assets = await Asset.find({ folder: folder.path });

        // 2. Delete each asset from Cloudinary
        for (const asset of assets) {
            try {
                await cloudinary.uploader.destroy(asset.publicId, { resource_type: asset.fileType });
            } catch (err) {
                console.error(`Failed to delete asset ${asset.publicId} from Cloudinary:`, err);
            }
        }

        // 3. Delete assets from DB
        await Asset.deleteMany({ folder: folder.path });

        // 4. Delete folder from DB
        await Folder.findByIdAndDelete(folderId);

        // Note: Cloudinary doesn't have a "delete folder" API for non-empty folders that works easily without deleting resources first.
        // Once assets are gone, the folder effectively ceases to exist in Cloudinary's UI once refreshed,
        // but we can also use api.delete_folder if it's empty.
        try {
            await cloudinary.api.delete_folder(folder.path);
        } catch (err) {
            // This might fail if the folder still has hidden versions or subfolders,
            // but we've deleted our tracked assets.
            console.warn(`Cloudinary folder deletion failed (might not be empty): ${folder.path}`);
        }

        return true;
    }

    /**
     * Get unique folders used by the user
     */
    static async getUserFolders(userId: string, isAdmin: boolean)
    {
        if (isAdmin) {
            return await Folder.find();
        } else {
            return await Folder.find({ userId });
        }
    }
}

