import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { Message } from 'primeng/api';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Usuario } from 'src/app/domain/usuario.model';
import { UsuarioRequest } from 'src/app/domain/usuario-request.model';

@Component({
  selector: 'app-modificar-usuario',
  templateUrl: './modificar-usuario.page.html',
  styleUrls: ['./modificar-usuario.page.scss']
})
export class ModificarUsuarioPage implements OnInit {
  public usuarioForm: FormGroup;
  public msgs: Message[];
  public nuevoUsuario: Usuario = {};
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder
  ) { }

  get form() { return this.usuarioForm.controls; }

  ngOnInit() {
    this.usuarioForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', Validators.required],
      empresa: ['', Validators.required],
      role: ['', Validators.required],
      estado: [''],
    });

    this.obtenerUsuario();
  }

  obtenerUsuario() {
    this.usuarioService.getUserMe().subscribe(usuario => {
      this.nuevoUsuario = usuario;
      console.log(usuario);
    });
  }

  actualizarUsuario() {
    this.blockUI.start('Guardando Usuario...');
    this.usuarioService.update(this.mapearUsuarioRequest())
      .subscribe((usuario: any) => {
        this.blockUI.stop();
        this.msgs = [];
        this.msgs.push({ severity: 'success', summary: `Usuario modificado con exito`, detail: `Usuario modificado` });

        setTimeout(() => {
          this.usuarioService.logout();
        }, 1500);
      },
        error => {
          this.blockUI.stop();
          console.warn(`error al modificar usuario: ${error.message}`);
          this.msgs = [];
          this.msgs.push({ severity: 'error', summary: `Error al modificar el usuario: ${error.message}` });
        });
  }

  validar() {
    return this.nuevoUsuario.email == null || 
            this.nuevoUsuario.apellido == null || 
            this.nuevoUsuario.nombre == null || 
            this.nuevoUsuario.email == "" || 
            this.nuevoUsuario.apellido == "" || 
            this.nuevoUsuario.nombre == "" ||
            !this.emailValido();
  }

  emailValido(){
    return /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(this.nuevoUsuario.email);
  }

  mapearUsuarioRequest(): UsuarioRequest {
    let roles = [];
    for (let rol of this.nuevoUsuario.roles) {
        roles.push(rol.name);
    }

    let usuarioRequest: UsuarioRequest = {
        apellido: this.nuevoUsuario.apellido,
        nombre: this.nuevoUsuario.nombre,
        email: this.nuevoUsuario.email,
        empresa: this.nuevoUsuario.empresa,
        estado: this.nuevoUsuario.estado,
        roles: roles
    }

    return usuarioRequest;
}
}
