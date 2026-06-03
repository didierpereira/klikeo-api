"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImageController = exports.deleteProductController = exports.updateProductController = exports.createProductController = exports.getProductController = exports.listProductsByBusinessController = void 0;
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const NegocioRepository_1 = require("../repositories/NegocioRepository");
const ProductRepository_1 = require("../repositories/ProductRepository");
const CreateProductUseCase_1 = require("../use-cases/productos/CreateProductUseCase");
const UpdateProductUseCase_1 = require("../use-cases/productos/UpdateProductUseCase");
const DeleteProductUseCase_1 = require("../use-cases/productos/DeleteProductUseCase");
const GetProductUseCase_1 = require("../use-cases/productos/GetProductUseCase");
const ListProductsByBusinessUseCase_1 = require("../use-cases/productos/ListProductsByBusinessUseCase");
const negocioRepo = new NegocioRepository_1.NegocioRepository();
const productRepo = new ProductRepository_1.ProductRepository();
const createProductUseCase = new CreateProductUseCase_1.CreateProductUseCase(productRepo, negocioRepo);
const updateProductUseCase = new UpdateProductUseCase_1.UpdateProductUseCase(productRepo, negocioRepo);
const deleteProductUseCase = new DeleteProductUseCase_1.DeleteProductUseCase(productRepo);
const getProductUseCase = new GetProductUseCase_1.GetProductUseCase(productRepo);
const listProductsByBusinessUseCase = new ListProductsByBusinessUseCase_1.ListProductsByBusinessUseCase(productRepo);
const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            resource_type: 'image',
            folder: 'klikeo/productos',
        }, (error, result) => {
            if (error)
                return reject(error);
            if (!result?.secure_url || !result.public_id) {
                return reject(new Error('Cloudinary upload no devolvió URL segura'));
            }
            resolve({ url: result.secure_url, publicId: result.public_id });
        });
        stream_1.Readable.from(file.buffer).pipe(uploadStream);
    });
};
const deleteFromCloudinary = async (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary_1.default.uploader.destroy(publicId, { resource_type: 'image' }, (error, result) => {
            if (error)
                return reject(error);
            if (result?.result === 'ok' || result?.result === 'not_found') {
                return resolve();
            }
            return reject(new Error(`Cloudinary destroy retornó ${result?.result}`));
        });
    });
};
const listProductsByBusinessController = async (req, res) => {
    try {
        const negocio = await negocioRepo.findByIdOrSlug(req.params.id);
        if (!negocio) {
            res.status(404).json({ error: 'Negocio no encontrado' });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: 'No tienes permiso para ver estos productos' });
            return;
        }
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
        const result = await listProductsByBusinessUseCase.execute({
            negocioId: negocio.id,
            page,
            limit,
        });
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
};
exports.listProductsByBusinessController = listProductsByBusinessController;
const getProductController = async (req, res) => {
    try {
        const product = await getProductUseCase.execute(req.params.id);
        res.json(product);
    }
    catch (err) {
        if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.status(500).json({ error: 'Error interno' });
    }
};
exports.getProductController = getProductController;
const createProductController = async (req, res) => {
    try {
        const negocio = await negocioRepo.findByIdOrSlug(req.params.id);
        if (!negocio) {
            res.status(404).json({ error: 'Negocio no encontrado' });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: 'No tienes permiso' });
            return;
        }
        const product = await createProductUseCase.execute(req.body, negocio.id, req.user.userId);
        res.status(201).json(product);
    }
    catch (err) {
        if (err instanceof Error) {
            if (err.message === 'FORBIDDEN') {
                res.status(403).json({ error: 'No tienes permiso' });
                return;
            }
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: 'Error interno' });
    }
};
exports.createProductController = createProductController;
const updateProductController = async (req, res) => {
    try {
        const product = await productRepo.findById(req.params.id);
        if (!product || product.isDeleted) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        const negocio = await negocioRepo.findById(product.negocioId);
        if (!negocio) {
            res.status(404).json({ error: 'Negocio no encontrado' });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: 'No tienes permiso' });
            return;
        }
        const updated = await updateProductUseCase.execute(req.params.id, req.body, req.user.userId);
        res.json(updated);
    }
    catch (err) {
        if (err instanceof Error) {
            if (err.message === 'FORBIDDEN') {
                res.status(403).json({ error: 'No tienes permiso' });
                return;
            }
            if (err.message === 'PRODUCT_NOT_FOUND') {
                res.status(404).json({ error: 'Producto no encontrado' });
                return;
            }
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: 'Error interno' });
    }
};
exports.updateProductController = updateProductController;
const deleteProductController = async (req, res) => {
    try {
        const product = await productRepo.findById(req.params.id);
        if (!product || product.isDeleted) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        const negocio = await negocioRepo.findById(product.negocioId);
        if (!negocio) {
            res.status(404).json({ error: 'Negocio no encontrado' });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: 'No tienes permiso' });
            return;
        }
        if (product.imagePublicId) {
            await deleteFromCloudinary(product.imagePublicId);
        }
        const deleted = await deleteProductUseCase.execute(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json({ message: 'Producto eliminado correctamente' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
};
exports.deleteProductController = deleteProductController;
const uploadProductImageController = async (req, res) => {
    try {
        const product = await productRepo.findById(req.params.id);
        if (!product || product.isDeleted) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        const negocio = await negocioRepo.findById(product.negocioId);
        if (!negocio) {
            res.status(404).json({ error: 'Negocio no encontrado' });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: 'No tienes permiso' });
            return;
        }
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'Debes subir una imagen' });
            return;
        }
        if (product.imagePublicId) {
            await deleteFromCloudinary(product.imagePublicId);
        }
        const uploadResult = await uploadToCloudinary(file);
        const updated = await productRepo.update(product.id, {
            imageUrl: uploadResult.url,
            imagePublicId: uploadResult.publicId,
        });
        if (!updated) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'Error interno';
        res.status(500).json({ error: message });
    }
};
exports.uploadProductImageController = uploadProductImageController;
