import express from "express";
import verifyJWT from "@/middlewares/verifyJWT.js";
import UserToken from "../../Interfaces/UserToken.js";
import User from "@/schemas/UserSchema.js";
import logger from "@/config/logger.js";

const router = express.Router();

router.post("/", verifyJWT, async (req, res) => {
  const { id } = req.user as UserToken;
  try {
    const user = await User.findById(id);
    res.status(200).json({ success: true, login: user?.loginHistory });
  } catch (error) {
    logger.error({ code: "SETTINGS-RECENTLOGINS-001", message: error });
    res.status(500).send();
  }
});

// ! ADD LOGOUT FUNCTIONALITY

export default router;
