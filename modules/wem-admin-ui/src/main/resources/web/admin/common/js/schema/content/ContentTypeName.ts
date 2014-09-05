module api.schema.content {

    export class ContentTypeName implements api.Equitable {

        static SITE:string = 'system-0.0.0:site';

        static IMAGE:string = 'system-0.0.0:image';

        private value: string;

        constructor(name: string) {
            this.value = name
        }

        toString(): string {
            return this.value;
        }

        equals(o: api.Equitable): boolean {

            if (!api.ObjectHelper.iFrameSafeInstanceOf(o, ContentTypeName)) {
                return false;
            }

            var other = <ContentTypeName>o;

            if (!api.ObjectHelper.stringEquals(this.value, other.value)) {
                return false;
            }

            return true;
        }
    }
}