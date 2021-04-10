import { Component, OnInit } from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';
import { Voucher } from 'src/app/domain/voucher.model';
import { ToastController } from '@ionic/angular';
import { VoucherService } from 'src/app/service/voucher/voucher.service';

@Component({
    selector: 'app-voucher-emitido',
    templateUrl: './voucher-emitido.page.html',
    styleUrls: ['./voucher-emitido.page.scss']

})
export class VoucherEmitidoPage implements OnInit {
    public columnas: any[];
    public vouchers: Voucher[] = [];
    public vouchersOriginal: Voucher[] = [];
    public nuevoVoucher: Voucher = {};
    public showTabla: boolean = false
    public voucherForm: FormGroup;
    public msgs: Message[];
    public formMsgs: Message[];
    public displayVoucherEmitidoModal: boolean = false;
    public estados: any[] = [];
    public filter = { name: '', estado: '', desde: '', hasta: '' };
    public busqueda: string = '';
    private suscriptionUser: Subscription;
    public es: any;
    public fechaDesde: Date;
    public fechaHasta: Date;
    
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

        this.getVouchersEmitidos();
    }

    ngOnDestroy () { 
        this.suscriptionUser.unsubscribe();
    }

    selectFechaDesde() {
        this.filter.desde = this.fechaDesde.toISOString().replace("/", "-").replace("/", "-").substr(0, 10);
    }

    selectFechaHasta() {
        this.filter.hasta = this.fechaHasta.toISOString().replace("/", "-").replace("/", "-").substr(0, 10);
    }

    getVouchersEmitidos() {
        var $this = this;
        this.nuevoVoucher = {};
        $this.vouchers = [];

        $this.voucherService.getVouchersEmitidos().then(vouchers => {
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
                    this.displayVoucherEmitidoModal = false;
                    this.getVouchersEmitidos();
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
                            this.getVouchersEmitidos();
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
        this.getVouchersEmitidos();
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
}
