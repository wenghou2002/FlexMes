"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const qcController_1 = require("../controller/qcController");
const router = express_1.default.Router();
router.post('/create/', qcController_1.createQualityControl);
router.get('/get/', qcController_1.getAllQualityControl);
router.put('/update/:inspection_id', qcController_1.updateQualityControl);
router.delete('/delete/:inspection_id', qcController_1.deleteQualityControl);
router.get('/export/csv', qcController_1.exportQualityControlCSV);
exports.default = router;
