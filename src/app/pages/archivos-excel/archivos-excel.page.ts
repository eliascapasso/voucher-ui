import { Component, OnInit } from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    Validators
} from '@angular/forms';
import { EmailoService } from '../../service/email/email.service';
import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';
import { ArchivoExcel } from 'src/app/domain/archivo-excel.model';
import { ArchivoExcelService } from 'src/app/service/archivo-excel/archivo-excel.service';

@Component({
    selector: 'app-archivos-excel',
    templateUrl: './archivos-excel.page.html',
    styleUrls: ['./archivos-excel.page.scss']

})
export class ArchivosExcelPage implements OnInit {
    public permisosABM: boolean = false;
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
    public isNew: boolean;
    private suscriptionUser: Subscription;

    loading = false;
    @BlockUI() blockUI: NgBlockUI;
    constructor(
        private archivoExcelService: ArchivoExcelService,
        private formBuilder: FormBuilder,
        public router: Router,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.filter = { name: '', estado: '' };

        this.columnas = [
            { field: 'nombre', header: 'Nombre' }
        ];

        this.archivoExcelForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            estado: [''],
        });

        this.estados.push({ label: 'Todos los Estados', value: '' });
        this.estados.push({ label: 'Activo', value: 'ACTIVO' });
        this.estados.push({ label: 'Inactivo', value: 'INACTIVO' });

        this.isNew = false;
        this.nuevoArchivoExcel = {};
    }

    ngOnDestroy () { 
        this.suscriptionUser.unsubscribe();
    }

    getArchivosExcel() {
        this.blockUI.start("Cargando archivos excel...");
        this.loading = true;
        this.archivoExcelService.getArchivosExcel().then(archExcel => {
            this.loading = false;
            this.blockUI.stop();

            if (archExcel.length < 1) {
                this.showTabla = false;
            } else {
                this.archivosExcelOriginal = archExcel;;
                this.archivosExcel = archExcel;
                this.showTabla = true;
            }
        })
            .catch(function (error) {
                this.loading = false;
                this.blockUI.stop();
                console.log(`error al obtener los archivos excel ${error}`);
                this.formMsgs = [];
                this.formMsgs.push({ severity: 'error', summary: `Error al obtener los archivos excel ${error}`, detail: error });
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
                    this.msgs.push({ severity: 'info', summary: `Archivo excel guardado con exito`, detail: `Archivo excel guardado` });
                    this.displayArchivoExcelModal = false;
                    this.getArchivosExcel();
                },
                    error => {
                        let msj = (error.message) ? error.message : '';
                        let cause = (error.cause) ? error.cause : '';
                        this.blockUI.stop();
                        console.log(`error al guardar archivo excel ${error}`);
                        this.formMsgs = [];
                        this.formMsgs.push({ severity: 'error', summary: `Error al guardar el archivo excel ${msj}`, detail: cause });
                    });
        }
    }

    actualizarArchivoExcel(elimina) {

        if (!this.archivoExcelForm.valid && !elimina) {
            this.formMsgs = [];
            this.formMsgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
        }
        else {
            console.log(this.nuevoArchivoExcel);
            this.blockUI.start('Guardando Archivo excel...');
            this.archivoExcelService.update(this.nuevoArchivoExcel)
                .subscribe((ArchExcel: any) => {
                    this.blockUI.stop();
                    console.log('Archivo excel modificado');
                    this.msgs = [];
                    this.msgs.push({ severity: 'info', summary: `Archivo excel modificado con exito`, detail: `Archivo excel modificado` });
                    this.displayArchivoExcelModal = false;
                    this.getArchivosExcel();
                },
                    error => {
                        let msj = (error.message) ? error.message : '';
                        let cause = (error.cause) ? error.cause : '';
                        this.blockUI.stop();
                        console.log(`error al modificar archivo excel ${error}`);
                        this.formMsgs = [];
                        this.formMsgs.push({ severity: 'error', summary: `Error al modificar el archivo excel ${msj}`, detail: cause });
                    });
        }
    }

    confirmEstado(mensaje) {
        this.confirmationService.confirm({
            message: mensaje,
            acceptLabel: 'Confirmar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.actualizarArchivoExcel(true);
            },
            reject: () => {

            }
        });
    }

    showNuevoArchivoExcelModal() {
        this.nuevoArchivoExcel = {};
        this.isNew = true;
        this.archivoExcelForm.get('nombre').setValue('');
        this.displayArchivoExcelModal = true;
    }

    showEditarArchivoExcelModal(archivoExcel) {
        this.nuevoArchivoExcel._id = null;
        this.isNew = false;
        this.nuevoArchivoExcel = archivoExcel;
        this.archivoExcelForm.get('nombre').setValue(this.nuevoArchivoExcel.nombre);
        this.displayArchivoExcelModal = true;
    }

    changeFilterHandler(event) {
        this.archivosExcel = this.archivosExcelOriginal
            .filter(archivoExcel => {
                if (this.filter['estado'] != '' && this.filter['estado'].toUpperCase() != 'TODOS LOS ESTADOS') {
                    let enabled = (this.filter['estado'].toUpperCase() == 'ACTIVO');
                    if (archivoExcel.estado == enabled) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            });

        if (this.archivosExcel.length == 0) {
            this.showTabla = false;
        } else {
            this.showTabla = true;
        }
    }

    handleChange(event, archivoExcel) {
        this.nuevoArchivoExcel = archivoExcel;
        this.nuevoArchivoExcel.estado = event.checked;
        if (!event.checked) {
            this.confirmEstado("¿Seguro que desea deshabilitar el archivo excel?");
        } else {
            this.confirmEstado("¿Seguro que desea habilitar el archivo excel?");
        }
    }
}
