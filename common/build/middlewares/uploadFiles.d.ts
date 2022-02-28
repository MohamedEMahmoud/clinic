import { Request, Response, NextFunction } from "express";
import multer from 'multer';
declare const upload: multer.Multer;
declare const validateImage: (req: Request, res: Response, next: NextFunction) => void;
export { upload, validateImage };
