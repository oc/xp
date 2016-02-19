package com.enonic.xp.portal.mapping;

import java.util.Objects;

import org.apache.commons.lang.StringUtils;

import com.google.common.annotations.Beta;

import com.enonic.xp.content.Content;
import com.enonic.xp.data.Property;
import com.enonic.xp.data.Value;
import com.enonic.xp.data.ValueFactory;
import com.enonic.xp.data.ValueType;
import com.enonic.xp.data.ValueTypes;

@Beta
public final class MappingConstraint
{
    private static final String SEPARATOR = ":";

    private static final String ID_PROPERTY = "_id";

    private static final String NAME_PROPERTY = "_name";

    private static final String PATH_PROPERTY = "_path";

    private final String id;

    private final String value;

    private MappingConstraint( final String id, final String value )
    {
        this.id = id;
        this.value = value;
    }

    public boolean matches( final Content content )
    {
        if ( ID_PROPERTY.equals( this.id ) )
        {
            return content.getId().toString().equals( trimQuotes( this.value ) );
        }
        else if ( NAME_PROPERTY.equals( this.id ) )
        {
            return content.getName().toString().equals( trimQuotes( this.value ) );
        }
        else if ( PATH_PROPERTY.equals( this.id ) )
        {
            return content.getPath().toString().equals( trimQuotes( this.value ) );
        }
        else
        {
            final Property prop = content.getData().getProperty( id );
            if ( prop == null || prop.getValue() == null )
            {
                return false;
            }

            final Value propertyValue = convert( trimQuotes( this.value ), prop.getValue().getType() );
            return propertyValue != null && prop.getValue().equals( propertyValue );
        }
    }

    private Value convert( final String value, final ValueType type )
    {
        if ( type == ValueTypes.XML )
        {
            return ValueFactory.newXml( ValueTypes.XML.convert( value ) );
        }
        if ( type == ValueTypes.LOCAL_DATE )
        {
            return ValueFactory.newLocalDate( ValueTypes.LOCAL_DATE.convert( value ) );
        }
        if ( type == ValueTypes.LOCAL_TIME )
        {
            return ValueFactory.newLocalTime( ValueTypes.LOCAL_TIME.convert( value ) );
        }
        if ( type == ValueTypes.LOCAL_DATE_TIME )
        {
            return ValueFactory.newLocalDateTime( ValueTypes.LOCAL_DATE_TIME.convert( value ) );
        }
        if ( type == ValueTypes.DATE_TIME )
        {
            return ValueFactory.newDateTime( ValueTypes.DATE_TIME.convert( value ) );
        }
        if ( type == ValueTypes.LONG )
        {
            return ValueFactory.newLong( ValueTypes.LONG.convert( value ) );
        }
        if ( type == ValueTypes.DOUBLE )
        {
            return ValueFactory.newDouble( ValueTypes.DOUBLE.convert( value ) );
        }
        if ( type == ValueTypes.GEO_POINT )
        {
            return ValueFactory.newGeoPoint( ValueTypes.GEO_POINT.convert( value ) );
        }
        if ( type == ValueTypes.BOOLEAN )
        {
            return ValueFactory.newBoolean( ValueTypes.BOOLEAN.convert( value ) );
        }
        if ( type == ValueTypes.REFERENCE )
        {
            return ValueFactory.newReference( ValueTypes.REFERENCE.convert( value ) );
        }
        if ( type == ValueTypes.LINK )
        {
            return ValueFactory.newLink( ValueTypes.LINK.convert( value ) );
        }
        if ( type == ValueTypes.BINARY_REFERENCE )
        {
            return ValueFactory.newBinaryReference( ValueTypes.BINARY_REFERENCE.convert( value ) );
        }
        return ValueFactory.newString( value );
    }

    private String trimQuotes( final String value )
    {
        final int length = value.length();
        if ( ( length > 1 ) && ( value.charAt( 0 ) == '\'' ) && ( value.charAt( length - 1 ) == '\'' ) )
        {
            return value.substring( 1, length - 1 );
        }
        else
        {
            return value;
        }
    }

    public static MappingConstraint parse( final String expression )
    {
        if ( !expression.contains( SEPARATOR ) )
        {
            throw new IllegalArgumentException( "Invalid match expression: " + expression );
        }
        final String id = StringUtils.substringBefore( expression, SEPARATOR ).trim();
        final String value = StringUtils.substringAfter( expression, SEPARATOR ).trim();
        if ( StringUtils.isBlank( id ) )
        {
            throw new IllegalArgumentException( "Invalid match expression: " + expression );
        }
        return new MappingConstraint( id, value );
    }

    @Override
    public boolean equals( final Object o )
    {
        if ( this == o )
        {
            return true;
        }
        if ( o == null || getClass() != o.getClass() )
        {
            return false;
        }
        final MappingConstraint that = (MappingConstraint) o;
        return Objects.equals( id, that.id ) && Objects.equals( value, that.value );
    }

    @Override
    public int hashCode()
    {
        return Objects.hash( id, value );
    }

    @Override
    public String toString()
    {
        return id + SEPARATOR + value;
    }
}
