import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SseService {

  private get serviceBaseURL(): string {
      
      return environment.apiUrl;
  }
  /**
   * Crea un Event Source
   * @param url
   */
  getEventSource( url?: string ) {

    if ( !url ) {
      url = this.serviceBaseURL + '/public/statusAfipSse';
    }
    return new EventSource(url);
  }
}
