import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RemoteServiceService {

  constructor(public http: HttpClient) { }

  getRemoteData()
  {
    return this.http.get('https://radiotalky.com/wp-json/wp/v2/posts?categories=49');
  }


}
