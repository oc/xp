package com.enonic.wem.core.content;

import java.io.IOException;
import java.io.InputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Preconditions;
import com.google.common.io.ByteSource;

import com.enonic.wem.api.blob.Blob;
import com.enonic.wem.api.content.Content;
import com.enonic.wem.api.content.ContentDataValidationException;
import com.enonic.wem.api.content.ContentUpdatedEvent;
import com.enonic.wem.api.content.EditableContent;
import com.enonic.wem.api.content.UpdateContentParams;
import com.enonic.wem.api.content.attachment.Attachment;
import com.enonic.wem.api.content.attachment.Attachments;
import com.enonic.wem.api.content.thumb.Thumbnail;
import com.enonic.wem.api.node.Node;
import com.enonic.wem.api.node.UpdateNodeParams;
import com.enonic.wem.api.schema.content.ContentType;
import com.enonic.wem.api.schema.content.ContentTypeName;
import com.enonic.wem.api.schema.content.GetContentTypeParams;
import com.enonic.wem.api.schema.content.validator.DataValidationError;
import com.enonic.wem.api.schema.content.validator.DataValidationErrors;

import static com.enonic.wem.api.content.Content.newContent;

final class UpdateContentCommand
    extends AbstractContentCommand
{
    private static final String THUMBNAIL_MIME_TYPE = "image/png";

    private final static Logger LOG = LoggerFactory.getLogger( UpdateContentCommand.class );

    private final UpdateContentParams params;

    private UpdateContentCommand( final Builder builder )
    {
        super( builder );
        this.params = builder.params;
    }

    public static Builder create( final UpdateContentParams params )
    {
        return new Builder( params );
    }

    Content execute()
    {
        params.validate();

        return doExecute();
    }

    private Content doExecute()
    {
        final Content contentBeforeChange = getContent( params.getContentId() );

        Content editedContent;

        final EditableContent editableContent = new EditableContent( contentBeforeChange );
        this.params.getEditor().edit( editableContent );
        editedContent = editableContent.build();

        if ( contentBeforeChange.equals( editedContent ) )
        {
            return contentBeforeChange;
        }

        validateEditedContent( editedContent );

        editedContent = newContent( editedContent ).modifier( this.params.getModifier() ).build();
        if ( !editedContent.hasThumbnail() )
        {
            final Thumbnail mediaThumbnail = resolveMediaThumbnail( editedContent );
            if ( mediaThumbnail != null )
            {
                editedContent = newContent( editedContent ).thumbnail( mediaThumbnail ).build();
            }
        }

        final Attachments attachments;

        if ( this.params.getUpdateAttachments() != null )
        {
            attachments = this.params.getUpdateAttachments().getAttachments();
        }
        else
        {
            attachments = contentBeforeChange.getAttachments();
        }

        final UpdateNodeParams updateNodeParams = translator.toUpdateNodeCommand( editedContent, attachments );

        final Node editedNode = this.nodeService.update( updateNodeParams );

        eventPublisher.publish( new ContentUpdatedEvent( editedContent.getId() ) );

        return translator.fromNode( editedNode );
    }

    private void validateEditedContent( final Content edited )
    {
        if ( !edited.isDraft() )
        {
            validateContentData( edited );
        }
    }

    private void validateContentData( final Content modifiedContent )
    {
        final DataValidationErrors dataValidationErrors = validate( modifiedContent.getType(), modifiedContent.getData() );

        for ( DataValidationError error : dataValidationErrors )
        {
            LOG.info( "*** DataValidationError: " + error.getErrorMessage() );
        }
        if ( dataValidationErrors.hasErrors() )
        {
            throw new ContentDataValidationException( dataValidationErrors.getFirst().getErrorMessage() );
        }
    }

    private Thumbnail resolveMediaThumbnail( final Content content )
    {
        final ContentType contentType = getContentType( content.getType() );

        if ( contentType.getSuperType() == null )
        {
            return null;
        }

        if ( contentType.getSuperType().isMedia() )
        {
            Attachment mediaAttachment = this.params.getAttachment( content.getName().toString() );

            if ( mediaAttachment == null )
            {
                mediaAttachment = this.params.getUpdateAttachments().getAttachments().first();
            }
            if ( mediaAttachment != null )
            {
                return createThumbnail( mediaAttachment );
            }
        }
        return null;
    }

    private Thumbnail createThumbnail( final Attachment attachment )
    {
        final Blob originalImage = blobService.get( attachment.getBlobKey() );
        final ByteSource source = ThumbnailFactory.resolve( originalImage );
        final Blob thumbnailBlob;
        try (final InputStream stream = source.openStream())
        {
            thumbnailBlob = blobService.create( stream );
        }
        catch ( IOException e )
        {
            throw new RuntimeException( "Failed to create blob for thumbnail attachment: " + attachment.getName() +
                                            ( attachment.getExtension() == null || attachment.getExtension().equals( "" )
                                                ? ""
                                                : "." + attachment.getExtension() ), e );
        }

        return Thumbnail.from( thumbnailBlob.getKey(), THUMBNAIL_MIME_TYPE, thumbnailBlob.getLength() );
    }

    private ContentType getContentType( final ContentTypeName contentTypeName )
    {
        return contentTypeService.getByName( new GetContentTypeParams().contentTypeName( contentTypeName ) );
    }

    public static class Builder
        extends AbstractContentCommand.Builder<Builder>
    {
        private final UpdateContentParams params;

        public Builder( final UpdateContentParams params )
        {
            this.params = params;
        }

        void validate()
        {
            Preconditions.checkNotNull( params );
        }

        public UpdateContentCommand build()
        {
            validate();
            return new UpdateContentCommand( this );
        }

    }

}
