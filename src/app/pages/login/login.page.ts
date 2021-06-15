import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Usuario } from '../../domain/usuario.model';
import { UsuarioService } from '../../service/service.index';
import { MenuController } from '@ionic/angular';
import { Message } from 'primeng/api';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioLogin } from '../../domain/usuario-login.model';

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
    if (localStorage.getItem('email') != null) {
      this.menuCtrl.enable(true);
    } else {
      this.menuCtrl.enable(false);
    }
  }

  login() {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    const usuarioLogin: UsuarioLogin = {
      email: this.formControls.email.value,
      password: this.formControls.password.value
    };

    this.usuarioService.login(usuarioLogin).subscribe(
      (user: any) => {
        this.usuarioService.getUserMe().subscribe(
          (user: any) => {
            this.userLogin = user;
            this.menuCtrl.enable(true);
          },
          error => {
            {
              console.warn(`error getUserMe: ${error.message}`);
              this.userLogin = null;
              this.menuCtrl.enable(false);
              this.msgs = [];
              this.msgs.push({ severity: 'error', summary: `Error `, detail: 'Error Recuperando Usuario' });
            }
          }
        );
      },
      error => {
        {
          console.warn(`error login: ${error.message}`);
          this.userLogin = null;
          this.menuCtrl.enable(false);
          this.msgs = [];
          this.msgs.push({ severity: 'error', summary: `Error `, detail: 'Usuario o Contraseña Incorrecta' });
        }
      }
    );
  }

  logout() {
    this.userLogin = null;
    this.menuCtrl.enable(false);
    this.usuarioService.logout();
  }

  get formControls() {
    return this.loginForm.controls;
  }
}
