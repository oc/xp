package com.enonic.wem.core.content.page;

import javax.inject.Inject;

import com.enonic.wem.api.Client;
import com.enonic.wem.api.content.page.CreatePageDescriptorParams;
import com.enonic.wem.api.content.page.GetPageDescriptor;
import com.enonic.wem.api.content.page.PageDescriptor;
import com.enonic.wem.api.content.page.PageDescriptorKey;
import com.enonic.wem.api.content.page.PageDescriptorService;

public class PageDescriptorServiceImpl
    implements PageDescriptorService
{
    @Inject
    private Client client;

    public PageDescriptor getByKey( final PageDescriptorKey key )
    {
        final GetPageDescriptor command = new GetPageDescriptor( key );
        return client.execute( command );
    }

    public PageDescriptor create( final CreatePageDescriptorParams params )
    {
        return client.execute( params );
    }
}
