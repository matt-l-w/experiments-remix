import { json } from "remix";

export const badRequest = <T>(data: T) => json(data, { status: 400 });
