import { Component, OnInit } from "@angular/core";

import { Platform, MenuController } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Usuario } from "./domain/usuario.model";
import { UsuarioService } from "./service/usuario/usuario.service";
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  verUsuarios: boolean = false;
  usuarioActual: Usuario;
  isConf: number = 0;
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

      this.menuCtrl.enable(true);
    });
  }

  get permisoVoucher(): boolean {
    return !(localStorage.getItem('rol') == "OPERATIVO_EMPRESA");
  }

  ngOnInit() { }

  isLogedIn() {
    return localStorage.getItem('email') != null;
  }
}
