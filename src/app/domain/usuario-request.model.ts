import { Empresa } from "./empresa.model";

export interface UsuarioRequest {
    email: string;
    apellido: string;
    nombre: string;
    estado: boolean;
    empresa: Empresa;
    password?: string;
    roles: string[];
}
