"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
exports.default = {
    dbName: "reddit-clone",
    entities: [Post_1.Post, User_1.User],
    migrations: {
        path: path_1.default.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    user: "postgres",
    password: "admin",
    debug: !constants_1.__prod__,
    type: "postgresql",
};
//# sourceMappingURL=mikro-orm.config.js.map