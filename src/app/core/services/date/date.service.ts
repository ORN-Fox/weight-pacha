import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  static getMomentFromStringDate(date: string | null): moment.Moment | null {
    if (date) {
      return moment(date);
    }
    return null;
  }

  static getStringDateFromMoment(date: moment.Moment | null | undefined): string | null {
    if (date instanceof moment && date?.isValid()) {
      return date.toISOString();
    }
    return null;
  }
  
}
