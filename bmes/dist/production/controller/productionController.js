"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportProductionCSV = exports.deleteProduction = exports.updateProduction = exports.getAllProduction = exports.createProduction = void 0;
const db_1 = require("../../db");
const path_1 = __importDefault(require("path"));
const json2csv_1 = require("json2csv");
const fs_1 = __importDefault(require("fs"));
// Create Production Record
const createProduction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status, material } = req.body;
    try {
        const result = yield db_1.pool.query('INSERT INTO production (name, status, material) VALUES ($1, $2, $3) RETURNING *', [name, status, material]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
exports.createProduction = createProduction;
// Get All Production Records
const getAllProduction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT * FROM production');
        res.json(result.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
exports.getAllProduction = getAllProduction;
// Update Production Record
const updateProduction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_id } = req.params;
    const { name, status } = req.body;
    try {
        const result = yield db_1.pool.query('UPDATE production SET name = $1, status = $2 WHERE product_id = $3 RETURNING *', [name, status, product_id]);
        if (result.rowCount === 0) {
            // If no rows were affected, return a "Not Found" response
            res.status(404).send(`Record with Product ID ${product_id} not found.`);
            console.log(`Record with Product ID ${product_id} not found.`);
        }
        else {
            // If update was successful, send the updated record
            res.json(result.rows[0]);
        }
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
exports.updateProduction = updateProduction;
// Delete Production Record
const deleteProduction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_id } = req.params;
    try {
        const result = yield db_1.pool.query('DELETE FROM production WHERE product_id = $1', [product_id]); // Deleting based on product_id
        if (result.rowCount === 0) {
            // If no rows were affected, return a "Not Found" response
            res.status(404).send(`Record with Product ID ${product_id} not found.`);
            console.log(`Record with Product ID ${product_id} not found.`);
        }
        else {
            // If deletion was successful, send confirmation
            res.send('Record Deleted');
        }
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
exports.deleteProduction = deleteProduction;
// Export Production Data as CSV
const exportProductionCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the current date and time
        const now = new Date();
        // Malaysia is UTC+8, so we adjust the time accordingly
        const malaysiaOffset = 8 * 60; // Malaysia is 8 hours ahead of UTC in minutes
        const localTime = new Date(now.getTime() + malaysiaOffset * 60 * 1000);
        // Format the adjusted date and time similar to your existing format
        const dateString = localTime.toISOString()
            .slice(0, 19) // Take the part up to seconds, discard milliseconds and 'Z'
            .replace('T', ' ') // Replace 'T' separator with a space
            .replace(/:/g, '-'); // Replace colons with dashes for valid file name
        const result = yield db_1.pool.query('SELECT * FROM production');
        if (result.rows.length === 0) {
            res.status(404).send('No data available to export.');
            return; // Exit early if no data
        }
        const fields = ['product_id', 'name', 'material', 'status'];
        const json2csvParser = new json2csv_1.Parser({ fields });
        const csv = json2csvParser.parse(result.rows);
        const exportDir = path_1.default.join(__dirname, '../../exports');
        // Ensure the 'exports' directory exists
        if (!fs_1.default.existsSync(exportDir)) {
            fs_1.default.mkdirSync(exportDir, { recursive: true });
        }
        const filePath = path_1.default.join(exportDir, `Production_report_${dateString}.csv`);
        fs_1.default.writeFileSync(filePath, csv);
        // Ensure that res.download is correctly handled
        res.download(filePath, 'production_report.csv', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error downloading the file.');
            }
            else {
                console.log('CSV report generated and downloaded successfully.');
            }
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
exports.exportProductionCSV = exportProductionCSV;
