import { Component, OnInit } from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    Validators
} from '@angular/forms';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { EmailoService } from '../../service/email/email.service';
import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Usuario } from '../../domain/usuario.model';
import { EmailModel } from '../../domain/email.model';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.page.html',
    styleUrls: ['./usuarios.page.scss']

})
export class UsuariosPage implements OnInit {
    public columnas: any[];
    public usuarios: Usuario[];
    public usuariosOriginal: Usuario[];
    public nuevoUsuario: Usuario;
    public showTabla: boolean = false
    public usuarioForm: FormGroup;
    public msgs: Message[];
    public formMsgs: Message[];
    public displayUsuarioModal: boolean = false;
    public roles: any[] = [];
    public rolSeleccionado: string;
    public statusSeleccionado: string;
    public estados: any[] = [];
    public filter = { name: '', estado: '' };
    public busqueda: string = '';
    public isNew: boolean;

    loading = false;
    @BlockUI() blockUI: NgBlockUI;
    constructor(
        private usuarioService: UsuarioService,
        private emailService: EmailoService,
        private formBuilder: FormBuilder,
        public router: Router,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.filter = { name: '', estado: '' };

        this.columnas = [
            { field: 'firstName', header: 'Nombre' },
            { field: 'lastName', header: 'Apellido' },
            { field: 'email', header: 'Email' },
            { field: 'roles', header: 'Rol' }
        ];

        this.usuarioForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            email: ['', Validators.required],
            rol: ['', Validators.required],
            enabled: [''],
        });

        this.isNew = false;
        this.nuevoUsuario = {};
        //this.getUsuarios();
        this.roles.push({ label: 'Rol Usuario', value: 'ROLE_USER' });
        this.roles.push({ label: 'Rol Admin', value: 'ROLE_ADMIN' });
        this.estados.push({ label: 'Todos los Estados', value: '' });
        this.estados.push({ label: 'Activo', value: 'ACTIVO' });
        this.estados.push({ label: 'Inactivo', value: 'INACTIVO' });
    }

    getUsuarios() {
        this.blockUI.start("Cargando Usuarios...");
        this.loading = true;
        this.usuarioService.getUsuarios().then(usuarios => {
            this.loading = false;
            this.blockUI.stop();

            if (usuarios.length < 1) {
                this.showTabla = false;
            } else {
                this.usuariosOriginal = usuarios;
                this.usuarios = this.usuariosOriginal;
                this.showTabla = true;
            }
        })
            .catch(function (error) {
                this.loading = false;
                this.blockUI.stop();
                console.log(`error al obtener los puntos de venta ${error}`);
                this.formMsgs = [];
                this.formMsgs.push({ severity: 'error', summary: `Error al obtener los puntos de venta ${error}`, detail: error });
            });
    }

    handleChange(event, usuario) {
        if (usuario.enabled) {
            this.confirmDelete(usuario);
        } else {
            this.confirmUpdate('¿Está seguro que desea habilitar el usuario?', usuario);
        }
    }

    confirmDelete(usuario) {
        this.confirmationService.confirm({
            message: '¿Está seguro que desea deshabilitar el usuario?',
            acceptLabel: 'Confirmar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.usuarioService.delete(usuario)
                    .subscribe((usuario: any) => {
                        console.log('usuario deshabilitado');
                        this.msgs = [];
                        this.msgs.push({ severity: 'info', summary: `Usuario deshabilitado`, detail: `Usuario deshabilitado` });
                        this.getUsuarios();
                    },
                        error => {
                            console.log(`error al deshabilitar el usuario ${error}`);
                            this.msgs = [];
                            this.msgs.push({ severity: 'error', summary: `error al deshabilitar el usuario ${error}`, detail: error });
                        });
            },
            reject: () => {
                usuario.enabled = true;
            }
        });
    }

    confirmUpdate(mensaje: string, usuario: Usuario) {
        this.confirmationService.confirm({
            message: mensaje,
            acceptLabel: 'Confirmar',
            rejectLabel: 'Cancelar',
            accept: () => {
                usuario.enabled = true;
                this.usuarioService.update(usuario)
                    .subscribe((usuario: any) => {
                        console.log('usuario actualizado');
                        this.msgs = [];
                        this.msgs.push({ severity: 'info', summary: `Usuario actualizado`, detail: `Usuario actualizado` });
                        this.getUsuarios();
                    },
                        error => {
                            console.log(`error al actualizar el usuario ${error}`);
                            this.msgs = [];
                            this.msgs.push({ severity: 'error', summary: `error al actualizar el usuario ${error}`, detail: error });
                        });
            }
        });
    }

    showNuevoUsuarioModal() {
        this.isNew = true;
        this.nuevoUsuario = {};
        this.rolSeleccionado = '';
        this.usuarioForm.get('nombre').setValue('');
        this.usuarioForm.get('apellido').setValue('');
        this.usuarioForm.get('email').setValue('');
        this.usuarioForm.get('rol').setValue('');
        this.usuarioForm.get('enabled').setValue(false);
        this.usuarioForm.controls['email'].enable();
        this.displayUsuarioModal = true;
    }

    showEditarUsuarioModal(usuario) {
        this.isNew = false;
        this.nuevoUsuario = usuario;
        this.usuarioForm.get('nombre').setValue(this.nuevoUsuario.firstName);
        this.usuarioForm.get('apellido').setValue(this.nuevoUsuario.lastName);
        this.usuarioForm.get('email').setValue(this.nuevoUsuario.email);
        this.usuarioForm.get('rol').setValue(this.nuevoUsuario.roles[0]);
        this.usuarioForm.get('enabled').setValue(this.nuevoUsuario.enabled);
        this.usuarioForm.controls['usuario'].disable();
        this.usuarioForm.controls['email'].disable();
        this.displayUsuarioModal = true;
    }

    sendActivationEmail(usuario: Usuario) {
        const emailModel = new EmailModel();
        emailModel.to = usuario.email;
        emailModel.subject = 'Activacion de Cuenta';
        emailModel.template = 'setear_password.jrxml';
        emailModel.data = JSON.stringify({
            nombre: usuario.firstName + ' ' + usuario.lastName,
            email: usuario.email,
            pagina: 'Gestion Voucher',
            link: 'http://localhost:8100'
        });
        this.emailService.sendEmail(emailModel).subscribe((usuario: any) => {
            console.log('usuario notificado');
        },
            error => {
                console.log(`error al enviar email ${error}`);
            });
    }

    guardarUsuario() {
        this.nuevoUsuario.username = "";

        if (!this.usuarioForm.valid) {
            this.formMsgs = [];
            this.formMsgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
        } else {
            this.blockUI.start('Guardando Usuario...');
            if (this.nuevoUsuario.id == null) {
                this.nuevoUsuario.roles = [];
                this.nuevoUsuario.roles.push(this.rolSeleccionado);
                this.nuevoUsuario.password = '123456';
                this.usuarioService.save(this.nuevoUsuario)
                    .subscribe((usuario: any) => {
                        this.blockUI.stop();
                        console.log('usuario guardado');
                        this.msgs = [];
                        this.msgs.push({ severity: 'info', summary: `Usuario guardado con exito`, detail: `Usuario guardado` });
                        this.displayUsuarioModal = false;
                        this.sendActivationEmail(this.nuevoUsuario);
                        this.getUsuarios();
                    },
                        error => {
                            let msj = (error.message) ? error.message : '';
                            let cause = (error.cause) ? error.cause : '';
                            this.blockUI.stop();
                            console.log(`error al guardar usuario ${error}`);
                            this.formMsgs = [];
                            this.formMsgs.push({ severity: 'error', summary: `Error al guardar el usuario ${msj}`, detail: cause });
                        });
            } else {
                this.confirmUpdate('¿Está seguro que desea actualizar el usuario?', this.nuevoUsuario);
            }

        }
    }

    changeFilterHandler(event) {
        this.usuarios = this.usuariosOriginal
            .filter(user => {
                if (this.filter['estado'] != '' && this.filter['estado'].toUpperCase() != 'TODOS LOS ESTADOS') {
                    let enabled = (this.filter['estado'].toUpperCase() == 'ACTIVO');
                    if (user.enabled == enabled) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            }).filter(user => {
                if (this.busqueda != '') {
                    if (user.email && user.email.toLowerCase().includes(this.busqueda.toLowerCase())) {
                        return true;
                    } else if (user.firstName && user.firstName.toLowerCase().includes(this.busqueda.toLowerCase())) {
                        return true;
                    } else if (user.lastName && user.lastName.toLowerCase().includes(this.busqueda.toLowerCase())) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            });

        if (this.usuarios.length == 0) {
            this.showTabla = false;
        } else {
            this.showTabla = true;
        }
    }
}
