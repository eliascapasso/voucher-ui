import { NgModule, ModuleWithProviders } from '@angular/core';

import {
    UsuarioService,
    LoginGuardGuard
} from './service.index';

import { ServiceConfig } from './serviceconfig';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ArchivoExcelService } from './archivo-excel/archivo-excel.service';


@NgModule({})
export class ServiceModule {
    static forRoot(serviceConfig: ServiceConfig = {context: '', debug: false}): ModuleWithProviders {
        return {
            ngModule: ServiceModule,
            providers: [
                {provide: ServiceConfig, useValue: serviceConfig},
                UsuarioService,
                ArchivoExcelService,
                ConfirmationService,
                LoginGuardGuard,
                MessageService
            ]
        };
    }
}
