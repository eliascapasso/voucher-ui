import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    FormGroup,
    FormBuilder
} from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, Message } from 'primeng/api';
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
    public vouchers = [] as Voucher[];
    public vouchersOriginal: Voucher[] = [];
    public nuevoVoucher = {} as Voucher;
    public datosVoucher = {} as Voucher;
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
    public totalRecords: number = 0;
    public ROWS = 3;

    @BlockUI() blockUI: NgBlockUI;
    constructor(
        private voucherService: VoucherService,
        private formBuilder: FormBuilder,
        public router: Router,
        private confirmationService: ConfirmationService,
        public toastController: ToastController,
        private cdref: ChangeDetectorRef
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
            { field: 'estado', header: 'Estado' },
            { field: 'empresa', header: 'Empresa' },
        ];

        this.voucherForm = this.formBuilder.group({
            estado: ['']
        });

        this.estados.push({ label: 'TODOS', value: '' });
        this.estados.push({ label: 'UTILIZADO (U)', value: 'U' });
        this.estados.push({ label: 'NO DISPONIBLE (ND)', value: 'ND' });
        this.estados.push({ label: 'EMITIDO (E)', value: 'E' });
        this.estados.push({ label: 'ELIMINADO (EL)', value: 'EL' });
        this.estados.push({ label: 'VENCIDO (V)', value: 'V' });
        this.estados.push({ label: 'A FACTURAR (AF)', value: 'AF' });
        this.nuevoVoucher = {};

        this.getVouchers({});
    }

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    selectFechaDesde() {
        this.filter.desde = this.fechaDesde.toISOString().replace("/", "-").replace("/", "-").substr(0, 10);
    }

    selectFechaHasta() {
        this.filter.hasta = this.fechaHasta.toISOString().replace("/", "-").replace("/", "-").substr(0, 10);
    }

    getVouchers(event: LazyLoadEvent) {
        var $this = this;
        this.nuevoVoucher = {};
        $this.vouchers = [];

        let size = event.rows != undefined ? event.rows : this.ROWS;
        let page = event.first != undefined ? event.first / event.rows : 0;

        $this.blockUI.start("Cargando vouchers...");
        $this.voucherService.getVouchersFiltro(this.filter['estado'], size, page).then(vouchers => {
            $this.blockUI.stop();

            $this.totalRecords = vouchers.totalItems;

            if ($this.totalRecords < 1) {
                $this.showTabla = false;
            } else {
                $this.vouchersOriginal = vouchers.estados;
                $this.vouchers = vouchers.estados;
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
                    this.getVouchers({});
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
                    .subscribe((voucher: any) => {
                        console.log('voucher eliminado');
                        this.msgs = [];
                        this.msgs.push({ severity: 'info', summary: `Voucher eliminado`, detail: `Voucher eliminado` });
                        this.getVouchers({});
                    },
                        error => {
                            console.error(`error al eliminar el voucher ${error}`);
                            this.msgs = [];
                            this.msgs.push({ severity: 'error', summary: `error al eliminar el voucher ${error}`, detail: error });
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

    public limpiarFiltros() {
        this.fechaDesde = null;
        this.fechaHasta = null;
        this.filter = { name: '', estado: '', desde: '', hasta: '' };
        this.busqueda = "";
        this.getVouchers({});
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

    showVoucher(voucher: Voucher) {
        this.displayVoucherModal = true;

        //nombre y apellido
        if (voucher.nombreApellido != null) {
            this.datosVoucher.nombreApellido = voucher.nombreApellido;
        }
        else {
            this.datosVoucher.nombreApellido = '';
        }

        //empresa
        if (voucher.empresa != null) {
            this.datosVoucher.empresa = voucher.empresa;
        }
        else {
            this.datosVoucher.empresa = '';
        }

        //desde
        if (voucher.fechaDesde != null) {
            this.datosVoucher.fechaDesde = voucher.fechaDesde;
        }

        //hasta
        if (voucher.fechaHasta != null) {
            this.datosVoucher.fechaHasta = voucher.fechaHasta;
        }

        //codigo voucher
        if (voucher.codigoVoucher != null) {
            this.datosVoucher.codigoVoucher = voucher.codigoVoucher;
        }
        else {
            this.datosVoucher.codigoVoucher = '';
        }

        //copia
        if (voucher.idCopia != null) {
            this.datosVoucher.idCopia = voucher.idCopia;
        }
        else {
            this.datosVoucher.idCopia = '0';
        }

        //valor
        if (voucher.valor != null) {
            this.datosVoucher.valor = voucher.valor;
        }
        else {
            this.datosVoucher.valor = 0;
        }

        //estado
        if (voucher.estado != null) {
            this.datosVoucher.estado = voucher.estado;
        }
        else {
            this.datosVoucher.estado = "";
        }

        //estados pasados
        if (voucher.estadosPasados != null) {
            this.datosVoucher.estadosPasados = voucher.estadosPasados;
        }
        else {
            this.datosVoucher.estadosPasados = "";
        }

        //dni
        if (voucher.dni != null) {
            this.datosVoucher.dni = voucher.dni;
        }
        else {
            this.datosVoucher.dni = "";
        }

        //factura asociada
        if (voucher.facturaAsociada != null) {
            this.datosVoucher.facturaAsociada = voucher.facturaAsociada;
        }
        else {
            this.datosVoucher.facturaAsociada = "Sin factura asociada";
        }

        //observaciones
        if (voucher.observacion != null) {
            this.datosVoucher.observacion = voucher.observacion;
        }
        else {
            this.datosVoucher.observacion = "Sin observaciones";
        }
    }
}
