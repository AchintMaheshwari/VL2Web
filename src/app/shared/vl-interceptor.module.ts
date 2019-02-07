import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

@NgModule({
  declarations: [],
  exports: [
    CommonModule,    
  ]
})

@Injectable()
export class VlInterceptorModule implements HttpInterceptor {
constructor() { }

intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

console.log("intercepted request ... ");

// Clone the request to add the new header.
const authReq = req.clone({ headers: req.headers  
  // .set("Access-Control-Expose-Headers", "Access-Control-*")  
  // .set("Content-Type","application/json; charset=utf-8")  
  // .set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, X-Requested-With, Authorization, Auth0-Client, X-Request-Language")
  // .set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")  
  // .set("Access-Control-Allow-Origin", "*")
});

console.log("Sending request with new header now ...");

//send the newly created request
return next.handle(authReq)
.catch((error, caught) => {
//intercept the respons error and displace it to the console
console.log("Error Occurred");
console.log(error);
//return the error to the method that called it
return Observable.throw(error);
}) as any;
}
}