"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStatsController = exports.getBussinessCahtsController = exports.chatWithBussinesController = exports.trainWhatsappAgentController = exports.deleteBusinessBannerController = exports.deleteBusinessLogoController = exports.uploadBusinessAssetsController = exports.updateBussinesController = exports.createBussinesController = exports.getBussinesByOwnerController = exports.getBussinesByIdController = exports.getBussinesController = void 0;
const ChatSessionRepository_1 = require("../repositories/ChatSessionRepository");
const NegocioRepository_1 = require("../repositories/NegocioRepository");
const CreateNegocioUseCase_1 = require("../use-cases/negocios/CreateNegocioUseCase");
const GetNegocioByOwnerUseCase_1 = require("../use-cases/negocios/GetNegocioByOwnerUseCase");
const GetNegocioUseCase_1 = require("../use-cases/negocios/GetNegocioUseCase");
const ListNegociosUseCase_1 = require("../use-cases/negocios/ListNegociosUseCase");
const UpdateNegocioUseCase_1 = require("../use-cases/negocios/UpdateNegocioUseCase");
const ChatWithNegocioUseCase_1 = require("../use-cases/chat/ChatWithNegocioUseCase");
const DeepSeekService_1 = require("../services/DeepSeekService");
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const negocioRepo = new NegocioRepository_1.NegocioRepository();
const chatSessionRepo = new ChatSessionRepository_1.ChatSessionRepository();
const createUseCase = new CreateNegocioUseCase_1.CreateNegocioUseCase(negocioRepo);
const getUseCase = new GetNegocioUseCase_1.GetNegocioUseCase(negocioRepo);
const getByOwnerUseCase = new GetNegocioByOwnerUseCase_1.GetNegocioByOwnerUseCase(negocioRepo);
const updateUseCase = new UpdateNegocioUseCase_1.UpdateNegocioUseCase(negocioRepo);
const listUseCase = new ListNegociosUseCase_1.ListNegociosUseCase(negocioRepo);
const chatWithNegocioUseCase = new ChatWithNegocioUseCase_1.ChatWithNegocioUseCase(negocioRepo, new DeepSeekService_1.DeepSeekService());
// GET /api/negocios — public
const getBussinesController = async (req, res) => {
    try {
        const { search, city, category, page, limit } = req.query;
        const result = await listUseCase.execute({
            search: search,
            city: city,
            category: category,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
        res.json(result);
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getBussinesController = getBussinesController;
// GET /api/negocios/:id — public
const getBussinesByIdController = async (req, res) => {
    try {
        const negocio = await getUseCase.execute(req.params.id);
        res.json(negocio);
    }
    catch (err) {
        if (err instanceof Error && err.message === "NEGOCIO_NOT_FOUND") {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getBussinesByIdController = getBussinesByIdController;
// GET /api/negocios/me — owner only
const getBussinesByOwnerController = async (req, res) => {
    try {
        const negocio = await getByOwnerUseCase.execute(req.user.userId);
        res.json(negocio);
    }
    catch (err) {
        if (err instanceof Error && err.message === "NEGOCIO_NOT_FOUND") {
            res.status(404).json({ error: "No tienes un negocio registrado" });
            return;
        }
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getBussinesByOwnerController = getBussinesByOwnerController;
// POST /api/negocios — owner only
const createBussinesController = async (req, res) => {
    try {
        const negocio = await createUseCase.execute(req.body, req.user.userId);
        res.status(201).json(negocio);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Error interno" });
    }
};
exports.createBussinesController = createBussinesController;
// PUT /api/negocios/:id — owner only (must own the negocio)
const updateBussinesController = async (req, res) => {
    try {
        const negocio = await updateUseCase.execute(req.params.id, req.body, req.user.userId);
        res.json(negocio);
    }
    catch (err) {
        if (err instanceof Error) {
            if (err.message === "NEGOCIO_NOT_FOUND") {
                res.status(404).json({ error: "Negocio no encontrado" });
                return;
            }
            if (err.message === "FORBIDDEN") {
                res
                    .status(403)
                    .json({ error: "No tienes permiso para modificar este negocio" });
                return;
            }
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Error interno" });
    }
};
exports.updateBussinesController = updateBussinesController;
const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            resource_type: "auto",
            folder: "klikeo/negocios",
        }, (error, result) => {
            if (error) {
                return reject(error);
            }
            if (!result?.secure_url) {
                return reject(new Error("Cloudinary upload no devolvió URL segura"));
            }
            resolve(result.secure_url);
        });
        stream_1.Readable.from(file.buffer).pipe(uploadStream);
    });
};
const uploadBusinessAssetsController = async (req, res) => {
    try {
        const negocio = await negocioRepo.findByIdOrSlug(req.params.id);
        if (!negocio) {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: "No tienes permiso" });
            return;
        }
        const files = req.files;
        const logoFile = files?.logo?.[0];
        const bannerFile = files?.banner?.[0];
        if (!logoFile && !bannerFile) {
            res.status(400).json({ error: "Debes subir un logo o un banner" });
            return;
        }
        const updateData = {};
        if (logoFile) {
            updateData.logoUrl = await uploadToCloudinary(logoFile);
        }
        if (bannerFile) {
            updateData.bannerUrl = await uploadToCloudinary(bannerFile);
        }
        const updatedNegocio = await negocioRepo.update(negocio.id, updateData);
        if (!updatedNegocio) {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        res.json(updatedNegocio);
    }
    catch (err) {
        console.error("uploadBusinessAssetsController error:", err);
        const message = err instanceof Error ? err.message : "Error interno";
        res.status(500).json({ message: message, error: err });
    }
};
exports.uploadBusinessAssetsController = uploadBusinessAssetsController;
const deleteBusinessLogoController = async (req, res) => {
    try {
        const negocio = await negocioRepo.findByIdOrSlug(req.params.id);
        if (!negocio) {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: "No tienes permiso" });
            return;
        }
        const updatedNegocio = await negocioRepo.update(negocio.id, { logoUrl: null });
        if (!updatedNegocio) {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        res.json(updatedNegocio);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};
exports.deleteBusinessLogoController = deleteBusinessLogoController;
const deleteBusinessBannerController = async (req, res) => {
    try {
        const negocio = await negocioRepo.findByIdOrSlug(req.params.id);
        if (!negocio) {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: "No tienes permiso" });
            return;
        }
        const updatedNegocio = await negocioRepo.update(negocio.id, { bannerUrl: null });
        if (!updatedNegocio) {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        res.json(updatedNegocio);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
};
exports.deleteBusinessBannerController = deleteBusinessBannerController;
// POST /api/negocios/:id/chat/entrenar — saves training data (owner only)
const trainWhatsappAgentController = async (req, res) => {
    try {
        const negocio = await negocioRepo.findByIdOrSlug(req.params.id);
        if (!negocio) {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: "No tienes permiso" });
            return;
        }
        const { trainingData } = req.body;
        if (typeof trainingData !== "string") {
            res.status(400).json({ error: "trainingData es requerido" });
            return;
        }
        await negocioRepo.update(negocio.id, { trainingData });
        res.json({ message: "Chatbot entrenado exitosamente" });
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.trainWhatsappAgentController = trainWhatsappAgentController;
// POST /api/negocios/:id/chat — public conversational chat using DeepSeek
const chatWithBussinesController = async (req, res) => {
    try {
        const messages = req.body?.messages;
        if (!Array.isArray(messages) || !messages.every((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')) {
            res.status(400).json({ error: 'messages debe ser un arreglo de objetos { role, content }' });
            return;
        }
        const reply = await chatWithNegocioUseCase.execute(req.params.id, messages);
        res.json({ reply });
    }
    catch (err) {
        if (err instanceof Error && err.message === 'NEGOCIO_NOT_FOUND') {
            res.status(404).json({ error: 'Negocio no encontrado' });
            return;
        }
        res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
    }
};
exports.chatWithBussinesController = chatWithBussinesController;
// GET /api/negocios/:id/chats — lists chat sessions for the owner
const getBussinessCahtsController = async (req, res) => {
    try {
        const negocio = await negocioRepo.findByIdOrSlug(req.params.id);
        if (!negocio) {
            res.status(404).json({ error: "Negocio no encontrado" });
            return;
        }
        if (negocio.ownerId !== req.user.userId) {
            res.status(403).json({ error: "No tienes permiso" });
            return;
        }
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const result = await chatSessionRepo.findByNegocioId(negocio.id, page, limit);
        res.json(result);
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getBussinessCahtsController = getBussinessCahtsController;
// GET /api/admin/stats — admin only
const getAdminStatsController = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            res.status(403).json({ error: "Solo administradores" });
            return;
        }
        const { data: negocios } = await listUseCase.execute({ limit: 1000 });
        const allChats = await chatSessionRepo.list(1, 1000);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const chatsHoy = allChats.data.filter((c) => new Date(c.createdAt) >= today).length;
        const negociosActivos = negocios.filter((n) => n.isActive).length;
        const negociosConChatbot = negocios.filter((n) => n.trainingData && n.trainingData.length > 0).length;
        res.json({
            totalNegocios: negocios.length,
            negociosActivos,
            negociosConChatbot,
            totalChats: allChats.total,
            chatsHoy,
        });
    }
    catch {
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getAdminStatsController = getAdminStatsController;
