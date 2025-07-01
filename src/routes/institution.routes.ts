import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  deleteInstitutionById,
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
  createInstitution,
} from "../controllers/institution.controller";

const router = new Hono();

router.get("/", getAllInstitutions);
router.get("/:id", authMiddleware, getInstitutionById);
router.post("/", authMiddleware, createInstitution);
router.patch("/:id", authMiddleware, updateInstitution);
router.delete("/:id", authMiddleware, deleteInstitutionById);

export default router;
