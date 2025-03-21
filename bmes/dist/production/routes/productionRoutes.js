"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productionController_1 = require("../controller/productionController");
const router = (0, express_1.Router)();
// Create a production record
router.post('/create/', productionController_1.createProduction);
// Get all production records
router.get('/get/', productionController_1.getAllProduction);
// Update a production record
router.put('/update/:product_id', productionController_1.updateProduction); // Update by product_id
// Delete a production record
router.delete('/delete/:product_id', productionController_1.deleteProduction); // Use product_id here
//export to csv
router.get('/export/csv', productionController_1.exportProductionCSV);
exports.default = router;
