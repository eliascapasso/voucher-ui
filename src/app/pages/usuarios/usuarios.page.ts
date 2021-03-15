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
import { RowOutlet } from '@angular/cdk/table';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.page.html',
    styleUrls: ['./usuarios.page.scss']

})
export class UsuariosPage implements OnInit {
    public permisosAlta: boolean = false;
    public columnas: any[];
    public usuarioActual: Usuario;
    public usuarios: Usuario[] = [];
    public usuariosOriginal: Usuario[] = [];
    public nuevoUsuario: Usuario = {};
    public showTabla: boolean = false
    public usuarioForm: FormGroup;
    public msgs: Message[];
    public formMsgs: Message[];
    public displayUsuarioModal: boolean = false;
    public estados: any[] = [];
    public filter = { name: '', estado: '' };
    public busqueda: string = '';
    public isNew: boolean;
    public roles: any[] = [];
    public rolesSelect: any[] = [];
    public rolSeleccionado: string;
    public empresas: any[] = [];
    public empresasSelect: any[] = [];
    public empresaSeleccionada: string;
    private suscriptionUser: Subscription;

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
            { field: 'nombre', header: 'Nombre' },
            { field: 'apellido', header: 'Apellido' },
            { field: 'email', header: 'Email' },
            { field: 'empresa', header: 'Empresa', empresa: true },
            { field: 'role', header: 'Rol', role: true }
        ];

        this.usuarioForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            email: ['', Validators.required],
            empresa: ['', Validators.required],
            role: ['', Validators.required],
            estado: [''],
        });

        this.estados.push({ label: 'Todos los Estados', value: '' });
        this.estados.push({ label: 'Activo', value: 'ACTIVO' });
        this.estados.push({ label: 'Inactivo', value: 'INACTIVO' });

        this.isNew = false;
        this.nuevoUsuario = {};

        this.getUsuarioActual();
    }

    ngOnDestroy () { 
        this.suscriptionUser.unsubscribe();
    }

    setPermisos() {
        this.permisosAlta = this.usuarioActual.role.role == "ROOT" || this.usuarioActual.role.role == "ADMIN";
    }

    getUsuarioActual() {
        this.suscriptionUser = this.usuarioService.getUserMe().subscribe(usuario => {
            this.usuarioActual = usuario;
            this.setPermisos();
            this.getUsuarios();
            this.getRoles();
            this.getEmpresas();
            console.log(this.usuarioActual);
            console.log(this.permisosAlta);
        });
    }

    getEmpresas() {
        this.usuarioService.getEmpresas().then(empresas => {

            this.empresas = empresas;

            for (let i = 0; i < empresas.length; i++) {
                this.empresasSelect.push({ label: empresas[i].empresa, value: empresas[i]._id });
            }
        })
            .catch(function (error) {
                console.log(`error al obtener las empresas ${error}`);
                this.formMsgs = [];
                this.formMsgs.push({ severity: 'error', summary: `Error al obtener las empresas ${error}`, detail: error });
            });
    }

    getRoles() {
        this.usuarioService.getRoles().then(roles => {

            for (let i = 0; i < roles.length; i++) {
                this.rolesSelect.push({ label: roles[i].role, value: roles[i]._id });
            }

            this.roles = roles;

        })
            .catch(function (error) {
                console.log(`error al obtener los roles de usuario ${error}`);
                this.formMsgs = [];
                this.formMsgs.push({ severity: 'error', summary: `Error al obtener los roles de usuario ${error}`, detail: error });
            });
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
                this.usuariosOriginal = usuarios;;
                this.usuarios = usuarios;
                this.showTabla = true;
            }
        })
            .catch(function (error) {
                this.loading = false;
                this.blockUI.stop();
                console.log(`error al obtener los usuarios ${error}`);
                this.formMsgs = [];
                this.formMsgs.push({ severity: 'error', summary: `Error al obtener los usuarios ${error}`, detail: error });
            });
    }

    guardarUsuario() {

        if (!this.usuarioForm.valid) {
            this.formMsgs = [];
            this.formMsgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
        } else {
            this.nuevoUsuario.role = this.roles.find(x => x._id == this.rolSeleccionado);
            this.nuevoUsuario.empresa = this.empresas.find(x => x._id == this.empresaSeleccionada);

            this.nuevoUsuario.password = '123456';

            this.blockUI.start('Guardando Usuario...');
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
        }
    }

    actualizarUsuario(elimina) {

        if (!this.usuarioForm.valid && !elimina) {
            this.formMsgs = [];
            this.formMsgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
        }
        else {
            if (!elimina) {
                this.nuevoUsuario.role = this.roles.find(x => x._id == this.rolSeleccionado);
                this.nuevoUsuario.empresa = this.empresas.find(x => x._id == this.empresaSeleccionada);
            }

            console.log(this.nuevoUsuario);
            this.blockUI.start('Guardando Usuario...');
            this.usuarioService.update(this.nuevoUsuario)
                .subscribe((usuario: any) => {
                    this.blockUI.stop();
                    console.log('usuario modificado');
                    this.msgs = [];
                    this.msgs.push({ severity: 'info', summary: `Usuario modificado con exito`, detail: `Usuario modificado` });
                    this.displayUsuarioModal = false;
                    this.getUsuarios();
                },
                    error => {
                        let msj = (error.message) ? error.message : '';
                        let cause = (error.cause) ? error.cause : '';
                        this.blockUI.stop();
                        console.log(`error al modificar usuario ${error}`);
                        this.formMsgs = [];
                        this.formMsgs.push({ severity: 'error', summary: `Error al modificar el usuario ${msj}`, detail: cause });
                    });
        }
    }

    confirmEstado(mensaje) {
        this.confirmationService.confirm({
            message: mensaje,
            acceptLabel: 'Confirmar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.actualizarUsuario(true);
            },
            reject: () => {

            }
        });
    }

    showNuevoUsuarioModal() {
        this.nuevoUsuario = {};
        this.isNew = true;
        this.rolSeleccionado = '';
        this.usuarioForm.get('nombre').setValue('');
        this.usuarioForm.get('apellido').setValue('');
        this.usuarioForm.get('email').setValue('');
        this.usuarioForm.get('role').setValue('');
        this.usuarioForm.get('estado').setValue(true);
        this.usuarioForm.controls['email'].enable();
        this.displayUsuarioModal = true;
    }

    showEditarUsuarioModal(usuario) {
        this.nuevoUsuario._id = null;
        this.isNew = false;
        this.nuevoUsuario = usuario;
        this.usuarioForm.get('nombre').setValue(this.nuevoUsuario.nombre);
        this.usuarioForm.get('apellido').setValue(this.nuevoUsuario.apellido);
        this.usuarioForm.get('email').setValue(this.nuevoUsuario.email);
        this.rolSeleccionado = this.nuevoUsuario.role._id;
        this.empresaSeleccionada = this.nuevoUsuario.empresa._id;
        this.usuarioForm.get('estado').setValue(this.nuevoUsuario.estado);
        this.usuarioForm.controls['email'].disable();
        this.displayUsuarioModal = true;
    }

    sendActivationEmail(usuario: Usuario) {
        // const emailModel = new EmailModel();
        // emailModel.to = usuario.email;
        // emailModel.subject = 'Activacion de Cuenta';
        // emailModel.template = 'setear_password.jrxml';
        // emailModel.data = JSON.stringify({
        //     nombre: usuario.nombre + ' ' + usuario.apellido,
        //     email: usuario.email,
        //     pagina: 'Gestion Voucher',
        //     link: 'http://localhost:8100'
        // });
        // this.emailService.sendEmail(emailModel).subscribe((usuario: any) => {
        //     console.log('usuario notificado');
        // },
        //     error => {
        //         console.log(`error al enviar email ${error}`);
        //     });
    }

    changeFilterHandler(event) {
        this.usuarios = this.usuariosOriginal
            .filter(user => {
                if (this.filter['estado'] != '' && this.filter['estado'].toUpperCase() != 'TODOS LOS ESTADOS') {
                    let enabled = (this.filter['estado'].toUpperCase() == 'ACTIVO');
                    if (user.estado == enabled) {
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
                    } else if (user.nombre && user.nombre.toLowerCase().includes(this.busqueda.toLowerCase())) {
                        return true;
                    } else if (user.apellido && user.apellido.toLowerCase().includes(this.busqueda.toLowerCase())) {
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

    handleChange(event, usuario) {
        this.nuevoUsuario = usuario;
        this.nuevoUsuario.estado = event.checked;
        if (!event.checked) {
            this.confirmEstado("¿Seguro que desea deshabilitar el usuario?");
        } else {
            this.confirmEstado("¿Seguro que desea habilitar el usuario?");
        }
    }
}
