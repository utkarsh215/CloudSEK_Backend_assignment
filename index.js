import express from "express";
import 'dotenv/config';
import cors from "cors";
import {connectToDB, getDB} from "./db.js";
import user from "./models/users.js";
import auth from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;


app.get("/", (req, res) => {
    res.send("Post-Comment api base url");
});

app.get('/api/protected', auth, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', commentRoutes);

// Swagger UI
const openapi = JSON.parse(fs.readFileSync(new URL('./openapi.json', import.meta.url)));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));


connectToDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });