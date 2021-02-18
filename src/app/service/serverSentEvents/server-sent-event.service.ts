import { Injectable, NgZone } from '@angular/core';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ServerSentEventService {

  constructor(private zone: NgZone, private sseService: SseService) { }

  /**
   * Return event source stream
   */
  getServerSentEvent( url: string ) {
    return new Observable( (observer) => {
      const eventSource = this.sseService.getEventSource(url);

      eventSource.onmessage = event => {
        this.zone.run( () => {
          observer.next( event );
        });
      };

      eventSource.onerror = error => {
        this.zone.run( () => {
          observer.error( error );
        });
      };

    });
  }
}
