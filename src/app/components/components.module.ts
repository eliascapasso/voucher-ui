import { NgModule } from '@angular/core';
import { CommonsAppModule } from '../commons/commons.app.module';
import { DashboardDemoComponent } from './dashboard/dashboarddemo.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PopoverMenuComponent } from './header/popover-menu.component';



// Declarar Componentes Propios



@NgModule({
  declarations: [
     DashboardDemoComponent,
     FooterComponent,
     HeaderComponent,
     PopoverMenuComponent
  ],
  exports: [
    DashboardDemoComponent,
    FooterComponent,
    HeaderComponent,
    PopoverMenuComponent
  ],
  imports: [
    CommonsAppModule
  ],
  entryComponents: [PopoverMenuComponent],
})
export class ComponentsModule { }
