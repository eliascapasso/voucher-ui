import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';

import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { Usuario } from '../../domain/usuario.model';
import { ResetPassword } from '../../domain/reset.password';

@Component({
  selector: 'app-cambio-password',
  templateUrl: './cambio-password.page.html',
  styleUrls: ['./cambio-password.page.scss']
})
export class CambioPasswordPage implements OnInit {
  public cambioPasswordForm: FormGroup;
  public validationMessages: any;
  private usuarioActual: Usuario;

  public msgs: Message[];
  constructor(
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    public router: Router
  ) { }

  get form() { return this.cambioPasswordForm.controls; }

  defineErrorMessageForm() {
    this.validationMessages = {
      'oldPassword': [
        { type: 'required', severity: 'error', message: 'Contraseña Actual es requerida.' }
      ],
      'newPassword': [
        { type: 'required', severity: 'error', message: 'Contraseña es requerida.' }
      ],
      'newPassword2': [
        { type: 'required', severity: 'warn', message: 'Repita Contraseña.' }
      ]
    };
  }

  ngOnInit() {
    this.cambioPasswordForm = this.formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      newPassword2: ['', Validators.required]
    });
    // Agregar validaciones a un control
    this.cambioPasswordForm.controls.newPassword2.setValidators([
      Validators.required,
      this.noIgual.bind(this.cambioPasswordForm) // Agrega referencia a this dentro del metodo noIgual
    ]);

    this.usuarioService.getUserMe().subscribe(usuario => {
      this.usuarioActual = usuario;
    });
    this.defineErrorMessageForm();
  }

  send() {
    if (!this.cambioPasswordForm.valid) {
      this.msgs = [];
      this.msgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
    }
    else if (!this.validarPassAntigua()) {
      this.msgs = [];
      this.msgs.push({ severity: 'error', summary: `Error `, detail: 'Contraseña actual incorrecta' });
    }
    else {
      let resetPassword: ResetPassword = {
        email: this.usuarioActual.email,
        password: this.cambioPasswordForm.controls.newPassword.value
      };

      this.usuarioService.changePassword(resetPassword)
        .subscribe((user: any) => {
          console.log('password Actualizada');
          this.msgs = [];
          this.msgs.push({ severity: 'success', summary: `Contraseña Actualizada ` });

          setTimeout(() => {
            this.usuarioService.logout();
          }, 1500);
        }, error => {
          console.warn(`error al cambiar contraseña: ${error.message}`);
          this.msgs = [];
          this.msgs.push({ severity: 'error', summary: `error al guardar nueva contraseña:  ${error.message}`, detail: error });
        });
    }
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

  validarPassAntigua() {
    //return this.cambioPasswordForm.controls.oldPassword.value === this.usuarioActual.password;
    return true;
  }
}
