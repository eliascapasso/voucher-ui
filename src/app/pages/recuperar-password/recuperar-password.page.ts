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
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss']
})
export class RecuperarPasswordPage implements OnInit {
  public recuperarClaveForm: FormGroup;
  public msgs: Message[];
  public validationMessages: any;

  constructor(
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    public router: Router,
    public menuCtrl: MenuController,
  ) {}

  ngAfterViewInit() {
      this.menuCtrl.enable(false);
  }

  get form() { return this.recuperarClaveForm.controls; }

  defineErrorMessageForm() {
    // severity="info", severity="success", severity="warn", severity="error" 
    this.validationMessages = {
      'email': [
        { type: 'required', severity: 'error', message: 'Email es requerido.' },
        { type: 'pattern', severity: 'warn', message: 'Debe ser un Email Valido.' },
      ]
    };
  }

  ngOnInit() {
    this.defineErrorMessageForm();
    this.recuperarClaveForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$')
        ]
      ]
    });
  }

  send() {    
    console.log(this.recuperarClaveForm.value);
    console.log(this.recuperarClaveForm);
    const email: any = this.recuperarClaveForm.value;
    this.usuarioService.recuperarPassword(email).subscribe(
      (user: any) => {
        if ( user ) {
          console.log('Email Enviado');
          this.msgs = [];
          this.msgs.push({
            severity: 'success',
            summary: `Email Enviado `,
            detail: `Revise su cuenta, hemos enviado un email a ${user.email}`
          });
        } else {
          this.msgs = [];
          this.msgs.push({
            severity: 'warn',
            summary: `Error Enviando email `,
            detail: `No se pudo verificar el email ${email.email}`
          });
        }
      },
      error => {
         
        let errorMessage = (error.message)?error.message:"";
        let errorDetail = "";
        if(error.error){
          if(error.error && error.error.error_description){
            errorDetail = error.error.error_description;
          }else{
            errorDetail = error.error;
          }
        } 
        //console.log(`error al cambiar password ${errorMessage}`);
        this.msgs = [];
        this.msgs.push({
          severity: 'error',
          summary: `error al guardar enviar email: ${errorMessage}`,
          detail: errorDetail
        });
      }
    );
  }
}
