module api.content.page {

    export class GetPageTemplateByKeyRequest extends PageTemplateResourceRequest<api.content.page.PageTemplateJson> {

        private siteTemplateKey: api.content.site.template.SiteTemplateKey;

        private pageTemplateKey: api.content.page.PageTemplateKey;

        constructor(pageTemplateKey: api.content.page.PageTemplateKey) {
            super();
            super.setMethod("GET");
            this.pageTemplateKey = pageTemplateKey;
        }

        setSiteTemplateKey(value: api.content.site.template.SiteTemplateKey): GetPageTemplateByKeyRequest {
            this.siteTemplateKey = value;
            return this;
        }

        validate() {
            api.util.assertNotNull(this.siteTemplateKey, "siteTemplateKey cannot be null");
            api.util.assertNotNull(this.pageTemplateKey, "pageTemplateKey cannot be null");
        }

        getParams(): Object {
            return {
                siteTemplateKey: this.siteTemplateKey.toString(),
                key: this.pageTemplateKey.toString()
            };
        }

        getRequestPath(): api.rest.Path {
            return super.getResourcePath();
        }

        sendAndParse(): Q.Promise<api.content.page.PageTemplate> {

            return this.send().then((response: api.rest.JsonResponse<api.content.page.PageTemplateJson>) => {
                return this.fromJsonToPageTemplate(response.getResult());
            });
        }
    }
}