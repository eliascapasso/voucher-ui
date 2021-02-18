import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class LoginGuardGuard implements CanActivate {
  constructor(
    public usuarioService: UsuarioService,
    public toastController: ToastController,
    public router: Router
  ) {}

  canActivate(): boolean {
    if (localStorage.getItem('token') != null) {
      this.usuarioService.getUserMe();
      console.log('usuario autentificado');
      return true;
    } else {
      console.log('Bloqueado por GUARD');
      this.presentToast('Es necesario ingresar como usuario del sistema');
      this.router.navigateByUrl('/login');
      return false;
    }
  }

  async presentToast(msj: string) {
    const toast = await this.toastController.create({
      message: msj,
      duration: 2000
    });
    toast.present();
  }
}
