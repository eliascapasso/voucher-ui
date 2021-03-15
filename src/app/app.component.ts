import { Component, OnInit, Input } from "@angular/core";

import { Platform, MenuController, IonItem } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { MenuItem } from "primeng/api";
import { Usuario } from "./domain/usuario.model";
import { UsuarioService } from "./service/usuario/usuario.service";
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  profile: MenuItem[];
  configuracion: MenuItem[];
  isMonitoreo: number = 0;

  isLoggedIn: boolean = true;

  userLogin: Usuario;

  empresa: string;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public usuarioService: UsuarioService,
    public menuCtrl: MenuController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.empresa = environment.empresa;
      this.usuarioService.usuarioLoginNotification.subscribe(user => {
        this.userLogin = user;
      });
    });
  }

  ngOnInit() {
    this.configuracion = [
      {
        label: "Configuración",
        icon: "pi pi-pw pi-user",
        items: [
          {
            label: "Usuarios",
            icon: "pi pi-fw pi-users",
            routerLink: "/usuarios"
          },

        ]
      }
    ];
  }

  isLogedIn() {
    return localStorage.getItem('email') != null;
  }
}
