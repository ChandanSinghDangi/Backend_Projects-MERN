import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";


const router = Router();

router.route('/register').post(registerUser)


export default router // with default we can change router name while importing...
