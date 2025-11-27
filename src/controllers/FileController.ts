import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { File } from '../entity/File';
import fs from 'fs';
import path from 'path';

const fileRepository = AppDataSource.getRepository(File);

export class FileController {
    static async uploadFile(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const { filename, originalname, mimetype, size } = req.file;
            const extension = path.extname(originalname);

            const newFile = new File();
            newFile.name = filename; //имя на диске
            newFile.extension = extension;
            newFile.mimeType = mimetype;
            newFile.size = size;

            await fileRepository.save(newFile);

            return res
                .status(201)
                .json({ message: 'File uploaded', file: newFile });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Upload error' });
        }
    }

    static async listFiles(req: Request, res: Response) {
        try {
            const list_size = req.query.list_size
                ? Number(req.query.list_size)
                : 10;
            const page = req.query.page ? Number(req.query.page) : 1;
            const skip = (page - 1) * list_size;

            const [files, total] = await fileRepository.findAndCount({
                skip: skip,
                take: list_size,
            });

            return res.json({
                total,
                page,
                list_size,
                files,
            });
        } catch (e) {
            return res.status(500).json({ message: 'List error' });
        }
    }

    static async getFileInfo(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const file = await fileRepository.findOne({ where: { id } });

            if (!file) {
                return res.status(404).json({ message: 'File not found' });
            }

            return res.json(file);
        } catch (e) {
            return res.status(500).json({ message: 'Error getting file info' });
        }
    }

    static async downloadFile(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const file = await fileRepository.findOne({ where: { id } });

            if (!file) {
                return res.status(404).json({ message: 'File not found' });
            }

            const filePath = path.join(__dirname, '../../uploads', file.name);

            if (fs.existsSync(filePath)) {
                return res.download(filePath, file.name);
            } else {
                return res
                    .status(404)
                    .json({ message: 'File missing on server' });
            }
        } catch (e) {
            return res.status(500).json({ message: 'Download error' });
        }
    }

    static async deleteFile(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const file = await fileRepository.findOne({ where: { id } });

            if (!file) {
                return res.status(404).json({ message: 'File not found' });
            }

            //удаляем с диска
            const filePath = path.join(__dirname, '../../uploads', file.name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            //удаляем из базы
            await fileRepository.delete(id);

            return res.json({ message: 'File deleted' });
        } catch (e) {
            return res.status(500).json({ message: 'Delete error' });
        }
    }

    static async updateFile(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (!req.file) {
                return res
                    .status(400)
                    .json({ message: 'No new file uploaded' });
            }

            const oldFile = await fileRepository.findOne({ where: { id } });
            if (!oldFile) {
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ message: 'File not found' });
            }

            //удаляем старый  файл с диска
            const oldPath = path.join(__dirname, '../../uploads', oldFile.name);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            //обновляем данные в базе на новый файл
            const { filename, originalname, mimetype, size } = req.file;
            const extension = path.extname(originalname);

            oldFile.name = filename;
            oldFile.extension = extension;
            oldFile.mimeType = mimetype;
            oldFile.size = size;
            oldFile.uploadDate = new Date();

            await fileRepository.save(oldFile);

            return res.json({ message: 'File updated', file: oldFile });
        } catch (e) {
            return res.status(500).json({ message: 'Update error' });
        }
    }
}
