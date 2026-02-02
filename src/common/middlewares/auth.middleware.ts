import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { verifyAccessToken } from '../utils/jwt.util';

export interface AuthRequest extends Request
{
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) =>
{
    try {
        let token: string | undefined;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[ 1 ];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return next(createError(401, 'Not authorized, no token provided'));
        }

        const decoded = verifyAccessToken(token) as { id: string; roles: string[]; };
        req.user = decoded;
        next();
    } catch (error) {
        next(createError(401, 'Not authorized, token failed'));
    }
};

export const authorize = (...roles: string[]) =>
{
    return (req: AuthRequest, res: Response, next: NextFunction) =>
    {
        if (!req.user || !req.user.roles || !roles.some((role) => req.user.roles.includes(role))) {
            return next(createError(403, `User is not authorized to access this route`));
        }
        next();
    };
};
