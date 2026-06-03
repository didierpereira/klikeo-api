"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const negocios_controller_1 = require("../controllers/negocios.controller");
const authenticate_1 = require("../middlewares/authenticate");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const route = (0, express_1.Router)();
route.get("/", negocios_controller_1.getBussinesController);
route.get("/admin/stats", authenticate_1.authenticate, negocios_controller_1.getAdminStatsController);
route.get("/me", authenticate_1.authenticate, negocios_controller_1.getBussinesByOwnerController);
route.post("/:id/assets", authenticate_1.authenticate, upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]), negocios_controller_1.uploadBusinessAssetsController);
route.delete("/:id/logo", authenticate_1.authenticate, negocios_controller_1.deleteBusinessLogoController);
route.delete("/:id/banner", authenticate_1.authenticate, negocios_controller_1.deleteBusinessBannerController);
route.get("/:id", negocios_controller_1.getBussinesByIdController);
route.post("/", authenticate_1.authenticate, negocios_controller_1.createBussinesController);
route.put("/:id", authenticate_1.authenticate, negocios_controller_1.updateBussinesController);
route.post("/:id/chat", negocios_controller_1.chatWithBussinesController);
route.post("/:id/chat/entrenar", authenticate_1.authenticate, negocios_controller_1.trainWhatsappAgentController);
route.get("/:id/chats", authenticate_1.authenticate, negocios_controller_1.getBussinessCahtsController);
exports.default = route;
