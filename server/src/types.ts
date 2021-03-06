import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core"
import { Request, Response } from 'express';
import { Session, SessionData } from "express-session";

export type MyContext = {
   em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>,
   req: Request & { session: Session & Partial<SessionData> & Express.Request & { userId: number }; },
   res: Response
}