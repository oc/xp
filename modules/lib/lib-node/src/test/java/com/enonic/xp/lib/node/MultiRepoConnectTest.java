package com.enonic.xp.lib.node;

import org.junit.Test;

import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.User;
import com.enonic.xp.security.UserStoreKey;
import com.enonic.xp.security.auth.AuthenticationInfo;

public class MultiRepoConnectTest
    extends BaseNodeHandlerTest
{
    @Test
    public void testExample()
    {
        final Context context = ContextBuilder.create().
            authInfo( AuthenticationInfo.create().
                user( User.create().key( PrincipalKey.ofUser( UserStoreKey.system(), "test-user" ) ).login( "test-user" ).build() ).
                principals( RoleKeys.ADMIN ).
                build() ).
            build();

        context.runWith( () -> runScript( "/site/lib/xp/examples/node/multiRepoConnect.js" ) );
    }
}
