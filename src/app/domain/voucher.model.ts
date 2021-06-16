import { ArchivoExcel } from "./archivo-excel.model";

export interface Voucher {
  _id?: string;
  dni?: string;
  codigoVoucher?: string;
  codigoBarras?: string;
  valor?: number;
  tipoDoc?: number;
  puntoVenta?: number;
  observacion?: string;
  nombreApellido?: string;
  idCopia?: any;
  habilitado?: boolean;
  fechaHasta?: Date;
  fechaDesde?: Date;
  facturaAsociada?: any;
  excel?:ArchivoExcel;
  estadosPasados?: string;
  fecha?: any;
  estado?: string;
  empresa?: string;
  empresaEmision?: string;
}
