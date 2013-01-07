package com.enonic.wem.api.content;

import org.joda.time.DateMidnight;
import org.joda.time.DateTime;

import com.google.common.base.Objects;
import com.google.common.base.Preconditions;

import com.enonic.wem.api.account.UserKey;
import com.enonic.wem.api.content.data.BlobToKeyReplacer;
import com.enonic.wem.api.content.data.ContentData;
import com.enonic.wem.api.content.data.Data;
import com.enonic.wem.api.content.data.DataSet;
import com.enonic.wem.api.content.data.EntryPath;
import com.enonic.wem.api.content.data.MockBlobKeyResolver;
import com.enonic.wem.api.content.datatype.DataType;
import com.enonic.wem.api.content.datatype.DataTypes;
import com.enonic.wem.api.content.type.QualifiedContentTypeName;
import com.enonic.wem.api.content.versioning.ContentVersionId;

public final class Content
{
    private final String displayName;

    private final QualifiedContentTypeName type;

    private final ContentPath path;

    private final ContentId id;

    private final ContentData data;

    private final DateTime createdTime;

    private final DateTime modifiedTime;

    private final UserKey owner;

    private final UserKey modifier;

    private final ContentVersionId versionId;

    private Content( final Builder builder )
    {
        this.displayName = builder.displayName;
        this.type = builder.type;
        this.path = builder.path;
        this.id = builder.contentId;
        this.data = builder.data;
        this.createdTime = builder.createdTime;
        this.modifiedTime = builder.modifiedTime;
        this.owner = builder.owner;
        this.modifier = builder.modifier;
        this.versionId = builder.versionId;
    }

    public ContentPath getPath()
    {
        return path;
    }

    public QualifiedContentTypeName getType()
    {
        return type;
    }

    public String getName()
    {
        if ( path.hasName() )
        {
            return path.getName();
        }
        else
        {
            return null;
        }
    }

    public String getDisplayName()
    {
        return displayName;
    }

    public DateTime getCreatedTime()
    {
        return createdTime;
    }

    public DateTime getModifiedTime()
    {
        return modifiedTime;
    }

    public UserKey getModifier()
    {
        return modifier;
    }

    public UserKey getOwner()
    {
        return owner;
    }

    public ContentData getData()
    {
        return data;
    }

    public ContentId getId()
    {
        return id;
    }

    public ContentVersionId getVersionId()
    {
        return versionId;
    }

    public void setData( final String path, final String value )
    {
        this.data.setData( new EntryPath( path ), value, DataTypes.TEXT );
    }

    public void setData( final String path, final DateMidnight value )
    {
        this.data.setData( new EntryPath( path ), value, DataTypes.DATE );
    }

    public void setData( final String path, final Long value )
    {
        this.data.setData( new EntryPath( path ), value, DataTypes.WHOLE_NUMBER );
    }

    public void setData( final String path, final Double value )
    {
        this.data.setData( new EntryPath( path ), value, DataTypes.DECIMAL_NUMBER );
    }

    public void setData( final String path, final Object value, DataType dataType )
    {
        this.data.setData( new EntryPath( path ), value, dataType );
    }

    public Data getData( final String path )
    {
        return this.data.getData( new EntryPath( path ) );
    }

    public String getValueAsString( final String path )
    {
        return this.data.getValueAsString( new EntryPath( path ) );
    }

    public DataSet getDataSet( String path )
    {
        return this.data.getDataSet( new EntryPath( path ) );
    }

    public Object getIndexableValues()
    {
        // TODO
        return null;
    }

    public void replaceBlobsWithKeys( final MockBlobKeyResolver blobToKeyResolver )
    {
        new BlobToKeyReplacer( blobToKeyResolver ).replace( data );
    }

    @Override
    public String toString()
    {
        final Objects.ToStringHelper s = Objects.toStringHelper( this );
        s.add( "id", id );
        s.add( "path", path );
        s.add( "version", versionId );
        s.add( "displayName", displayName );
        s.add( "contentType", type );
        s.add( "created", createdTime );
        s.add( "modified", modifiedTime );
        s.add( "owner", owner );
        s.add( "modifier", modifier );
        return s.toString();
    }

    public static Builder newContent()
    {
        return new Builder();
    }

    public static Builder newContent( final Content content )
    {
        return new Builder( content );
    }

    public static class Builder
    {
        private ContentPath path;

        private ContentId contentId;

        private QualifiedContentTypeName type;

        private ContentData data;

        private String displayName;

        private UserKey owner;

        private DateTime createdTime;

        private DateTime modifiedTime;

        private UserKey modifier;

        private ContentVersionId versionId;

        public Builder()
        {
            this.contentId = null;
            this.path = new ContentPath();
            this.type = null;
            this.data = new ContentData();
            this.displayName = null;
            this.owner = null;
            this.createdTime = null;
            this.modifiedTime = null;
            this.modifier = null;
            this.versionId = null;
        }

        public Builder( final Content content )
        {
            this.contentId = content.id;
            this.path = content.path; // TODO make ContentPath immutable, or make copy
            this.type = content.type;
            this.data = content.data; // TODO make ContentData immutable, or make copy
            this.displayName = content.displayName;
            this.owner = content.owner;
            this.createdTime = content.createdTime;
            this.modifiedTime = content.modifiedTime;
            this.modifier = content.modifier;
            this.versionId = content.versionId;
        }

        public Builder path( final ContentPath path )
        {
            this.path = path;
            return this;
        }

        public Builder name( final String name )
        {
            if ( this.path == null )
            {
                path = new ContentPath();
            }
            this.path = this.path.withName( name );
            return this;
        }

        public Builder type( final QualifiedContentTypeName type )
        {
            this.type = type;
            return this;
        }

        public Builder data( final ContentData data )
        {
            this.data = data;
            return this;
        }

        public Builder displayName( final String displayName )
        {
            this.displayName = displayName;
            return this;
        }

        public Builder owner( final UserKey owner )
        {
            this.owner = owner;
            return this;
        }

        public Builder modifier( final UserKey modifier )
        {
            this.modifier = modifier;
            return this;
        }

        public Builder createdTime( final DateTime createdTime )
        {
            this.createdTime = createdTime;
            return this;
        }

        public Builder modifiedTime( final DateTime modifiedTime )
        {
            this.modifiedTime = modifiedTime;
            return this;
        }

        public Builder id( final ContentId contentId )
        {
            this.contentId = contentId;
            return this;
        }

        public Builder version( final ContentVersionId versionId )
        {
            this.versionId = versionId;
            return this;
        }

        public Content build()
        {
            Preconditions.checkNotNull( path, "path is mandatory for a content" );
            if ( type == null )
            {
                type = QualifiedContentTypeName.unstructured();
            }
            if ( versionId == null )
            {
                versionId = ContentVersionId.initial();
            }
            return new Content( this );
        }
    }
}
