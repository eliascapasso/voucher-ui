export interface Usuario {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dni?: number;
  gender?: string;
  status?: string;
  phone?: number;
  codigoVerificacionCliente?: string;
  pedidoCodigoVerificacionCliente?: string;
  enabled?: boolean;
  roles?: string[];
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
  password?: string;
}
