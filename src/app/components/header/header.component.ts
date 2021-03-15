import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from './popover-menu.component';
import { UsuarioService } from '../../service/usuario/usuario.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
    constructor( private popoverController: PopoverController, private usuarioService: UsuarioService) {}

    ngOnInit() {

    }

    async presentPopover(event) {
        const popover = await this.popoverController.create({
            component: PopoverMenuComponent,
            event,
            showBackdrop: false
        });
        return await popover.present();
    }

    isLogedIn() {
        return localStorage.getItem('email') != null;
    }
}
