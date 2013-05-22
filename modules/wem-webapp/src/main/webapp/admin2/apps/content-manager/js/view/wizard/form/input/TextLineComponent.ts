module admin.ui {

    export class TextLine extends admin.ui.BaseInputComponent {

        ext;

        private property:API_content_data.Property;

        constructor(input:API_schema_content_form.Input) {
            super(input);

            var fieldContainer = new Ext.form.FieldContainer();
            fieldContainer.setFieldLabel('');
            fieldContainer.labelWidth = 110;
            fieldContainer.labelPad = 0;
            // more base stuff...

            var textField = new Ext.form.Text();
            textField.enableKeyEvents = true;
            textField.displayNameSource = true;
            //textField.name = this.name;
            //textField.value = this.value;
            fieldContainer.add(textField);

            this.ext = fieldContainer;
        }

        setValue(value) {
            this.ext.down('textfield').setValue(value);
        }
    }
}