package com.enonic.wem.core.jcr.accounts;

public enum Gender
{
    MALE,
    FEMALE;

    public static Gender fromName( String name )
    {
        if ( name == null )
        {
            return null;
        }
        try
        {
            return Gender.valueOf( name );
        }
        catch ( IllegalArgumentException e )
        {
            return null;
        }
    }
}
