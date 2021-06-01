import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ModificarUsuarioPage } from './modificar-usuario.page';
import { CommonsAppModule } from '../../commons/commons.app.module';
import { ComponentsModule } from '../../components/components.module';



const routes: Routes = [
  {
    path: '',
    component: ModificarUsuarioPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonsAppModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ModificarUsuarioPage]
})
export class ModificarUsuarioPageModule {}
