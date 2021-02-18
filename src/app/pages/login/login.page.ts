import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Usuario } from '../../domain/usuario.model';
import { UsuarioService } from '../../service/service.index';
import { MenuController } from '@ionic/angular';
import { ConfirmationService, Message } from 'primeng/api';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioLogin } from '../../domain/usuario.login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit, AfterViewInit {
  public userLogin: Usuario;
  public msgs: Message[];
  public loginForm: FormGroup;
  public isSubmitted = false;
  public validationMessages: any;

  constructor(
    public menuCtrl: MenuController,
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    public router: Router
  ) { }

  public get form() { return this.loginForm.controls; }

  defineErrorMessageForm() {
    // severity="info", severity="success", severity="warn", severity="error" 
    this.validationMessages = {
      'email': [
        { type: 'required', severity: 'error', message: 'Email es requerido.' },
        { type: 'pattern', severity: 'warn', message: 'Debe ser un Email Valido.' },
      ],
      'password': [
        { type: 'required', severity: 'error', message: 'Password es requerido.' }
      ]
    };
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$')
        ]
      ],
      password: ['', Validators.required]
    });

    this.logout();

    this.defineErrorMessageForm();
  }

  ngAfterViewInit() {
    if (this.usuarioService.usuario) {
      this.menuCtrl.enable(true);
    } else {
      this.menuCtrl.enable(false);
    }
  }

  login() {
    this.router.navigate(['/usuarios']);


    //DESCOMENTAR
    // console.log(this.loginForm.value);
    // this.isSubmitted = true;
    // if (this.loginForm.invalid) {
    //   return;
    // }

    // const usuarioLogin: UsuarioLogin = {
    //   username: this.formControls.email.value,  
    //   password: this.formControls.password.value, 
    //   grant_type: 'password',
    //   client_id: 'web',
    //   client_secret: 'web'
    // };

    // this.usuarioService.login(usuarioLogin).subscribe(
    //   (user: any) => {
    //     this.usuarioService.getUserMe().subscribe(
    //       (user: any) => {
    //         console.log(`sale user ${user}`);
    //         this.userLogin = user;
    //         this.menuCtrl.enable(true);
    //         this.router.navigate(['/usuarios']);
    //       },
    //       error => {
    //         {
    //           console.log(`sale error getUserMe ${error}`);
    //           this.userLogin = null;
    //           this.menuCtrl.enable(false);
    //           this.msgs = [];
    //           this.msgs.push({severity: 'error', summary: `Error `, detail: 'Error Recuperando Usuario'});
    //         }
    //       }
    //     );
    //   },
    //   error => {
    //     {
    //       console.log(`sale error login ${error}`);
    //       this.userLogin = null;
    //       this.menuCtrl.enable(false);
    //       this.msgs = [];
    //       this.msgs.push({severity: 'error', summary: `Error `, detail: 'Usuario o Contraseña Incorrecta'});
    //     }
    //   }
    // );
  }

  logout() {
    this.usuarioService.logout();
    this.userLogin = null;
    this.menuCtrl.enable(false);
  }

  get formControls() {
    return this.loginForm.controls;
  }
}
