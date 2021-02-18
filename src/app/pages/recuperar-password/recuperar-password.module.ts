import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RecuperarPasswordPage } from './recuperar-password.page';

import { CommonsAppModule } from '../../commons/commons.app.module';
import { ComponentsModule } from '../../components/components.module';

const routes: Routes = [
  {
    path: '',
    component: RecuperarPasswordPage
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
  declarations: [RecuperarPasswordPage]
})
export class RecuperarPasswordPageModule {}
