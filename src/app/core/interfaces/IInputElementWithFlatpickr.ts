import { Instance } from "flatpickr/dist/types/instance";

export interface IInputElementWithFlatpickr extends HTMLElement {
    _flatpickr?: Instance;
}