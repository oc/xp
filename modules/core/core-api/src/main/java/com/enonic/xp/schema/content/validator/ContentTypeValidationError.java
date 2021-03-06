package com.enonic.xp.schema.content.validator;

import com.google.common.annotations.Beta;

import com.enonic.xp.schema.content.ContentTypeName;

@Beta
public final class ContentTypeValidationError
{
    private final String validationMessage;

    public ContentTypeValidationError( final String validationMessage, final ContentTypeName contentTypeName )
    {
        this.validationMessage = buildMessage( contentTypeName, validationMessage );
    }

    public String getErrorMessage()
    {
        return validationMessage;
    }

    private static String buildMessage( final ContentTypeName contentTypeName, final String message )
    {
        final StringBuilder s = new StringBuilder();
        s.append( "Invalid content type: [" ).append( contentTypeName ).append( "]: " ).append( message );
        return s.toString();
    }
}
