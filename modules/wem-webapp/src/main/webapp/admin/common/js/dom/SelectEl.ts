module api.dom {

    export class SelectEl extends FormInputEl {

        constructor(idPrefix?:string, className?:string) {
            super("select", idPrefix, className);
        }
    }
}
