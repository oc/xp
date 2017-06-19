package com.enonic.xp.dump;

public class DumpParams
{
    private final String dumpName;

    private final boolean includeVersions;

    private final boolean includeBinaries;

    private final Integer maxAge;

    private final Integer maxVersions;

    private DumpParams( final Builder builder )
    {
        dumpName = builder.dumpName;
        includeVersions = builder.includeVersions;
        includeBinaries = builder.includeBinaries;
        maxAge = builder.maxAge;
        maxVersions = builder.maxVersions;
    }

    public String getDumpName()
    {
        return dumpName;
    }

    public static Builder create()
    {
        return new Builder();
    }

    public boolean isIncludeVersions()
    {
        return includeVersions;
    }

    public boolean isIncludeBinaries()
    {
        return includeBinaries;
    }

    public Integer getMaxAge()
    {
        return maxAge;
    }

    public Integer getMaxVersions()
    {
        return maxVersions;
    }

    public static final class Builder
    {
        private String dumpName;

        private boolean includeVersions = true;

        private boolean includeBinaries = true;

        private Integer maxAge;

        private Integer maxVersions;

        private Builder()
        {
        }

        public Builder dumpName( final String val )
        {
            dumpName = val;
            return this;
        }

        public Builder includeVersions( final boolean val )
        {
            includeVersions = val;
            return this;
        }

        public Builder includeBinaries( final boolean val )
        {
            includeBinaries = val;
            return this;
        }

        public Builder maxAge( final Integer val )
        {
            maxAge = val;
            return this;
        }

        public Builder maxVersions( final Integer val )
        {
            maxVersions = val;
            return this;
        }

        public DumpParams build()
        {
            return new DumpParams( this );
        }
    }
}
