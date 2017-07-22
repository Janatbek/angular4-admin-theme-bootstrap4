import { CacheDataInfo, NameIndex } from '../interfaces/WidgetInterfaces';
import { Options } from 'ts-node/dist';
import { Http, Response, RequestMethod, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Params } from '@angular/router/router';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { SessionStorageService } from 'ngx-webstorage/dist/app';
import { AdalService } from 'ng2-adal/core';

import { SecretService } from './secret.service';
import { environment } from 'environments/environment';

import { UserStatistics } from 'app/common/interfaces/UserInterfaces';
import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';
import { DataSet, ManagedCacheHitLog } from '../interfaces/DisplayInterfaces';
import { AppStateService } from 'app/common/services/AppStateService';
import { ManagedDataReply } from 'app/common/interfaces/WidgetInterfaces';


@Injectable()
export class EngWebApiService {

  freshAuthentication = true;

  constructor(private http: Http, private appStateService: AppStateService,
    private adalService: AdalService,
    private secretService: SecretService,
    private sessionStorageService: SessionStorageService) {
  }

  GetMongoDocs(collectionName: string, jsonFilter?: any): Observable<Object[]> {

    if (!jsonFilter) {
      jsonFilter = {};
    }
        // api/MongoCollection?CollectionName=GenericTest
    const options = this.getRequestOptions(
      environment.WebApiUrl + `/api/MongoCollection?CollectionName=${collectionName}&jsonFilter=${JSON.stringify(jsonFilter)}`);
    UtilityFunctions.DebugLog(`MongoCollection request to ${options.url}`);
    return this.http
      .get(options.url, options)
      .map(res => <Object[]>res.json())
      .catch(this.handleError);
  }

  GetMongoDoc(collectionName: string, key: string, value: string): Observable<Object> {

    // api/MongoCollection?CollectionName=GenericTest&keyField=key&keyValue=value
    const options = this.getRequestOptions(
      environment.WebApiUrl + `/api/MongoCollection?CollectionName=${collectionName}&keyField=${key}&keyValue=${value}`);
    UtilityFunctions.DebugLog(`MongoCollection request to ${options.url}`);
    return this.http
      .get(options.url, options)
      .map(res => <Object>res.json())
      .catch(this.handleError);

  }

  UpsertMongoDoc(collectionName: string, key: string, document: any) {

    // api/MongoCollection?CollectionName=GenericTest&keyField=key
    const options = this.getRequestOptions(
      environment.WebApiUrl + `/api/MongoCollection?CollectionName=${collectionName}&keyField=${key}`);
    UtilityFunctions.DebugLog(`MongoCollection request to ${options.url}`);

    const $o = this.http
      .post(options.url, document, options)
      .catch(this.handleError);
    $o.subscribe();

  }

   UpsertMongoDocObs(collectionName: string, key: string, document: any): Observable<any> {

    // api/MongoCollection?CollectionName=GenericTest&keyField=key
    const options = this.getRequestOptions(
      environment.WebApiUrl + `/api/MongoCollection?CollectionName=${collectionName}&keyField=${key}`);
    UtilityFunctions.DebugLog(`MongoCollection request to ${options.url}`);

    const $o = this.http
      .post(options.url, document, options)
      .catch(this.handleError);

    return $o;
  }

  GetAllUserStats(): Observable<UserStatistics[]> {
    const options = this.getRequestOptions(environment.WebApiUrl + '/AllUserStats');
    UtilityFunctions.DebugLog(`GetAllUserStats request to ${options.url}`);
    return this.http
      .get(options.url, options)
      .map(res => <UserStatistics[]>res.json())
      .catch(this.handleError);
  }

  GetUserStats(userName: string): Observable<UserStatistics> {
    const url = environment.WebApiUrl + '/UserStats/' + userName;

    const options = this.getRequestOptions(url);
    return this.http
      .get(options.url, options)
      .map(res => <UserStatistics>res.json())
      .catch(this.handleError);
  }

  UpsertUserStats(userStats: UserStatistics) {
    return this.http.post(
      environment.WebApiUrl + '/UserStats',
      userStats
    );
  }

  UpdateConfiguration(name: string, config: any): Observable<Response> {
    const entry = {
      key: name,
      Payload: config };

    const options = this.getRequestOptions(environment.WebApiUrl + '/Configuration');
    UtilityFunctions.DebugLog(`UpdateConfiguration request to ${options.url}`);
    return this.http
      .post(options.url, entry, options)
      .catch(this.handleError);
  }

  GetConfig<T>(name: string): Observable<T> {
    const options = this.getRequestOptions(environment.WebApiUrl + '/Configuration/' + name);
    return this.http
      .get(options.url, options)
      .map(res => <T>res.json())
      .catch(this.handleError);
  }

  GetManagedCacheHitLogs(): Observable<ManagedCacheHitLog[]> {
    this.appStateService.appendLog('GetManagedCacheHitLogs call', 3);
    const options = this.getRequestOptions(environment.WebApiUrl + '/ManagedCacheHitLogs');
    return this.http
      .get(options.url, options)
      .map(res => {return <ManagedCacheHitLog[]>res.json(); })
      .catch(this.handleError);
  }

  UpdateCacheStatus(minutesAhead: number): Observable<string[][]> {
    this.appStateService.appendLog('UpdateCacheStatus call', 3);
    const options = this.getRequestOptions(environment.WebApiUrl + '/UpdateCacheData/' + minutesAhead.toString());
    return this.http
      .get(options.url, options)
      .map(res => { return <string[][]>res.json(); })
      .catch(this.handleError);
  }

  GetManagedCacheDataStatus(): Observable<string[][]> {
    this.appStateService.appendLog('GetManagedCacheDataStatus call', 3);
    const options = this.getRequestOptions(environment.WebApiUrl + '/ManagedCacheDataStatus');
    return this.http
      .get(options.url, options)
      .map(res => { return <string[][]>res.json(); })
      .catch(this.handleError);
  }

  GetIsAdmin(): Observable<boolean> {
    const options = this.getRequestOptions(environment.WebApiUrl + '/UserIsAdmin');

    this.appStateService.appendLog(
      `GetIsAdmin call`,
      3);

    UtilityFunctions.DebugLog(`this.http.get ${options.url} ...`);
    return this.http
      .get(options.url, options)
      .map(res => {
        const reply = <NameIndex>res.json();
        return reply.index  === 1 ? true  : false;
      } )
      .catch(this.handleError);
  }


  GetCacheDataByKey(key: string): Observable<CacheDataInfo> {
    const options = this.getRequestOptions(environment.WebApiUrl + `/CurrentCacheByKey?key=${key}`);

    return this.http
      .get(options.url, options)
      .map(res => { return <CacheDataInfo>res.json(); })
      .catch(this.handleError);
  }

  ForceUpdateByKey(key: string): Observable<string[][]> {
    const options = this.getRequestOptions(environment.WebApiUrl + `/UpdateCacheDataItemKey?key=${key}`);
    return this.http
      .get(options.url, options)
      .map(res => { return <string[][]>res.json(); })
      .catch(this.handleError);
  }

  GetManagedDataReply(name: string, params: Params): Observable<ManagedDataReply> {

    const options = this.getRequestOptions(environment.WebApiUrl + '/ManagedData/' + name);
    Object.keys(params).forEach( k => {
      if (options.params === undefined) {
        options.params = new URLSearchParams();
      }
      options.params.append(k, params[k]);
    });

    this.appStateService.appendLog(
      `GetManagedDataReply call for ${name} with params ${UtilityFunctions.SortedParamsString(params)} via URL ${options.url}`,
      3);

    UtilityFunctions.DebugLog(`this.http.get ${options.url} ...`);
    return this.http
      .get(options.url, options)
      .map(res => {
        const reply = <ManagedDataReply>res.json();
        const asDataSet = <DataSet>reply.CacheData.Payload;
        if (asDataSet !== undefined) {
          this.appStateService.appendLog(`GetManagedDataReply rowcount ${asDataSet.data.length } `, 3);
        }
        return reply;
      } )
      .catch(this.handleError);
  }

  private getRequestOptions(url: string) {
    return new RequestOptions({
        headers: this.getAuthHeadersOrLogin(),
        url: url,
        method: RequestMethod.Get});
  }

  private getAuthHeadersOrLogin(): Headers {

    if (!this.adalService.userInfo.isAuthenticated || !this.freshAuthentication) {
      this.appStateService.appendLog('user is not authenticated or auth is stale: redirecting to login', 2);
      const qIndex = window.location.href.indexOf('?');
      if (qIndex > -1) {
        this.sessionStorageService.store('query.parameters', decodeURI(window.location.href.substr(qIndex + 1)));
      } else {
        this.sessionStorageService.clear('query.parameters');
      }
      this.adalService.login();
      return undefined;
    } else {
      return new Headers({
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + this.adalService.getCachedToken(this.secretService.adalConfig.clientId)
      });
    }
  }

  private handleError (error: Response | any) {

    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

}
