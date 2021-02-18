import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

// Interceptor HTTP
import { MyHttpInterceptor } from './service/http-interceptor/my-http-interceptor';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CommonsAppModule } from './commons/commons.app.module';
import { ComponentsModule } from './components/components.module';
import { ServiceModule } from './service/service.module';
import { HttpClientModule } from '@angular/common/http';
import { BlockUIModule } from 'ng-block-ui';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    CommonsAppModule, // Modulos basicos (RouterModule,FormsModule,ReactiveFormsModule,HttpClientModule,etc)
    ComponentsModule, // Componentes de la app
    AppRoutingModule, // Rutas principales de la app
    ServiceModule.forRoot({context: '/api', debug: false}),    // Modulo de la app que tiene todos los services
    BlockUIModule.forRoot(),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MyHttpInterceptor,
      multi: true
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
