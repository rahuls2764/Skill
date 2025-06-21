import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ipfsRoutes from "./routes/ipfsUpload.routes.js"
const app = express();
dotenv.config();
const PORT=process.env.PORT||8000;
app.use(cors());
app.use(express.json());
app.get("/",(req,res)=>{
      res.send("this is ketan")
})

app.use("/api/ipfs",ipfsRoutes)

app.listen(PORT,()=>{
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
})
