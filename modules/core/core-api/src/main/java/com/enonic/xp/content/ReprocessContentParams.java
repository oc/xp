package com.enonic.xp.content;

import com.google.common.annotations.Beta;
import com.google.common.base.Objects;

import static java.util.Objects.requireNonNull;

@Beta
public final class ReprocessContentParams
{
    private final ContentId contentId;

    private ReprocessContentParams( Builder builder )
    {
        contentId = requireNonNull( builder.contentId );
    }

    public static Builder create()
    {
        return new Builder();
    }

    public ContentId getContentId()
    {
        return contentId;
    }

    @Override
    public boolean equals( final Object o )
    {
        if ( this == o )
        {
            return true;
        }
        if ( !( o instanceof ReprocessContentParams ) )
        {
            return false;
        }
        final ReprocessContentParams that = (ReprocessContentParams) o;
        return Objects.equal( this.contentId, that.contentId );
    }

    @Override
    public int hashCode()
    {
        return Objects.hashCode( this.contentId );
    }

    public static final class Builder
    {
        private ContentId contentId;

        private Builder()
        {
        }

        public Builder contentId( final ContentId contentId )
        {
            this.contentId = contentId;
            return this;
        }

        public ReprocessContentParams build()
        {
            return new ReprocessContentParams( this );
        }
    }
}
