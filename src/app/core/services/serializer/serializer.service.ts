import { Injectable } from '@angular/core';
import { isEmpty } from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class SerializerService {

    constructor() { }

    serializeList(list: any[]) {
        if (isEmpty(list)) {
            return list;
        }

        let serializeList: any[] = [];
        list.forEach(item => {
            serializeList.push(item.serializeForSave());
        });
        return serializeList;
    }

}