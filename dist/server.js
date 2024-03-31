"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const competence_routes_1 = __importDefault(require("./routes/competence.routes"));
const question_routes_1 = __importDefault(require("./routes/question.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const login_routes_1 = __importDefault(require("./routes/login.routes"));
const competenceQuestion_routes_1 = __importDefault(require("./routes/competenceQuestion.routes"));
const pdf_routes_1 = __importDefault(require("./routes/pdf.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const authenticator_1 = __importDefault(require("./middlewares/authenticator"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use(body_parser_1.default.json());
app.use('/api', login_routes_1.default);
app.use('/api', competence_routes_1.default);
app.use('/api', pdf_routes_1.default);
app.use('/api', user_routes_1.default);
app.use('/api', authenticator_1.default, question_routes_1.default);
app.use('/api', authenticator_1.default, competenceQuestion_routes_1.default);
mongoose_1.default.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.beoiebt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch(err => {
    console.log(process.env);
    console.error('Error connecting to MongoDB:', err.message);
});
