module app.wizard {

    export class ContentTypeWizardPanel extends api.app.wizard.WizardPanel<api.schema.content.ContentType> {

        public static NEW_WIZARD_HEADER = "new content type";

        private formIcon: api.app.wizard.FormIcon;

        private contentTypeIcon: api.icon.Icon;

        private contentTypeWizardHeader: api.app.wizard.WizardHeaderWithName;

        private persistedConfig: string;

        private contentTypeForm: app.wizard.ContentTypeForm;

        constructor(tabId: api.app.AppBarTabId, persistedContentType: api.schema.content.ContentType,
                    callback: (wizard: ContentTypeWizardPanel) => void) {
            this.contentTypeWizardHeader = new api.app.wizard.WizardHeaderWithName();
            var defaultFormIconUrl = new api.schema.content.ContentTypeIconUrlResolver().resolveDefault();
            this.formIcon = new api.app.wizard.FormIcon(defaultFormIconUrl, "Click to upload icon",
                api.util.getRestUri("blob/upload"));
            this.formIcon.addListener({
                onUploadStarted: null,
                onUploadFinished: (uploadItem: api.ui.UploadItem) => {
                    this.contentTypeIcon = new api.icon.IconBuilder().
                        setBlobKey(uploadItem.getBlobKey()).setMimeType(uploadItem.getMimeType()).build();
                    this.formIcon.setSrc(api.util.getRestUri('blob/' + this.contentTypeIcon.getBlobKey()));
                }
            });
            var actions = new ContentTypeWizardActions(this);

            var mainToolbar = new ContentTypeWizardToolbar({
                saveAction: actions.getSaveAction(),
                duplicateAction: actions.getDuplicateAction(),
                deleteAction: actions.getDeleteAction(),
                closeAction: actions.getCloseAction()
            });

            this.contentTypeWizardHeader.setName(ContentTypeWizardPanel.NEW_WIZARD_HEADER);

            this.contentTypeForm = new ContentTypeForm();

            var steps: api.app.wizard.WizardStep[] = [];
            steps.push(new api.app.wizard.WizardStep("Content Type", this.contentTypeForm));

            super({
                tabId: tabId,
                persistedItem: persistedContentType,
                formIcon: this.formIcon,
                mainToolbar: mainToolbar,
                actions: actions,
                header: this.contentTypeWizardHeader,
                steps: steps
            }, () => {
                callback(this);
            });
        }

        setPersistedItem(contentType: api.schema.content.ContentType, callback: () => void) {
            super.setPersistedItem(contentType, () => {
                this.contentTypeWizardHeader.setName(contentType.getName());
                this.formIcon.setSrc(contentType.getIconUrl());

                new api.schema.content.GetContentTypeConfigByNameRequest(contentType.getContentTypeName()).send().
                    done((response: api.rest.JsonResponse <api.schema.content.GetContentTypeConfigResult>) => {
                        this.contentTypeForm.setFormData({"xml": response.getResult().contentTypeXml});
                        this.persistedConfig = response.getResult().contentTypeXml || "";
                        callback();
                    });
            });
        }

        persistNewItem(callback: (persistedContentType: api.schema.content.ContentType) => void) {
            var formData = this.contentTypeForm.getFormData();
            var createContentTypeRequest = new api.schema.content.CreateContentTypeRequest(this.contentTypeWizardHeader.getName(),
                formData.xml,
                this.contentTypeIcon);
            createContentTypeRequest.
                sendAndParse().
                done((contentType: api.schema.content.ContentType) => {

                    this.setPersistedItem(contentType, () => {

                        this.getTabId().changeToEditMode(contentType.getKey());
                        new app.wizard.ContentTypeCreatedEvent().fire();
                        api.notify.showFeedback('Content type was created!');

                        new api.schema.SchemaCreatedEvent(contentType).fire();

                        callback(contentType);
                    });
                });
        }

        updatePersistedItem(callback: (persistedContentType: api.schema.content.ContentType) => void) {

            var formData = this.contentTypeForm.getFormData();
            var newName = new api.schema.content.ContentTypeName(this.contentTypeWizardHeader.getName());
            var updateContentTypeRequest = new api.schema.content.UpdateContentTypeRequest(this.getPersistedItem().getContentTypeName(),
                newName,
                formData.xml,
                this.contentTypeIcon);

            updateContentTypeRequest.
                sendAndParse().
                done((contentType: api.schema.content.ContentType) => {

                    new app.wizard.ContentTypeUpdatedEvent().fire();
                    api.notify.showFeedback('Content type was saved!');

                    new api.schema.SchemaUpdatedEvent(contentType).fire();
                    this.setPersistedItem(contentType, () => {
                        callback(contentType);
                    });
                });
        }

        hasUnsavedChanges(): boolean {
            var persistedContentType: api.schema.content.ContentType = this.getPersistedItem();
            if (persistedContentType == undefined) {
                return true;
            } else {
                return !api.util.isStringsEqual(persistedContentType.getName(), this.contentTypeWizardHeader.getName())
                    || !api.util.isStringsEqual(api.util.removeCarriageChars(this.persistedConfig),
                                                api.util.removeCarriageChars(this.contentTypeForm.getFormData().xml));
            }
        }
    }
}