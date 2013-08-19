module app_wizard {

    export class ContentWizardPanel extends api_app_wizard.WizardPanel {

        private static DEFAULT_CONTENT_ICON_URL:string = "resources/images/icons/128x128/default_content.png";

        private parentContent:api_remote_content.Content;

        private renderingNew:bool;

        private contentType:api_remote_contenttype.ContentType;

        private duplicateAction:api_ui.Action;

        private deleteAction:api_ui.Action;

        private formIcon:api_app_wizard.FormIcon;

        private toolbar:ContentWizardToolbar;

        private contentForm:ContentForm;

        private schemaPanel:api_ui.Panel;

        private modulesPanel:api_ui.Panel;

        private templatesPanel:api_ui.Panel;

        constructor(id:string, contentType:api_remote_contenttype.ContentType, parentContent:api_remote_content.Content) {

            this.parentContent = parentContent;
            this.contentType = contentType;
            this.formIcon = new api_app_wizard.FormIcon(ContentWizardPanel.DEFAULT_CONTENT_ICON_URL, "Click to upload icon", "rest/upload");

            var closeAction = new api_app_wizard.CloseAction(this);
            var saveAction = new api_app_wizard.SaveAction(this);

            this.duplicateAction = new DuplicateContentAction();
            this.deleteAction = new DeleteContentAction();

            this.toolbar = new ContentWizardToolbar({
                saveAction: saveAction,
                duplicateAction: this.duplicateAction,
                deleteAction: this.deleteAction,
                closeAction: closeAction
            });

            var livePanel = new LiveFormPanel();

            super({
                formIcon: this.formIcon,
                toolbar: this.toolbar,
                livePanel: livePanel
            });

            this.setDisplayName("New Content");
            this.setName(id);
            this.setAutogenerateDisplayName(true);
            this.setAutogenerateName(true);

            console.log("ContentWizardPanel this.contentType: ", this.contentType);
            this.contentForm = new ContentForm(ContentTypeFactory.createForm(this.contentType.form));

            this.schemaPanel = new api_ui.Panel("schemaPanel");
            var h1El = new api_dom.H1El();
            h1El.getEl().setInnerHtml("TODO: schema");
            this.schemaPanel.appendChild(h1El);

            this.modulesPanel = new api_ui.Panel("modulesPanel");
            h1El = new api_dom.H1El();
            h1El.getEl().setInnerHtml("TODO: modules");
            this.modulesPanel.appendChild(h1El);

            this.templatesPanel = new api_ui.Panel("templatesPanel");
            h1El = new api_dom.H1El();
            h1El.getEl().setInnerHtml("TODO: templates");
            this.templatesPanel.appendChild(h1El);

            this.addStep(new api_app_wizard.WizardStep("Content", this.contentForm));
            this.addStep(new api_app_wizard.WizardStep("Schemas", this.schemaPanel));
            this.addStep(new api_app_wizard.WizardStep("Modules", this.modulesPanel));
            this.addStep(new api_app_wizard.WizardStep("Templates", this.templatesPanel));

            ShowContentLiveEvent.on((event) => {
                this.toggleFormPanel(false);
            });

            ShowContentFormEvent.on((event) => {
                this.toggleFormPanel(true);
            });
        }

        renderNew() {
            this.contentForm.renderNew();
            this.renderingNew = true;
        }

        renderExisting(result:api_remote_content.GetResult) {

            this.renderingNew = false;

            var content:api_remote_content.Content = result.content[0];

            this.setDisplayName(content.displayName);
            this.setName(content.name);
            this.formIcon.setSrc(content.iconUrl);

            // setup displayName and name to be generated automatically
            // if corresponding values are empty
            this.setAutogenerateDisplayName(!content.displayName);
            this.setAutogenerateName(!content.name);

            console.log("ContentWizardPanel.renderExisting contentData: ", content.data);

            var contentData:api_content_data.ContentData = app_wizard.ContentDataFactory.createContentData(content.data);

            this.contentForm.renderExisting(contentData);
        }

        persistNewItem(successCallback?:() => void) {

            var flattenedContentData:any = {};
            this.flattenData(this.contentForm.getContentData(), flattenedContentData);
            console.log("persistNewItem flattenedContentData: ", flattenedContentData);

            var createParams:api_remote_content.CreateOrUpdateParams = {
                contentName: this.getName(),
                parentContentPath: this.parentContent.path,
                qualifiedContentTypeName: this.contentType.qualifiedName,
                displayName: this.getDisplayName(),
                contentData: flattenedContentData
            };

            api_remote_content.RemoteContentService.content_createOrUpdate(createParams, () => {
                api_notify.showFeedback('Content was created!');
            });
        }

        updatePersistedItem(successCallback?:() => void) {

            var updateParams:api_remote_content.CreateOrUpdateParams = {
                contentName: this.getName(),
                parentContentPath: this.parentContent.path,
                qualifiedContentTypeName: this.contentType.qualifiedName,
                displayName: this.getDisplayName(),
                contentData: null
            };

            api_remote_content.RemoteContentService.content_createOrUpdate(updateParams, () => {
                api_notify.showFeedback('Content was updated!');
            });
        }

        private flattenData(contentData:api_content_data.DataSet, result:any) {
            contentData.getDataArray().forEach((data:api_content_data.Data) => {
                if (data instanceof api_content_data.Property) {
                    var property:api_content_data.Property = <api_content_data.Property>data;
                    result[data.getId().toString()] = property.getValue();
                }
                else if (data instanceof api_content_data.DataSet) {
                    var dataSet = <api_content_data.DataSet>data;
                    this.flattenData(dataSet, result);
                }
            });
        }
    }

    class LiveFormPanel extends api_ui.Panel {

            private frame:api_dom.IFrameEl;

            constructor(url?:string) {
                super("LiveFormPanel");
                this.addClass("live-form-panel");
                this.frame = new api_dom.IFrameEl();
                this.appendChild(this.frame);
                this.frame.setSrc("../../../dev/live-edit-page/bootstrap.jsp?edit=true");
            }

        }
}