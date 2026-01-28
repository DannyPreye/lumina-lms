import jwt from 'jsonwebtoken';
import { config } from '../../config/env.config';

export const generateAccessToken = (userId: string, roles: string[]): string =>
{
    return jwt.sign({ id: userId, roles }, config.JWT_SECRET, {
        expiresIn: config.ACCESS_TOKEN_EXPIRE as any,
    });
};

export const generateRefreshToken = (userId: string): string =>
{
    return jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, {
        expiresIn: config.REFRESH_TOKEN_EXPIRE as any,
    });
};

export const verifyAccessToken = (token: string) =>
{
    return jwt.verify(token, config.JWT_SECRET);
};

export const verifyRefreshToken = (token: string) =>
{
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

export const decodeToken = (token: string) =>
{
    return jwt.decode(token);
};
