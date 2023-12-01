import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DbConnectService {
  example = 'http://localhost:7000/example';
  query = 'http://localhost:7000/query/';
  delayPerMonth = 'http://localhost:7000/delayPerMonth/';
  years = 'http://localhost:7000/getYears';
  cities = 'http://localhost:7000/getCities';
  mostDelayPerYear = 'http://localhost:7000/mostDelayPerYear/';
  delayTypeCompareByYear = 'http://localhost:7000/delayTypeCompareByYear/';
  securityDelays = 'http://localhost:7000/securityDelays/';
  dissatisfaction = 'http://localhost:7000/dissatisfaction/';

  constructor(private http: HttpClient) { }

  getExample() : Observable<object> {
    return this.http.get(this.example);
  }

  getYears() : Observable<object> {
    return this.http.get(this.years);
  }

  getCities() : Observable<object> {
    return this.http.get(this.cities);
  }

  getDelayPerMonth(q : string) : Observable<object> {
    const queryToExecute = this.delayPerMonth + q;
    return this.http.get(queryToExecute);
  }

  getMostDelayPerYear(q : string) : Observable<object> {
    const queryToExecute = this.mostDelayPerYear + q;
    return this.http.get(queryToExecute);
  }

  getDelayTypeCompareByYear(q : string) : Observable<object> {
    const queryToExecute = this.delayTypeCompareByYear + q;
    return this.http.get(queryToExecute);
  }

  getSecurityDelays(q : string) : Observable<object> {
    const queryToExecute = this.securityDelays + q;
    return this.http.get(queryToExecute);
  }

  getDissatisfaction(q : string) : Observable<object> {
    const queryToExecute = this.dissatisfaction + q;
    return this.http.get(queryToExecute);
  }

  executeQuery(q: string) : Observable<object> {
    const queryToExecute = this.query + q;
    return this.http.get(queryToExecute);
  }
}
