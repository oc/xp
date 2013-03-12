package com.enonic.wem.api.content.data.type;


import com.enonic.wem.api.content.data.Value;

public class Text
    extends BaseDataType
{
    Text( int key )
    {
        super( key, JavaType.STRING );
    }

    public Value toString( final Value value )
    {
        if ( isValueOfExpectedJavaClass( value ) )
        {
            return value;
        }
        else
        {
            throw new InconvertibleValueException( value, this );
        }
    }
}
