import { Ctx } from "./src/context";

declare global {
  namespace Express {
    export interface Request {
      ctx: Ctx;
    }
  }
}
