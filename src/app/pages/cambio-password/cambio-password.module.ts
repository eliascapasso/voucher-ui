import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CambioPasswordPage } from './cambio-password.page';
import { CommonsAppModule } from '../../commons/commons.app.module';
import { ComponentsModule } from '../../components/components.module';



const routes: Routes = [
  {
    path: '',
    component: CambioPasswordPage
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
  declarations: [CambioPasswordPage]
})
export class CambioPasswordPageModule {}
