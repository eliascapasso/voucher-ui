import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { VoucherEmitidoPage } from './voucher-emitido.page';
import { CommonsAppModule } from 'src/app/commons/commons.app.module';
import { ComponentsModule } from '../../components/components.module';

const routes: Routes = [
    {
        path: '',
        component: VoucherEmitidoPage
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
    declarations: [VoucherEmitidoPage]
})
export class VoucherEmitidoPageModule {}