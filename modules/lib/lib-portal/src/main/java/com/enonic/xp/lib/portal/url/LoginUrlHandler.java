package com.enonic.xp.lib.portal.url;

import com.google.common.collect.Multimap;

import com.enonic.xp.portal.url.IdentityUrlParams;
import com.enonic.xp.security.UserStoreKey;
import com.enonic.xp.web.vhost.VirtualHost;
import com.enonic.xp.web.vhost.VirtualHostHelper;

public final class LoginUrlHandler
    extends AbstractUrlHandler
{
    @Override
    protected String buildUrl( final Multimap<String, String> map )
    {
        final UserStoreKey userStoreKey = retrieveUserStoreKey();
        final IdentityUrlParams params = new IdentityUrlParams().
            portalRequest( request ).
            idProviderFunction( "login" ).
            userStoreKey( userStoreKey == null ? UserStoreKey.system() : userStoreKey ).
            setAsMap( map );
        return this.urlService.identityUrl( params );
    }

    private UserStoreKey retrieveUserStoreKey()
    {
        UserStoreKey userStoreKey = null;
        final VirtualHost virtualHost = VirtualHostHelper.getVirtualHost( request.getRawRequest() );
        if ( virtualHost != null )
        {
            userStoreKey = virtualHost.getUserStoreKey();
        }
        if ( userStoreKey == null )
        {
            userStoreKey = UserStoreKey.system();
        }
        return userStoreKey;
    }
}