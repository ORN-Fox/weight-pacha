import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ToastService } from './toast.service';

describe('ToastService', () => {
    let service: ToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot({})
            ],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(ToastService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
