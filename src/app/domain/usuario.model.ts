import { Empresa } from "./empresa.model";
import { Role } from "./role.model";

export interface Usuario {
  _id?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  empresa?: Empresa;
  estado?: boolean;
  password?: string;
  roles?: Role[];
  telefono?: string;
}
