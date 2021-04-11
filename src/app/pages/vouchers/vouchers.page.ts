import { Component, OnInit } from '@angular/core';
import {
    FormGroup,
    FormBuilder
} from '@angular/forms';
import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Voucher } from 'src/app/domain/voucher.model';
import { ToastController } from '@ionic/angular';
import { VoucherService } from 'src/app/service/voucher/voucher.service';

@Component({
    selector: 'app-vouchers',
    templateUrl: './vouchers.page.html',
    styleUrls: ['./vouchers.page.scss']

})
export class VouchersPage implements OnInit {
    public columnas: any[];
    public vouchers: Voucher[] = [];
    public vouchersOriginal: Voucher[] = [];
    public nuevoVoucher: Voucher = {};
    public showTabla: boolean = false
    public voucherForm: FormGroup;
    public msgs: Message[];
    public formMsgs: Message[];
    public displayVouchersModal: boolean = false;
    public estados: any[] = [];
    public filter = { name: '', estado: '', desde: '', hasta: '' };
    public busqueda: string = '';
    public es: any;
    public fechaDesde: Date;
    public fechaHasta: Date;
    public displayVoucherModal: boolean = false;
    
    @BlockUI() blockUI: NgBlockUI;
    constructor(
        private voucherService: VoucherService,
        private formBuilder: FormBuilder,
        public router: Router,
        private confirmationService: ConfirmationService,
        public toastController: ToastController
    ) { }

    ngOnInit() {
        this.es = {
            firstDayOfWeek: 1,
            dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
            dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
            monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
            monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            today: 'Hoy',
            clear: 'Borrar'
        };

        this.filter = { name: '', estado: '', desde: '', hasta: '' };

        this.columnas = [
            { field: 'codigoVoucher', header: 'Numero' },
            { field: 'nombreApellido', header: 'Nombre y apellido' },
            { field: 'dni', header: 'DNI' },
            { field: 'valor', header: 'Valor' },
            { field: 'fechaDesde', header: 'Desde', fechaDesde: true },
            { field: 'fechaHasta', header: 'Hasta', fechaHasta: true },
            { field: 'empresa', header: 'Empresa' },
        ];

        this.voucherForm = this.formBuilder.group({
            estado: ['']
        });

        this.estados.push({ label: 'TODOS', value: '' });
        this.estados.push({ label: 'UTILIZADO', value: 'U' });
        this.estados.push({ label: 'CANCELADO', value: 'C' });
        this.estados.push({ label: 'EMITIDO', value: 'E' });
        this.estados.push({ label: 'ELIMINADO', value: 'EL' });
        this.estados.push({ label: 'VENCIDO', value: 'V' });
        this.estados.push({ label: 'A FACTURAR', value: 'AF' });
        this.nuevoVoucher = {};

        this.getVouchers();
    }

    selectFechaDesde() {
        this.filter.desde = this.fechaDesde.toISOString().replace("/", "-").replace("/", "-").substr(0, 10);
    }

    selectFechaHasta() {
        this.filter.hasta = this.fechaHasta.toISOString().replace("/", "-").replace("/", "-").substr(0, 10);
    }

    getVouchers() {
        var $this = this;
        this.nuevoVoucher = {};
        $this.vouchers = [];

        $this.blockUI.start("Cargando vouchers...");
        $this.voucherService.getVouchers().then(vouchers => {
            $this.blockUI.stop();

            console.log(vouchers);

            if (vouchers.length < 1) {
                $this.showTabla = false;
            } else {
                $this.vouchersOriginal = vouchers;;
                $this.vouchers = vouchers;
                $this.showTabla = true;
            }
        })
            .catch(function (error) {
                $this.blockUI.stop();
                console.error(`error al obtener los vouchers ${error}`);
                $this.formMsgs = [];
                $this.formMsgs.push({ severity: 'error', summary: `Error al obtener los vouchers ${error}`, detail: error });
            });
    }

    actualizarVoucher() {

        if (!this.voucherForm.valid) {
            this.formMsgs = [];
            this.formMsgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
        }
        else {

            this.blockUI.start('Actualizando voucher...');
            this.voucherService.update(this.nuevoVoucher)
                .subscribe((voucher: any) => {
                    this.blockUI.stop();
                    console.log('voucher modificado');
                    this.msgs = [];
                    this.msgs.push({ severity: 'info', summary: `Voucher modificado con exito`, detail: `Voucher modificado` });
                    this.displayVouchersModal = false;
                    this.getVouchers();
                },
                    error => {
                        let msj = (error.message) ? error.message : '';
                        let cause = (error.cause) ? error.cause : '';
                        this.blockUI.stop();
                        console.error(`error al modificar voucher ${error}`);
                        this.formMsgs = [];
                        this.formMsgs.push({ severity: 'error', summary: `Error al modificar el voucher ${msj}`, detail: cause });
                    });
        }
    }

    confirmDelete(voucher) {
        this.confirmationService.confirm({
            message: '¿Esta seguro que desea eliminar el voucher?',
            acceptLabel: 'Confirmar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.voucherService.delete(voucher)
                    .subscribe( (voucher: any) => {
                            console.log('voucher eliminado');
                            this.msgs = [];
                            this.msgs.push({severity: 'info', summary: `Voucher eliminado`, detail: `Voucher eliminado`});
                            this.getVouchers();
                        },
                        error => {
                            console.error(`error al eliminar el voucher ${error}`);
                            this.msgs = [];
                            this.msgs.push({severity: 'error', summary: `error al eliminar el voucher ${error}`, detail: error});
                        });
            }
        });
    }

    public formatearFecha(d): string {
        let date = new Date(d);
        
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        return day + "-" + month + "-" + year;
    }

    public limpiarFiltros(){
        this.fechaDesde = null;
        this.fechaHasta = null;
        this.filter = { name: '', estado: '', desde: '', hasta: '' };
        this.busqueda = "";
        this.getVouchers();
    }

    async presentToast(msj: string) {
        const toast = await this.toastController.create({
          message: msj,
          duration: 2000
        });
        toast.present();
      }

    changeFilterHandler(event) {
        
        this.vouchers = this.vouchersOriginal
            .filter(voucher => {
                if (this.filter['estado'] != '' && this.filter['estado'].toUpperCase() != 'TODOS') {
                    if (voucher.estado == this.filter['estado'].toUpperCase()) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            }).filter(voucher => {
                if (this.busqueda != '') {
                    return voucher.codigoVoucher && voucher.codigoVoucher.toLowerCase().includes(this.busqueda.toLowerCase())
                    || voucher.nombreApellido && voucher.nombreApellido.toLowerCase().includes(this.busqueda.toLowerCase())
                    || voucher.valor && voucher.valor.toString().toLowerCase().includes(this.busqueda.toLowerCase())
                    || voucher.empresa && voucher.empresa.toLowerCase().includes(this.busqueda.toLowerCase())
                    || voucher.dni && voucher.dni.toLowerCase().includes(this.busqueda.toLowerCase());
                }
                return true;
            });

        if (this.vouchers.length == 0) {
            this.showTabla = false;
        } else {
            this.showTabla = true;
        }
    }

    showVoucher(voucher) {
        this.displayVoucherModal = true;
        // this.blockUI.start("Cargando voucher...");

        // this.usuarioService.getUsuarioByDni(voucher.feDetRequest.docNro).then(usuario => {
        //     this.datosvoucher.razonSocial = usuario.firstName + usuario.lastName;
        //     this.datosvoucher.email = usuario.email;
        //     this.datosvoucher.telefono = usuario.phone;
        //     this.datosvoucher.domicilio = ''; //Setear el domicilio

        //     this.blockUI.stop();
        // })
        //     .catch(function (error) {
        //         this.blockUI.stop();
        //         console.error(`error al obtener los vouchers ${error}`);
        //         this.formMsgs = [];
        //         this.formMsgs.push({ severity: 'error', summary: `Error al obtener los vouchers ${error}`, detail: error });

        //     });

        // this.blockUI.stop();

        // //Documento
        // if (voucher.feDetRequest.docNro != null) {
        //     this.datosvoucher.docCliente = voucher.feDetRequest.docNro;
        // }
        // else {
        //     this.datosvoucher.docCliente = '';
        // }

        // //Tipo documento
        // if (voucher.feDetRequest.docTipo != null) {
        //     this.datosvoucher.docTipoCliente = this.obtenerTipoDoc(voucher.feDetRequest.docTipo);
        // }
        // else {
        //     this.datosvoucher.docTipoCliente = '';
        // }

        // //Numero voucher
        // if (voucher.feDetRequest.numeroInterno != null) {
        //     this.datosvoucher.nrovoucher = voucher.feDetRequest.numeroInterno;
        // }
        // else {
        //     this.datosvoucher.nrovoucher = '';
        // }

        // //CAE
        // if (voucher.cae != null) {
        //     this.datosvoucher.cae = voucher.cae;
        // }
        // else {
        //     this.datosvoucher.cae = '';
        // }

        // //Vencimiento CAE
        // if (voucher.fechaVencimientoCae != null) {
        //     this.datosvoucher.vencimientoCAE = voucher.fechaVencimientoCae;
        // }
        // else {
        //     this.datosvoucher.vencimientoCAE = '';
        // }

        // //ESTADO
        // if (voucher.estado != null) {
        //     this.datosvoucher.estado = voucher.estado;
        // }
        // else {
        //     this.datosvoucher.estado = '';
        // }

        // //Tipo voucher
        // if (voucher.feCabReq.cbteTipo != null) {
        //     this.datosvoucher.tipo = this.obtenerTipovoucher(voucher.feCabReq.cbteTipo);
        // }
        // else {
        //     this.datosvoucher.tipo = '';
        // }

        // //Punto de venta
        // if (voucher.feCabReq.puntoVentaInterno != null) {
        //     this.datosvoucher.puntoVenta = voucher.feCabReq.puntoVentaInterno;
        // }
        // else {
        //     this.datosvoucher.puntoVenta = '';
        // }

        // //Fecha de emision
        // if (voucher.feDetRequest.cbteFch != null) {
        //     this.datosvoucher.fechaEmision = this.formatearFecha(voucher.feDetRequest.cbteFch);
        // }
        // else {
        //     this.datosvoucher.fechaEmision = '';
        // }

        // //Fecha de vencimiento pago
        // if (voucher.feDetRequest.fchVtoPago != null) {
        //     this.datosvoucher.fechaVencimientoPago = this.formatearFecha(voucher.feDetRequest.fchVtoPago);
        // }
        // else {
        //     this.datosvoucher.fechaVencimientoPago = '';
        // }

        // //Servicio desde
        // if (voucher.feDetRequest.fchServDesde != null) {
        //     this.datosvoucher.desde = this.formatearFecha(voucher.feDetRequest.fchServDesde);
        // }
        // else {
        //     this.datosvoucher.desde = '';
        // }

        // //Servicio hasta
        // if (voucher.feDetRequest.fchServHasta != null) {
        //     this.datosvoucher.hasta = this.formatearFecha(voucher.feDetRequest.fchServHasta);
        // }
        // else {
        //     this.datosvoucher.hasta = '';
        // }

        // //Concepto
        // if (voucher.feDetRequest.concepto != null) {
        //     this.datosvoucher.concepto = this.obtenerConcepto(voucher.feDetRequest.concepto);
        // }
        // else {
        //     this.datosvoucher.concepto = '';
        // }

        // //Importe total
        // if (voucher.feDetRequest.impTotal != null) {
        //     this.datosvoucher.impTotal = this.obtenerMoneda(voucher.feDetRequest.monId) 
        //                                     + voucher.feDetRequest.impTotal;
        // }
        // else {
        //     this.datosvoucher.impTotal = '';
        // }

        // //Importe excento
        // if (voucher.feDetRequest.ImpOpEx != null) {
        //     this.datosvoucher.impExcento = this.obtenerMoneda(voucher.feDetRequest.monId) 
        //                                     + voucher.feDetRequest.ImpOpEx;
        // }
        // else {
        //     this.datosvoucher.impExcento = '';
        // }

        // //Importe tributos
        // if (voucher.feDetRequest.impTrib != null) {
        //     this.datosvoucher.impTrib = this.obtenerMoneda(voucher.feDetRequest.monId) 
        //                                     + voucher.feDetRequest.impTrib;
        // }
        // else {
        //     this.datosvoucher.impTrib = '';
        // }

        // //Importe IVA
        // if (voucher.feDetRequest.impIVA != null) {
        //     this.datosvoucher.iva = this.obtenerMoneda(voucher.feDetRequest.monId) 
        //                                     + voucher.feDetRequest.impIVA;
        // }
        // else {
        //     this.datosvoucher.iva = '';
        // }

        // //Importe neto gravado
        // if (voucher.feDetRequest.impNeto != null) {
        //     this.datosvoucher.impNetoGravado = this.obtenerMoneda(voucher.feDetRequest.monId) 
        //                                         + voucher.feDetRequest.impNeto;
        // }
        // else {
        //     this.datosvoucher.impNetoGravado = '';
        // }

        // //Importe neto no gravado
        // if (voucher.feDetRequest.impTotConc != null) {
        //     this.datosvoucher.impNetoNoGravado = this.obtenerMoneda(voucher.feDetRequest.monId) 
        //                                             + voucher.feDetRequest.impTotConc;
        // }
        // else {
        //     this.datosvoucher.impNetoNoGravado = '';
        // }

        // this.voucher = voucher;
    }
}
