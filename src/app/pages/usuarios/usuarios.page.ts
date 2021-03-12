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

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.page.html',
    styleUrls: ['./usuarios.page.scss']

})
export class UsuariosPage implements OnInit {
    public columnas: any[];
    public usuarios: Usuario[] = [];
    public usuariosOriginal: Usuario[] = [];
    public nuevoUsuario: Usuario = {};
    public showTabla: boolean = false
    public usuarioForm: FormGroup;
    public msgs: Message[];
    public formMsgs: Message[];
    public displayUsuarioModal: boolean = false;
    public rolSeleccionado: string;
    public estados: any[] = [];
    public filter = { name: '', estado: '' };
    public busqueda: string = '';
    public isNew: boolean;
    public roles: any[] = [];

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

        this.getUsuarios();
        this.getRoles();
    }

    getRoles(){
        this.usuarioService.getRoles().then(roles => {
            
            for(let i=0; i<roles.length; i++){
                this.roles.push({ label: roles[i].role, value: roles[i].role });
            }
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
                usuario.estado = true;
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

    guardarUsuario() {
        this.nuevoUsuario.email = "";

        if (!this.usuarioForm.valid) {
            this.formMsgs = [];
            this.formMsgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
        } else {
            this.blockUI.start('Guardando Usuario...');

            if (this.nuevoUsuario._id == null) {
                this.nuevoUsuario.role = null;
                let role = {
                    _id: "",
                    role: this.rolSeleccionado
                };
                this.nuevoUsuario.role = role;
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
        this.isNew = false;
        this.nuevoUsuario = usuario;
        this.usuarioForm.get('nombre').setValue(this.nuevoUsuario.nombre);
        this.usuarioForm.get('apellido').setValue(this.nuevoUsuario.apellido);
        this.usuarioForm.get('email').setValue(this.nuevoUsuario.email);
        this.usuarioForm.get('role').setValue(this.nuevoUsuario.role.role);
        this.usuarioForm.get('estado').setValue(this.nuevoUsuario.estado);
        this.usuarioForm.controls['email'].disable();
        this.displayUsuarioModal = true;
    }

    sendActivationEmail(usuario: Usuario) {
        const emailModel = new EmailModel();
        emailModel.to = usuario.email;
        emailModel.subject = 'Activacion de Cuenta';
        emailModel.template = 'setear_password.jrxml';
        emailModel.data = JSON.stringify({
            nombre: usuario.nombre + ' ' + usuario.apellido,
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
        if (usuario.enabled) {
            this.confirmDelete(usuario);
        } else {
            this.confirmUpdate('¿Está seguro que desea habilitar el usuario?', usuario);
        }
    }
}
