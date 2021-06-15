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
import { MenuController } from '@ionic/angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cambio-password-recuperada',
  templateUrl: './cambio-password-recuperada.page.html',
  styleUrls: ['./cambio-password-recuperada.page.scss']
})
export class CambioPasswordRecuperadaPage implements OnInit {
  public CambioPasswordRecuperadaForm: FormGroup;
  public validationMessages: any;
  public empresa: string = '';
  public email: string = '';
  public code: string = '';

  public msgs: Message[];
  constructor(
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    public router: Router,
    public menuCtrl: MenuController
  ) {
    this.empresa = environment.empresa;
  }

  get form() { return this.CambioPasswordRecuperadaForm.controls; }

  defineErrorMessageForm() {
    // severity="info", severity="success", severity="warn", severity="error" 
    this.validationMessages = {
      'newPassword': [
        { type: 'required', severity: 'error', message: 'Password es requerido.' }
      ],
      'newPassword2': [
        { type: 'required', severity: 'warn', message: 'Repita Password.' }
      ]
    };
  }

  ngOnInit() {
    this.menuCtrl.enable(false);

    let urlTree = this.router.parseUrl(this.router.url);

    this.email = urlTree.queryParams['email'];
    this.code = urlTree.queryParams['hash'];

    this.CambioPasswordRecuperadaForm = this.formBuilder.group({
      newPassword: ['', Validators.required],
      newPassword2: ['', Validators.required]
    });
    // Agregar validaciones a un control
    this.CambioPasswordRecuperadaForm.controls.newPassword2.setValidators([
      Validators.required,
      this.noIgual.bind(this.CambioPasswordRecuperadaForm) // Agrega referencia a this dentro del metodo noIgual
    ]);

    this.defineErrorMessageForm();

  }

  send() {
    if (!this.CambioPasswordRecuperadaForm.valid) {
      this.msgs = [];
      this.msgs.push({ severity: 'error', summary: `Error `, detail: 'Debe completar todos los campos' });
    }

    let resetPassword = {
      email: this.email,
      code: this.code,
      password: this.CambioPasswordRecuperadaForm.value.newPassword
    }

    // this.usuarioService.resetPassword(resetPassword)
    //   .subscribe((user: any) => {
    //     console.info('password Actualizada');
    //     this.msgs = [];
    //     this.msgs.push({ severity: 'success', summary: `Password Actualizada `, detail: `Password Actualizada` });

    //     this.router.navigateByUrl('/login');
    //   },
    //     error => {
    //       console.error(`error al cambiar password ${error}`);
    //       this.msgs = [];
    //       this.msgs.push({ severity: 'error', summary: 'Error: ' + error.message });
    //     });
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
