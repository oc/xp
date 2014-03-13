module api.content.page.image {

    export class ImageDescriptorsResourceRequest extends ImageDescriptorResourceRequest<ImageDescriptorsJson> {

        fromJsonToImageDescriptors(json: ImageDescriptorsJson): ImageDescriptor[] {

            var array: api.content.page.image.ImageDescriptor[] = [];
            json.descriptors.forEach((descriptorJson: ImageDescriptorJson)=> {
                array.push(this.fromJsonToImageDescriptor(descriptorJson));
            });
            return array;
        }

        sendAndParse(): Q.Promise<ImageDescriptor[]> {

            var deferred = Q.defer<ImageDescriptor[]>();

            this.send().then((response: api.rest.JsonResponse<ImageDescriptorsJson>) => {
                deferred.resolve(this.fromJsonToImageDescriptors(response.getResult()));
            }).catch((response: api.rest.RequestError) => {
                deferred.reject(null);
            }).done();

            return deferred.promise;
        }
    }
}