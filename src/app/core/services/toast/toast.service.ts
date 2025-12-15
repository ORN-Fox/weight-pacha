import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    readonly translateService = inject(TranslateService);

    swalBulma: typeof Swal;

    constructor() {
        this.swalBulma = Swal.mixin({
            customClass: {
                confirmButton: "button",
                cancelButton: "button is-success mr-3"
            },
            buttonsStyling: false
        });
    }

    showConfirm(): Promise<SweetAlertResult<any>> {
        return this.swalBulma.fire({
            title: this.translateService.instant('commons.areYouSure'),
            text: this.translateService.instant('commons.youWontBeAbleToRevertThis'),
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: this.translateService.instant('commons.actions.no'),
            confirmButtonText: this.translateService.instant('commons.actions.yes')
        });
    }

    showToast(icon: SweetAlertIcon, title: string | HTMLElement | JQuery | undefined) {
        this.getToastConfig().fire({
            icon,
            title
        });
    }

    private getToastConfig(): typeof Swal {
        return this.swalBulma.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
    }

}