import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginGuardGuard } from './service/guards/login-guard.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './pages/home/home.module#HomePageModule',
    canActivate: [LoginGuardGuard]
  },
  {
    path: 'login',
    loadChildren: './pages/login/login.module#LoginPageModule'
  },
  {
    path: 'cambio-password',
    loadChildren: './pages/cambio-password/cambio-password.module#CambioPasswordPageModule',
    canActivate: [LoginGuardGuard]
  },
  {
    path: 'pass-reset',
    loadChildren: './pages/cambio-password-recuperada/cambio-password-recuperada.module#CambioPasswordRecuperadaPageModule'
  },
  {
    path: 'modificar-usuario',
    loadChildren: './pages/modificar-usuario/modificar-usuario.module#ModificarUsuarioPageModule',
    canActivate: [LoginGuardGuard]
  },
  {
    path: 'recuperar-password',
    loadChildren: './pages/recuperar-password/recuperar-password.module#RecuperarPasswordPageModule',
  },
  {
    path: 'usuarios',
    loadChildren: './pages/usuarios/usuarios.module#UsuariosPageModule',
    canActivate: [LoginGuardGuard]
  },
  {
    path: 'archivos-excel',
    loadChildren: './pages/archivos-excel/archivos-excel.module#ArchivosExcelPageModule',
    canActivate: [LoginGuardGuard]
  },
  {
    path: 'vouchers',
    loadChildren: './pages/vouchers/vouchers.module#VouchersPageModule',
    canActivate: [LoginGuardGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
