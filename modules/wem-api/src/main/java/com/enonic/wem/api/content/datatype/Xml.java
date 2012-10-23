package com.enonic.wem.api.content.datatype;


public class Xml
    extends BaseDataType
{
    Xml( int key )
    {
        super( key, JavaType.STRING );
    }

    @Override
    public String getIndexableString( final Object value )
    {
        return value.toString();
    }

    @Override
    public Object ensureTypeOfValue( final Object value )
    {
        return toXml( value );
    }

    public String toXml( final Object value )
    {
        if ( hasCorrectType( value ) )
        {
            return (String) value;
        }
        else
        {
            throw new InconvertibleValueException( value, this );
        }
    }
}
