package com.enonic.wem.api.content.type.component.inputtype;


import com.google.common.base.Objects;

import com.enonic.wem.api.content.data.Data;
import com.enonic.wem.api.content.datatype.InvalidValueTypeException;
import com.enonic.wem.api.content.type.component.InvalidValueException;

public abstract class BaseInputType
    implements InputType
{
    private final String name;

    private Class configClass;

    private boolean builtIn;

    BaseInputType()
    {
        this.name = resolveName();
        this.builtIn = resolveBuiltIn();
    }

    BaseInputType( final Class configClass )
    {
        this.name = resolveName();
        this.builtIn = resolveBuiltIn();
        this.configClass = configClass;
    }

    @Override
    public final String getName()
    {
        return name;
    }

    @Override
    public boolean isBuiltIn()
    {
        return builtIn;
    }

    @Override
    public final boolean requiresConfig()
    {
        return configClass != null;
    }

    @Override
    public final Class requiredConfigClass()
    {
        return configClass;
    }

    public AbstractInputTypeConfigSerializerJson getInputTypeConfigJsonGenerator()
    {
        return null;
    }

    @Override
    public AbstractInputTypeConfigSerializerXml getInputTypeConfigXmlGenerator()
    {
        return null;
    }

    public abstract void checkValidity( Data data )
        throws InvalidValueTypeException, InvalidValueException;

    @Override
    public String toString()
    {
        return name;
    }

    @Override
    public boolean equals( final Object o )
    {
        if ( this == o )
        {
            return true;
        }
        if ( !( o instanceof BaseInputType ) )
        {
            return false;
        }

        final BaseInputType that = (BaseInputType) o;

        return Objects.equal( this.getClass(), that.getClass() );
    }

    @Override
    public int hashCode()
    {
        return Objects.hashCode( this.getClass() );
    }

    private String resolveName()
    {
        return this.getClass().getSimpleName();
    }

    private boolean resolveBuiltIn()
    {
        return this.getClass().getPackage().equals( BaseInputType.class.getPackage() );
    }
}
