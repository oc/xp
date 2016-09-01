package com.enonic.xp.admin.impl.market;

import java.util.List;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.enonic.xp.admin.impl.rest.resource.application.json.MarketApplicationsJson;

@Component(immediate = true)
public class MarketServiceImpl
    implements MarketService
{
    private MarketDataProvider provider;

    @Override
    public MarketApplicationsJson get( final String version, final int from, final int count )
    {
        return this.provider.search( version, from, count );
    }

    @Override
    public MarketApplicationsJson get( final List<String> ids )
    {
        return this.provider.get( ids );
    }

    @Reference
    public void setProvider( final MarketDataProvider provider )
    {
        this.provider = provider;
    }
}
