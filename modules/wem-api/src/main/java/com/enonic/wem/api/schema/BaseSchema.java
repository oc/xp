package com.enonic.wem.api.schema;


import java.time.Instant;

import com.google.common.base.Preconditions;

import com.enonic.wem.api.Icon;
import com.enonic.wem.api.account.UserKey;

public abstract class BaseSchema<T extends SchemaName>
    implements Schema
{
    final T name;

    final SchemaKey schemaKey;

    final String displayName;

    final String description;

    final Instant createdTime;

    final Instant modifiedTime;

    final UserKey creator;

    final UserKey modifier;

    final Icon icon;

    protected BaseSchema( final Builder builder )
    {
        this.name = (T) builder.name;
        this.displayName = builder.displayName;
        this.description = builder.description;
        this.createdTime = builder.createdTime;
        this.modifiedTime = builder.modifiedTime;
        this.creator = builder.creator;
        this.modifier = builder.modifier;
        this.icon = builder.schemaIcon;
        this.schemaKey = SchemaKey.from( builder.type, builder.name );
    }

    @Override
    public SchemaKey getSchemaKey()
    {
        return this.schemaKey;
    }

    @Override
    public T getName()
    {
        return name;
    }

    @Override
    public SchemaKind getType()
    {
        return this.schemaKey.getType();
    }

    @Override
    public String getDisplayName()
    {
        return displayName;
    }

    @Override
    public String getDescription()
    {
        return description;
    }

    @Override
    public Instant getCreatedTime()
    {
        return createdTime;
    }

    @Override
    public Instant getModifiedTime()
    {
        return modifiedTime;
    }

    @Override
    public UserKey getCreator()
    {
        return creator;
    }

    @Override
    public UserKey getModifier()
    {
        return modifier;
    }

    @Override
    public Icon getIcon()
    {
        return icon;
    }

    public static class Builder<T extends Builder, SCHEMA_NAME extends SchemaName>
    {
        protected SCHEMA_NAME name;

        private final SchemaKind type;

        private String displayName;

        private String description;

        private Instant createdTime;

        private Instant modifiedTime;

        private UserKey creator;

        private UserKey modifier;

        private Icon schemaIcon;

        protected Builder( final SchemaKind type )
        {
            this.type = type;
        }

        public Builder( final BaseSchema schema )
        {
            Preconditions.checkNotNull( schema, "schema cannot be null" );
            this.name = (SCHEMA_NAME) schema.name;
            this.type = schema.getType();
            this.displayName = schema.displayName;
            this.description = schema.description;
            this.createdTime = schema.createdTime;
            this.modifiedTime = schema.modifiedTime;
            this.creator = schema.creator;
            this.modifier = schema.modifier;
            this.schemaIcon = schema.icon;
        }

        private T getThis()
        {
            return (T) this;
        }

        public T name( final SCHEMA_NAME value )
        {
            this.name = value;
            return getThis();
        }

        public T displayName( String value )
        {
            this.displayName = value;
            return getThis();
        }

        public T description( String value )
        {
            this.description = value;
            return getThis();
        }

        public T createdTime( Instant value )
        {
            this.createdTime = value;
            return getThis();
        }

        public T modifiedTime( Instant value )
        {
            this.modifiedTime = value;
            return getThis();
        }

        public T creator( UserKey value )
        {
            this.creator = value;
            return getThis();
        }

        public T modifier( UserKey value )
        {
            this.modifier = value;
            return getThis();
        }

        public T icon( Icon schemaIcon )
        {
            this.schemaIcon = schemaIcon;
            return getThis();
        }
    }
}
