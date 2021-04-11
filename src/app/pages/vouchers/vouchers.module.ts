import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { VouchersPage } from './vouchers.page';
import { CommonsAppModule } from 'src/app/commons/commons.app.module';
import { ComponentsModule } from '../../components/components.module';

const routes: Routes = [
    {
        path: '',
        component: VouchersPage
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
    declarations: [VouchersPage]
})
export class VouchersPageModule {}