import { Component, OnInit } from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    Validators,
    FormControl
} from '@angular/forms';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';

import { Role } from '../../domain/role.model';
import { Empresa } from '../../domain/empresa.model';
import { Usuario } from '../../domain/usuario.model';
import { UsuarioRequest } from '../../domain/usuario-request.model';

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
    public roles: Role[] = [];
    public rolesSelect: any[] = [];
    public rolSeleccionado: string;
    public empresas: Empresa[] = [];
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
            { field: 'empresa', header: 'Empresa', empresa: true },
            { field: 'roles', header: 'Rol', role: true }
        ];

        this.setValidators();

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

    get isRoot(): boolean {
        return localStorage.getItem('rol') == "ROOT";
    }

    get permisoAlta(): boolean {
        return localStorage.getItem('rol') == "ADMIN"
            || localStorage.getItem('rol') == "ROOT"
            || localStorage.getItem('rol') == "ADMIN_PARTNER";
    }

    get permisoModificar(): boolean {
        return localStorage.getItem('rol') == "ADMIN"
            || localStorage.getItem('rol') == "ROOT"
            || localStorage.getItem('rol') == "ADMIN_PARTNER"
            || localStorage.getItem('rol') == "OPERATIVO_EMPRESA"
            || localStorage.getItem('rol') == "VENTA";
    }

    noIgual(control: FormControl): { [s: string]: boolean } {
        const forma: any = this;
        if (
            control !== null &&
            forma.controls.newPassword.value !== control.value
        ) {
            return {
                noiguales: true
            };
        }
        return null;
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
            this.empresas = [];
            this.empresasSelect = [];
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
            this.roles = [];
            this.rolesSelect = [];
            let roles = await this.usuarioService.getRoles();
            this.roles = this.filtrarRolesPorRol(roles);

            for (let i = 0; i < this.roles.length; i++) {
                this.rolesSelect.push({ label: this.roles[i].name, value: this.roles[i]._id });
            }
        } catch (error) {
            console.warn(`error al obtener los roles de usuario: ${error.message}`);
            this.msgs = [];
            this.msgs.push({ severity: 'error', summary: `Error al obtener los roles de usuario ${error.message}` });
            this.getUsuarios();
        }
    }

    filtrarRolesPorRol(roles: Role[]) {
        let result: Role[] = [];
        for (let roleUsuario of this.usuarioActual.roles) {
            for (let rol of roles) {
                switch (roleUsuario.name) {
                    case "ADMIN_PARTNER":
                        if (rol.name == "VISTA" || rol.name == "VENTA" || rol.name == "ADMIN_PARTNER") {
                            result.push(rol);
                        }
                        break;
                    default:
                        result.push(rol);
                }
            }
        }

        return result;
    }

    async getUsuarios() {
        try {
            this.blockUI.start("Cargando Usuarios...");
            let usuarios = await this.usuarioService.getUsuarios()
            this.blockUI.stop();
            if (usuarios.length < 1) {
                this.showTabla = false;
            } else {
                this.usuariosOriginal = this.filtrarUsuariosPorRol(usuarios);
                this.usuarios = this.filtrarUsuariosPorRol(usuarios);
                this.showTabla = true;
            }
        } catch (error) {
            this.blockUI.stop();
            console.warn(`error al obtener los usuarios: ${error.message}`);
            this.msgs = [];
            this.msgs.push({ severity: 'error', summary: `Error al obtener los usuarios: ${error.message}` });
        }
    }

    filtrarUsuariosPorRol(usuarios: Usuario[]) {
        let result: Usuario[] = [];
        let rolesActual = this.usuarioActual.roles;
        for(let usuario of usuarios){
            for (let roleUsuarioActual of rolesActual) {
                for (let rol of usuario.roles) {
                    switch (roleUsuarioActual.name) {
                        case "ADMIN_PARTNER":
                            if (rol.name == "VISTA" || rol.name == "VENTA" || rol.name == "ADMIN_PARTNER") {
                                result.push(usuario);
                            }
                            break;
                        default:
                            result.push(usuario);
                    }
                }
            }
        }
        
        return result;
    }

    guardarUsuario() {
        if (!this.usuarioForm.valid) {
            this.msgs = [];
            this.msgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
        } else {
            this.blockUI.start('Guardando Usuario...');
            this.usuarioService.save(this.mapearUsuarioRequest(false, false))
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
            this.blockUI.start('Guardando Usuario...');
            this.usuarioService.update(this.mapearUsuarioRequest(true, elimina))
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

                    this.getUsuarios();
                    this.displayUsuarioModal = false;
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

    mapearUsuarioRequest(modifica: boolean, elimina: boolean): UsuarioRequest {
        let roles = [];
        let empresa: Empresa;
        if (elimina) {
            empresa = this.nuevoUsuario.empresa;
        }
        else {
            empresa = this.empresas.find(x => x._id == this.empresaSeleccionada);
            this.nuevoUsuario.roles = [];
            this.nuevoUsuario.roles.push(this.roles.find(x => x._id == this.rolSeleccionado));
        }

        for (let rol of this.nuevoUsuario.roles) {
            roles.push(rol.name);
        }

        let usuarioRequest: UsuarioRequest = {
            apellido: this.nuevoUsuario.apellido,
            nombre: this.nuevoUsuario.nombre,
            email: this.nuevoUsuario.email,
            empresa: empresa,
            estado: this.nuevoUsuario.estado,
            roles: roles
        }

        !modifica && !elimina ? usuarioRequest.password = this.usuarioForm.get('newPassword').value : null;

        return usuarioRequest;
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
        this.usuarioForm.get('correo').setValue('');
        this.usuarioForm.get('roles').setValue('');
        this.usuarioForm.get('estado').setValue(true);
        this.usuarioForm.get('newPassword').setValue('');
        this.usuarioForm.get('newPassword2').setValue('');
        this.usuarioForm.controls['correo'].enable();

        this.setearEmpresaPorRol();
        this.displayUsuarioModal = true;
    }

    showEditarUsuarioModal(usuario) {
        this.nuevoUsuario._id = null;
        this.isNew = false;
        this.nuevoUsuario = usuario;
        this.usuarioForm.get('nombre').setValue(this.nuevoUsuario.nombre);
        this.usuarioForm.get('apellido').setValue(this.nuevoUsuario.apellido);
        this.usuarioForm.get('correo').setValue(this.nuevoUsuario.email);
        this.usuarioForm.get('roles').setValue(this.nuevoUsuario.roles[0]._id);
        this.usuarioForm.get('newPassword').setValue(this.nuevoUsuario.password);
        this.usuarioForm.get('newPassword2').setValue(this.nuevoUsuario.password);

        if (this.nuevoUsuario.empresa != null && this.nuevoUsuario.empresa._id != null) {
            this.empresaSeleccionada = this.nuevoUsuario.empresa._id;
        }

        this.usuarioForm.get('estado').setValue(this.nuevoUsuario.estado);
        this.usuarioForm.controls['correo'].disable();
        this.displayUsuarioModal = true;
    }

    setearEmpresaPorRol() {
        for (let roleUsuario of this.usuarioActual.roles) {
            switch (roleUsuario.name) {
                case "ADMIN_PARTNER":
                    this.empresaSeleccionada = this.usuarioActual.empresa._id;
                    this.usuarioForm.get('empresa').disable();
                    break;
                default:
                    this.usuarioForm.get('empresa').enable();
                    this.usuarioForm.get('empresa').setValue('');
            }
        }
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

    setValidators() {
        this.usuarioForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            correo: ['', Validators.required],
            empresa: ['', Validators.required],
            roles: ['', Validators.required],
            estado: [''],
            newPassword: ['', Validators.required],
            newPassword2: ['', Validators.required]
        });

        this.usuarioForm.controls.newPassword2.setValidators([
            Validators.required,
            this.noIgual.bind(this.usuarioForm) // Agrega referencia a this dentro del metodo noIgual
        ]);
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

    emailValido() {
        return /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(this.nuevoUsuario.email);
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
