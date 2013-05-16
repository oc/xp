package com.enonic.wem.web.rest.rpc.userstore;


import com.enonic.wem.api.command.Commands;
import com.enonic.wem.api.userstore.UserStoreName;
import com.enonic.wem.api.userstore.UserStoreNames;
import com.enonic.wem.web.json.rpc.JsonRpcContext;
import com.enonic.wem.web.rest.rpc.AbstractDataRpcHandler;


public class DeleteUserStoreRpcHandler
    extends AbstractDataRpcHandler
{
    public DeleteUserStoreRpcHandler()
    {
        super( "userstore_delete" );
    }

    @Override
    public void handle( final JsonRpcContext context )
        throws Exception
    {
        final String[] names = context.param( "name" ).required().asStringArray();
        final UserStoreNames userStoreNames = UserStoreNames.from( names );

        int userStoresDeleted = 0;
        for ( UserStoreName userStoreName : userStoreNames )
        {
            final boolean deleted = client.execute( Commands.userStore().delete().name( userStoreName ) );
            if ( deleted )
            {
                userStoresDeleted++;
            }
        }
        context.setResult( new DeleteUserStoreJsonResult( userStoresDeleted ) );
    }
}
