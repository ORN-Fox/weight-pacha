import { AbstractControl, ValidatorFn } from "@angular/forms";
import moment from "moment";

export function reminderDateValidator(injectionDate: moment.Moment): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const reminderDate = moment(control.value);
      if (reminderDate && reminderDate.isSameOrBefore(injectionDate, 'day')) {
        return { 'sameOrBeforeReminderDateError': true };
      }
      return null;
    };
  }