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
exports.exportQualityControlCSV = exports.deleteQualityControl = exports.updateQualityControl = exports.getAllQualityControl = exports.createQualityControl = void 0;
const db_1 = require("../../db");
const path_1 = __importDefault(require("path"));
const json2csv_1 = require("json2csv");
const fs_1 = __importDefault(require("fs"));
// Create Quality Control Record
const createQualityControl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_id, inspection_date, scheduled_date, result: inspection_result } = req.body;
    try {
        const result = yield db_1.pool.query('INSERT INTO quality_control (product_id, inspection_date, scheduled_date, result) VALUES ($1, $2, $3, $4) RETURNING *', [product_id, inspection_date, scheduled_date, inspection_result]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
exports.createQualityControl = createQualityControl;
// Get All Quality Control Records
const getAllQualityControl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT * FROM quality_control');
        res.json(result.rows);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
exports.getAllQualityControl = getAllQualityControl;
// Update Quality Control Record
const updateQualityControl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { inspection_id } = req.params;
    const { product_id, inspection_date, scheduled_date, result: inspection_result } = req.body; // Added scheduled_date
    try {
        const result = yield db_1.pool.query('UPDATE quality_control SET product_id = $1, inspection_date = $2, scheduled_date = $3, result = $4 WHERE inspection_id = $5 RETURNING *', [product_id, inspection_date, scheduled_date, inspection_result, inspection_id] // Updated SQL query to include scheduled_date
        );
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
exports.updateQualityControl = updateQualityControl;
// Delete Quality Control Record
const deleteQualityControl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { inspection_id } = req.params; // Changed 'id' to 'inspection_id'
    try {
        yield db_1.pool.query('DELETE FROM quality_control WHERE inspection_id = $1', [inspection_id]); // Using inspection_id
        res.send('Record Deleted');
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
exports.deleteQualityControl = deleteQualityControl;
// Export Quality Control Data as CSV
const exportQualityControlCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield db_1.pool.query('SELECT * FROM quality_control');
        if (result.rows.length === 0) {
            res.status(404).send('No quality control data available to export.');
            return;
        }
        // Modify the date fields to only show the date in YYYY-MM-DD format
        const formattedRows = result.rows.map(row => (Object.assign(Object.assign({}, row), { inspection_date: new Date(row.inspection_date).toISOString().slice(0, 10), scheduled_date: new Date(row.scheduled_date).toISOString().slice(0, 10) })));
        const fields = ['inspection_id', 'product_id', 'inspection_date', 'scheduled_date', 'result']; // Define CSV headers
        const json2csvParser = new json2csv_1.Parser({ fields });
        const csv = json2csvParser.parse(formattedRows);
        // Create a CSV file and save it in the 'exports' folder
        const filePath = path_1.default.join(__dirname, '../../exports', `QualityControl_report_${dateString}.csv`);
        fs_1.default.writeFileSync(filePath, csv);
        // Send the CSV file as a download
        res.download(filePath, 'quality_control_report.csv', (err) => {
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
exports.exportQualityControlCSV = exportQualityControlCSV;
