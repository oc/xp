package com.enonic.wem.core.content;


import org.apache.commons.lang.StringUtils;

import com.google.common.base.Preconditions;

public abstract class ModuleBasedQualifiedName
{
    private String moduleName;

    private String localName;

    private String qualifiedName;


    public ModuleBasedQualifiedName( final String qualifiedName )
    {
        Preconditions.checkNotNull( qualifiedName, "QualifiedName is null" );
        Preconditions.checkArgument( StringUtils.isNotBlank( qualifiedName ), "QualifiedName is blank" );

        int colonPos = qualifiedName.indexOf( ":" );
        Preconditions.checkArgument( colonPos >= 0, "QualifiedName is missing colon: " + qualifiedName );
        Preconditions.checkArgument( colonPos > 0, "QualifiedName is missing module name: " + qualifiedName );
        Preconditions.checkArgument( colonPos < qualifiedName.length() - 1, "QualifiedName is missing locale name: " + qualifiedName );

        this.moduleName = qualifiedName.substring( 0, colonPos );
        this.localName = qualifiedName.substring( colonPos + 1, qualifiedName.length() );
        this.qualifiedName = qualifiedName;
    }

    public ModuleBasedQualifiedName( final String moduleName, final String localName )
    {
        this.moduleName = moduleName;
        this.localName = localName;
        this.qualifiedName = moduleName + ":" + localName;
    }

    public String getModuleName()
    {
        return moduleName;
    }

    public String getLocalName()
    {
        return localName;
    }

    public String toString()
    {
        return qualifiedName;
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

        final ModuleBasedQualifiedName that = (ModuleBasedQualifiedName) o;

        return qualifiedName.equals( that.qualifiedName );
    }

    @Override
    public int hashCode()
    {
        return qualifiedName.hashCode();
    }
}
