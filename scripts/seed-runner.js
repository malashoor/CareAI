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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/seed-runner.ts
var fs_1 = require("fs");
var path_1 = require("path");
var pg_1 = require("pg");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var SEED_DIR = path_1.default.join(__dirname, '../supabase/seeds');
var SQL_FILES = fs_1.default.readdirSync(SEED_DIR).filter(function (file) { return file.endsWith('.sql'); });
var client = new pg_1.Client({
    connectionString: process.env.DATABASE_URL, // Must be set in .env
});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, SQL_FILES_1, file, fullPath, sql, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                return [4 /*yield*/, client.connect()];
            case 1:
                _a.sent();
                console.log('🚀 Connected to database');
                _i = 0, SQL_FILES_1 = SQL_FILES;
                _a.label = 2;
            case 2:
                if (!(_i < SQL_FILES_1.length)) return [3 /*break*/, 5];
                file = SQL_FILES_1[_i];
                fullPath = path_1.default.join(SEED_DIR, file);
                sql = fs_1.default.readFileSync(fullPath, 'utf-8');
                console.log("\uD83C\uDF31 Running seed: ".concat(file));
                return [4 /*yield*/, client.query(sql)];
            case 3:
                _a.sent();
                console.log("\u2705 Completed: ".concat(file));
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [4 /*yield*/, client.end()];
            case 6:
                _a.sent();
                console.log('🌿 All seeds applied successfully!');
                return [3 /*break*/, 8];
            case 7:
                err_1 = _a.sent();
                console.error('❌ Seed error:', err_1);
                process.exit(1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); })();
