import {Injectable} from '@angular/core';
import { environment } from 'environments/environment';

@Injectable()
export class SecretService {
  public get adalConfig(): any {
    return {
      instance: 'https://adfstest.micron.com/',
      tenant: 'adfs',
      clientId: 'dc637fa9-82d8-4f7a-97d0-851422fc12ff',
      // redirectUri: window.location.origin + '/EngineeringWebPlatform/',
      // postLogoutRedirectUri: window.location.origin + '/EngineeringWebPlatform/'

      // redirectUri: window.location.origin + '/',
      // postLogoutRedirectUri: window.location.origin + '/'

      redirectUri: window.location.origin + environment.RedirectUrlSuffix,
      postLogoutRedirectUri: window.location.origin + environment.RedirectUrlSuffix

    };
  }
}
