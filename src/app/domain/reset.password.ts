import { Usuario } from "./usuario.model";

export interface ResetPassword {
  username?: string;
  oldPassword?: string;
  newPassword?: string;
}
