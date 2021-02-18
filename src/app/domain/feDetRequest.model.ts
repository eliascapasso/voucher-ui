import {AlicIva} from './alicIva.model';
export class FeDetRequest {
    
    cbteDesde: number;
    cbteFch: string;
    cbteHasta: number;
    cbtesAsoc: string;
    compradores: string;
    concepto: number;
    docNro: number;
    docTipo: number;
    fchServDesde: string;
    fchServHasta: string;
    fchVtoPago: string;
    impIVA: number;
    impNeto: number;
    impOpEx: number;
    impTotConc: number;
    impTotal: number;
    impTrib: number;
    iva: AlicIva[];
    monCotiz: number;
    monId: string;
    numeroInterno: number;
    opcionales: string;
}
