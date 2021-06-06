import { Component } from '@angular/core';
import { MenuController, PopoverController } from '@ionic/angular';
import { UsuarioService } from '../../service/usuario/usuario.service';
import {Usuario} from '../../domain/usuario.model';


@Component({
    selector: 'app-popover-menu',
    templateUrl: './popover-menu.component.html',
    styleUrls: ['./popover-menu.component.scss'],
})
export class PopoverMenuComponent {
    userLogin: Usuario;

    constructor(public menuCtrl: MenuController, public popoverController: PopoverController, private usuarioService: UsuarioService) {
        this.usuarioService.getUserMe().subscribe(usuario => {
            this.userLogin = usuario;
        });
    }

    close() {
        this.popoverController.dismiss();
    }

    logout() {
        this.menuCtrl.enable(false);
        this.usuarioService.logout();
    }

    isLogedIn() {
        return localStorage.getItem('email') != null;
    }

}
