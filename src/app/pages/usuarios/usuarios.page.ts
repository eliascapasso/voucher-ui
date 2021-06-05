import { Component, OnInit } from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    Validators
} from '@angular/forms';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Usuario } from '../../domain/usuario.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.page.html',
    styleUrls: ['./usuarios.page.scss']

})
export class UsuariosPage implements OnInit {
    public columnas: any[];
    public usuarioActual: Usuario;
    public usuarios: Usuario[] = [];
    public usuariosOriginal: Usuario[] = [];
    public nuevoUsuario: Usuario = {};
    public showTabla: boolean = false
    public usuarioForm: FormGroup;
    public msgs: Message[];
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

    @BlockUI() blockUI: NgBlockUI;
    constructor(
        private usuarioService: UsuarioService,
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
            { field: 'roles', header: 'Rol', role: true }
        ];

        this.usuarioForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            email: ['', Validators.required],
            empresa: ['', Validators.required],
            roles: ['', Validators.required],
            estado: [''],
        });

        this.estados.push({ label: 'Todos los Estados', value: '' });
        this.estados.push({ label: 'Activo', value: 'ACTIVO' });
        this.estados.push({ label: 'Inactivo', value: 'INACTIVO' });

        this.isNew = false;
        this.nuevoUsuario = {};

        this.getUsuarioActual();
    }

    ngOnDestroy() {
        this.suscriptionUser.unsubscribe();
    }

    getUsuarioActual() {
        this.suscriptionUser = this.usuarioService.getUserMe().subscribe(usuario => {
            this.usuarioActual = usuario;
            this.getUsuarios();
            this.getRoles();
            this.getEmpresas();
        });
    }

    async getEmpresas() {
        try {
            let empresas = await this.usuarioService.getEmpresas();
            this.empresas = empresas;

            for (let i = 0; i < empresas.length; i++) {
                this.empresasSelect.push({ label: empresas[i].empresa, value: empresas[i]._id });
            }
        } catch (error) {
            console.warn(`error al obtener las empresas: ${error.message}`);
            this.msgs = [];
            this.msgs.push({ severity: 'error', summary: `Error al obtener las empresas: ${error.message}` });
            this.getUsuarios();
        }
    }

    async getRoles() {
        try {
            let roles = await this.usuarioService.getRoles();
            for (let i = 0; i < roles.length; i++) {
                this.rolesSelect.push({ label: roles[i].name, value: roles[i]._id });
            }
            this.roles = roles;
        } catch (error) {
            console.warn(`error al obtener los roles de usuario: ${error.message}`);
            this.msgs = [];
            this.msgs.push({ severity: 'error', summary: `Error al obtener los roles de usuario ${error.message}` });
            this.getUsuarios();
        }
    }

    async getUsuarios() {
        try {
            this.blockUI.start("Cargando Usuarios...");
            let usuarios = await this.usuarioService.getUsuarios()
            this.blockUI.stop();
            if (usuarios.length < 1) {
                this.showTabla = false;
            } else {
                this.usuariosOriginal = usuarios;;
                this.usuarios = usuarios;
                this.showTabla = true;
            }
        } catch (error) {
            this.blockUI.stop();
            console.warn(`error al obtener los usuarios: ${error.message}`);
            this.msgs = [];
            this.msgs.push({ severity: 'error', summary: `Error al obtener los usuarios: ${error.message}` });
        }
    }

    guardarUsuario() {
        if (!this.usuarioForm.valid) {
            this.msgs = [];
            this.msgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
        } else {
            this.nuevoUsuario.roles = [];
            this.nuevoUsuario.roles.push(this.roles.find(x => x._id == this.rolSeleccionado));
            this.nuevoUsuario.empresa = this.empresas.find(x => x._id == this.empresaSeleccionada);

            this.blockUI.start('Guardando Usuario...');
            this.usuarioService.save(this.nuevoUsuario)
                .subscribe((usuario: any) => {
                    this.blockUI.stop();
                    this.msgs = [];
                    this.msgs.push({ severity: 'success', summary: `Usuario guardado con exito`, detail: `Usuario guardado` });
                    this.displayUsuarioModal = false;
                    this.getUsuarios();
                },
                    error => {
                        this.blockUI.stop();
                        console.warn(`error al guardar usuario: ${error.message}`);
                        this.msgs = [];
                        this.msgs.push({ severity: 'error', summary: `Error al guardar el usuario: ${error.message}` });
                        this.getUsuarios();
                    });
        }
    }

    actualizarUsuario(elimina) {
        if (!this.usuarioForm.valid && !elimina) {
            this.msgs = [];
            this.msgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
        }
        else {
            if (!elimina) {
                this.nuevoUsuario.roles = [];
                this.nuevoUsuario.roles.push(this.roles.find(x => x._id == this.rolSeleccionado));
                this.nuevoUsuario.empresa = this.empresas.find(x => x._id == this.empresaSeleccionada);
            }

            if (this.nuevoUsuario.empresa != null && this.nuevoUsuario.empresa._id == null) {
                this.nuevoUsuario.empresa = null;
            }

            this.blockUI.start('Guardando Usuario...');
            this.usuarioService.update(this.nuevoUsuario)
                .subscribe((usuario: any) => {
                    this.blockUI.stop();
                    this.msgs = [];
                    if (elimina) {
                        if (this.nuevoUsuario.estado) {
                            this.msgs.push({ severity: 'success', summary: `Usuario habilitado`, detail: `Usuario modificado` });
                        }
                        else {
                            this.msgs.push({ severity: 'success', summary: `Usuario deshabilitado`, detail: `Usuario modificado` });
                        }
                    }
                    else {
                        this.msgs.push({ severity: 'success', summary: `Usuario modificado con exito`, detail: `Usuario modificado` });
                    }

                    this.displayUsuarioModal = false;
                    this.getUsuarios();
                },
                    error => {
                        this.blockUI.stop();
                        console.log(`error al modificar usuario: ${error.message}`);
                        this.msgs = [];
                        this.msgs.push({ severity: 'error', summary: `Error al modificar el usuario: ${error.message}` });
                        this.getUsuarios();
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
                this.getUsuarios();
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
        this.usuarioForm.get('roles').setValue('');
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
        this.rolSeleccionado = this.nuevoUsuario.roles[0]._id;
        if (this.nuevoUsuario.empresa != null && this.nuevoUsuario.empresa._id != null) {
            this.empresaSeleccionada = this.nuevoUsuario.empresa._id;
        }
        this.usuarioForm.get('estado').setValue(this.nuevoUsuario.estado);
        this.usuarioForm.controls['email'].disable();
        this.displayUsuarioModal = true;
    }

    cerrarModal() {
        this.getUsuarios();
        this.displayUsuarioModal = false;
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

    mostrarRoles(roles) {
        let rolesString = "";
        for (let i = 0; i < roles.length; i++) {
            if (roles != undefined && roles != null && roles.length != 0) {
                rolesString = rolesString + " " + roles[i].name;
            }
        }

        return rolesString;
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
