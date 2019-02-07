import { Injectable } from '@angular/core';
import { CommonService } from '../common/common.service';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Options } from 'selenium-webdriver/opera';

@Injectable()
export class CrudService {  

  headers = null;
  constructor(public http : HttpClient ,public commonService : CommonService ) {         
  }

  get<T>(url : string , params? : HttpParams): Observable<T> {    
    
    return this.http.get<T>(this.commonService.apiDevEndpoint + url,
    {      
     params: params,
     headers: new HttpHeaders()//.set('Content-Type', 'application/json; charset=utf-8')
     .set("Authorization","Bearer "+ localStorage.getItem('access_token'))
    });  
  }  

  anonymousPost(url: string , body : any, params? : HttpParams, headers? : HttpHeaders ): Observable<any> {    
    return this.http.post(this.commonService.apiDevEndpoint +url, body,
    {
        params: params,
        headers: new HttpHeaders()
    });    
  }


  post(url: string , body : any, params? : HttpParams, headers? : HttpHeaders ): Observable<any> {    
    return this.http.post(this.commonService.apiDevEndpoint +url, body,
    {
        params: params,
        headers: new HttpHeaders()//.set('Content-Type', 'application/json; charset=utf-8')
        .set("Authorization","Bearer "+ localStorage.getItem('access_token'))
    });    
  }

  postBackManyChat(url: string , body : any, params? : HttpParams, headers? : HttpHeaders ): Observable<any> {    
    return this.http.post("https://api.manychat.com/fb/sending/sendContent", body,
    {
        params: params,
        headers: new HttpHeaders().set('Content-Type', 'application/json')
        .set("Authorization","Bearer 148101185718993:6b511729b18abf32396c11922ffaae78")
    });    
  }

  getAuth2AccessToken(url: string , body : any): Observable<any> {    
    return this.http.post(url, body,
    {
        headers: new HttpHeaders({'Content-Type':'application/x-www-form-urlencoded'}) 
    });   
  }

  postFile(url: string , body : any, params? : HttpParams, headers? : HttpHeaders ): Observable<any> {    
    return this.http.post(this.commonService.apiDevEndpoint +url, body,
    {
        params: params,
        headers: new HttpHeaders()//.set('Content-Type', 'application/json; charset=utf-8')
        //.set("Authorization","Bearer "+ localStorage.getItem('access_token'))
    });    
  }
}
