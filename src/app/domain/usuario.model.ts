export interface Usuario {
  _id?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  empresa?: Empresa;
  estado?: boolean;
  password?: string;
  role?: Role;
  telefono?: string;
}

class Empresa {
  _id: string;
  empresa: string;
  estado: boolean;
}

class Role {
  _id?: string;
  role: string;
}
