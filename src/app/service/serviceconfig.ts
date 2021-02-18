import { Injectable } from '@angular/core';

@Injectable()
export abstract class ServiceConfig {
    context?: string;
    debug?: boolean;
}
