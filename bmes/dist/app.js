"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const productionRoutes_1 = __importDefault(require("./production/routes/productionRoutes"));
const qcRoutes_1 = __importDefault(require("./QualityControl/routes/qcRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/production', productionRoutes_1.default);
app.use('/api/quality-control', qcRoutes_1.default);
exports.default = app;
