package com.enonic.wem.api.content.datatype;


import com.enonic.wem.api.content.data.Data;

public class InvalidValueTypeException
    extends Exception
{
    public InvalidValueTypeException( final JavaType.BaseType javaType, final Data data )
    {
        super( buildMessage( javaType, data ) );
    }

    private static String buildMessage( final JavaType.BaseType javaType, final Data data )
    {
        return "Invalid value type at path [" + data.getPath() + "] " + data.getValue().getClass() + ", expected " + javaType.getType();
    }
}
