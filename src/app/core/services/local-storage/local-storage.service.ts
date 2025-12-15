import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {}

  isItemExist(key: string): boolean {
    return this.getItem(key) !== null;
  }

  getItem(key: string): any | null {
    let fallbackValue = null;

    try { 
      let result = localStorage.getItem(key);
      if (result) {
        return JSON.parse(result);
      }
      return fallbackValue;
    } catch(e) {
      return fallbackValue;
    }
  }

  setItem(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch(e) {
      console.error('Unable to set item in local storage', key);
    }
  }

}
