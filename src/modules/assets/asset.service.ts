import cloudinary from '../../config/cloudinary.config';
import { Asset } from './asset.model';
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
    static async listAssets(userId: string, query: any)
    {
        const {
            page = 1,
            limit = 20,
            folder,
            type,
            search
        } = query;

        const filter: any = { userId };

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
    static async deleteAsset(userId: string, assetId: string)
    {
        const asset = await Asset.findOne({ _id: assetId, userId });
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
     * Get unique folders used by the user
     */
    static async getUserFolders(userId: string)
    {
        return await Asset.distinct('folder', { userId });
    }
}
