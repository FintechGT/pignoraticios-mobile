// src/api/solicitudes.ts
import { api } from "./cliente";
export async function listMisSolicitudes() {
  const r = await api.get("/solicitudes-completa");
  return r.data as any[];
}
