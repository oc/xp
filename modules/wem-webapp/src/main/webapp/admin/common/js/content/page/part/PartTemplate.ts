module api.content.page.part{

    export class PartTemplate extends api.content.page.Template<PartTemplateKey,PartTemplateName> {

        constructor(builder:PartTemplateBuilder) {
            super(builder);
        }
    }

    export class PartTemplateBuilder extends api.content.page.TemplateBuilder<PartTemplateKey,PartTemplateName> {

        descriptor:PartDescriptor;

        public fromJson(json: api.content.page.part.json.PartTemplateJson): PartTemplateBuilder {
            this.setKey(PartTemplateKey.fromString(json.key));
            this.setName(new PartTemplateName(json.name));
            this.setDisplayName(json.displayName);
            this.setDescriptorModuleResourceKey(api.module.ModuleResourceKey.fromString(json.descriptorModuleResourceKey));
            this.descriptor = new PartDescriptorBuilder().fromJson(json.descriptor).build();
            return this;
        }

        public build(): PartTemplate {
            return new PartTemplate(this);
        }
    }
}