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
  verUsuarios: boolean = false;
  userLogin: Usuario;
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
      this.usuarioService.getUserMe().subscribe(user => {
        this.userLogin = user;
      });
    });
  }

  ngOnInit() { }

  isLogedIn() {
    return localStorage.getItem('email') != null;
  }
}
