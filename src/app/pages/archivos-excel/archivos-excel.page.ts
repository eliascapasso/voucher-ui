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
import { ArchivoExcel } from 'src/app/domain/archivo-excel.model';
import { ArchivoExcelService } from 'src/app/service/archivo-excel/archivo-excel.service';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-archivos-excel',
    templateUrl: './archivos-excel.page.html',
    styleUrls: ['./archivos-excel.page.scss']

})
export class ArchivosExcelPage implements OnInit {
    public columnas: any[];
    public archivosExcel: ArchivoExcel[] = [];
    public archivosExcelOriginal: ArchivoExcel[] = [];
    public nuevoArchivoExcel: ArchivoExcel = {};
    public showTabla: boolean = false
    public archivoExcelForm: FormGroup;
    public msgs: Message[];
    public formMsgs: Message[];
    public displayArchivoExcelModal: boolean = false;
    public estados: any[] = [];
    public filter = { name: '', estado: '' };
    public busqueda: string = '';
    public es: any;
    public fecha: Date;
    
    @BlockUI() blockUI: NgBlockUI;
    constructor(
        private archivoExcelService: ArchivoExcelService,
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
        };

        this.filter = { name: '', estado: '' };

        this.columnas = [
            { field: 'responsable', header: 'Responsable' },
            { field: 'nombreExcel', header: 'Nombre' },
            { field: 'fecha', header: 'Fecha', fecha: true },
            { field: 'cantidadRegistros', header: 'Registros' },
            { field: 'estado', header: 'Estado' },
        ];

        this.archivoExcelForm = this.formBuilder.group({
            archivo: ['', Validators.required]
        });

        this.estados.push({ label: 'TODOS', value: '' });
        this.estados.push({ label: 'DISPONIBLE', value: 'DISPONIBLE' });
        this.estados.push({ label: 'IMPORTANDO', value: 'IMPORTANDO' });
        this.estados.push({ label: 'CANCELADO', value: 'CANCELADO' });

        this.nuevoArchivoExcel = {};

        this.getArchivosExcel();
    }

    get permisoAltaBaja(): boolean {
        return localStorage.getItem('rol') == "ADMIN"
            || localStorage.getItem('rol') == "ROOT"
            || localStorage.getItem('rol') == "OPERATIVO_EMPRESA";
    }

    getArchivosExcel() {
        var $this = this;
        $this.nuevoArchivoExcel = {};
        $this.archivosExcel = [];

        $this.blockUI.start("Cargando archivos excel...");
        $this.archivoExcelService.getArchivosExcel().then(archExcel => {
            $this.blockUI.stop();

            if (archExcel.length < 1) {
                $this.showTabla = false;
            } else {
                $this.archivosExcelOriginal = archExcel;;
                $this.archivosExcel = archExcel;
                $this.showTabla = true;
            }
        })
            .catch(function (error) {
                $this.blockUI.stop();
                console.error(`error al obtener los archivos excel ${error}`);
                $this.formMsgs = [];
                $this.formMsgs.push({ severity: 'error', summary: `Error al obtener los archivos excel ${error}`, detail: error });
            });
    }

    guardarArchivoExcel() {

        if (!this.archivoExcelForm.valid) {
            this.formMsgs = [];
            this.formMsgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
        } else {

            this.blockUI.start('Guardando archivo excel...');
            this.archivoExcelService.save(this.nuevoArchivoExcel)
                .subscribe((archExcel: any) => {
                    this.blockUI.stop();
                    console.log('archivo excel guardado');
                    this.msgs = [];
                    this.msgs.push({ severity: 'success', summary: `Archivo excel guardado con exito`, detail: `Archivo excel guardado` });
                    this.displayArchivoExcelModal = false;
                    this.getArchivosExcel();
                },
                    error => {
                        let msj = (error.message) ? error.message : '';
                        let cause = (error.cause) ? error.cause : '';
                        this.blockUI.stop();
                        console.error(`error al guardar archivo excel ${error}`);
                        this.formMsgs = [];
                        this.formMsgs.push({ severity: 'error', summary: `Error al guardar el archivo excel ${msj}`, detail: cause });
                    });
        }
    }

    confirmDelete(archivo) {
        this.confirmationService.confirm({
            message: '¿Esta seguro que desea eliminar el archivo?',
            acceptLabel: 'Confirmar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.archivoExcelService.delete(archivo)
                    .subscribe( (archivoExcel: any) => {
                            console.log('archivo excel eliminado');
                            this.msgs = [];
                            this.msgs.push({severity: 'success', summary: `Archivo excel eliminado`, detail: `Archivo excel eliminado`});
                            this.getArchivosExcel();
                        },
                        error => {
                            console.error(`error al eliminar el archivo excel ${error}`);
                            this.msgs = [];
                            this.msgs.push({severity: 'error', summary: `error al eliminar el archivo excel ${error}`, detail: error});
                        });
            }
        });
    }

    showNuevoArchivoExcelModal() {
        this.nuevoArchivoExcel = {};
        this.displayArchivoExcelModal = true;
    }

    public validar(archivo){
        this.nuevoArchivoExcel.archivo = archivo.srcElement.files[0];
        let ext = this.nuevoArchivoExcel.archivo.name.toString().split('.').pop();
        
        if(ext != "xlsx" && ext != "xls"){
            console.error("Archivo invalido");
            this.nuevoArchivoExcel.archivo = null;
            this.presentToast("Archivo inválido");
        }
    }

    public formatearFecha(d): string {
        let date = new Date(d);
        
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        return day + "-" + month + "-" + year;
    }

    public limpiarFiltros(){
        this.fecha = null;
        this.filter.estado = "";
        this.busqueda = "";
        this.getArchivosExcel();
    }

    async presentToast(msj: string) {
        const toast = await this.toastController.create({
          message: msj,
          duration: 2000
        });
        toast.present();
      }

    changeFilterHandler(event) {
        
        this.archivosExcel = this.archivosExcelOriginal
            .filter(archivoExcel => {
                if (this.filter['estado'] != '' && this.filter['estado'].toUpperCase() != 'TODOS') {
                    if (archivoExcel.estado == this.filter['estado'].toUpperCase()) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            }).filter(archivoExcel => {
                if (this.busqueda != '') {
                    return archivoExcel.nombreExcel && archivoExcel.nombreExcel.toLowerCase().includes(this.busqueda.toLowerCase());
                }
                return true;
            }).filter(archivoExcel => {
                if (this.busqueda != '') {
                    return archivoExcel.responsable && archivoExcel.responsable.toLowerCase().includes(this.busqueda.toLowerCase());
                }
                return true;
            }).filter(archivoExcel => {
                if(this.fecha){
                    return archivoExcel.fecha && this.formatearFecha(archivoExcel.fecha).toLowerCase().includes(this.formatearFecha(this.fecha).toLowerCase());
                }

                return true;
            });

        if (this.archivosExcel.length == 0) {
            this.showTabla = false;
        } else {
            this.showTabla = true;
        }
    }

    cerrarModal(){
        this.getArchivosExcel();
        this.displayArchivoExcelModal=false
    }
}
