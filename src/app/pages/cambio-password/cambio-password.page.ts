import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  NgForm
} from '@angular/forms';
import { UsuarioService } from '../../service/usuario/usuario.service';
import { Router } from '@angular/router';
import { ResetPassword } from '../../domain/reset.password';
import { SelectItem, ConfirmationService, Message } from 'primeng/api';

@Component({
  selector: 'app-cambio-password',
  templateUrl: './cambio-password.page.html',
  styleUrls: ['./cambio-password.page.scss']
})
export class CambioPasswordPage implements OnInit {
  public cambioPasswordForm: FormGroup;
  public validationMessages: any;

  public msgs: Message[];
  constructor(
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    public router: Router
  ) { }

  get form() { return this.cambioPasswordForm.controls; }

  defineErrorMessageForm() {
    // severity="info", severity="success", severity="warn", severity="error" 
    this.validationMessages = {
      'oldPassword': [
        { type: 'required', severity: 'error', message: 'Password Actual es requerido.' }
      ],
      'newPassword': [
        { type: 'required', severity: 'error', message: 'Password es requerido.' }
      ],
      'newPassword2': [
        { type: 'required', severity: 'warn', message: 'Repita Password.' }
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

    this.defineErrorMessageForm();
  }

  send() {
    if (!this.cambioPasswordForm.valid) {
      this.msgs = [];
      this.msgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
    }
    console.log(this.cambioPasswordForm.value);
    console.log(this.cambioPasswordForm);
    const resetPassword: ResetPassword = this.cambioPasswordForm.value;

    this.usuarioService.changePassword(resetPassword)
      .subscribe((user: any) => {
        console.log('password Actualizada');
        this.msgs = [];
        this.msgs.push({ severity: 'success', summary: `Password Actualizada `, detail: `Password Actualizada ${user}` });
      },
        error => {
          console.log(`error al cambiar password ${error}`);
          this.msgs = [];
          this.msgs.push({ severity: 'error', summary: `error al guardar nueva clave  ${error}`, detail: error });
        });
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
}
