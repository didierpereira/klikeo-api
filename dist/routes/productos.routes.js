"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const productos_controller_1 = require("../controllers/productos.controller");
const authenticate_1 = require("../middlewares/authenticate");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
router.get('/negocios/:id/productos', authenticate_1.authenticate, productos_controller_1.listProductsByBusinessController);
router.post('/negocios/:id/productos', authenticate_1.authenticate, productos_controller_1.createProductController);
router.get('/productos/:id', productos_controller_1.getProductController);
router.put('/productos/:id', authenticate_1.authenticate, productos_controller_1.updateProductController);
router.delete('/productos/:id', authenticate_1.authenticate, productos_controller_1.deleteProductController);
router.post('/productos/:id/image', authenticate_1.authenticate, upload.single('image'), productos_controller_1.uploadProductImageController);
exports.default = router;
