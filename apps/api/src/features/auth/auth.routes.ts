import { Router } from "express";

import { loginInputSchema, registerInputSchema } from "@rpg/contracts";

import { requireAuth } from "../../middleware/require-auth";
import { validate } from "../../middleware/validate";
import * as controller from "./auth.controller";

export const authRouter: Router = Router();

authRouter.get("/csrf", controller.csrf);
authRouter.post("/register", validate(registerInputSchema), controller.register);
authRouter.post("/login", validate(loginInputSchema), controller.login);
authRouter.post("/logout", requireAuth, controller.logout);
authRouter.get("/me", requireAuth, controller.me);
