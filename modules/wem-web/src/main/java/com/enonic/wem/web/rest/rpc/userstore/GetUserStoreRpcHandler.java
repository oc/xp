package com.enonic.wem.web.rest.rpc.userstore;


import com.enonic.wem.api.command.Commands;
import com.enonic.wem.api.userstore.UserStoreNames;
import com.enonic.wem.api.userstore.UserStores;
import com.enonic.wem.web.json.rpc.JsonRpcContext;
import com.enonic.wem.web.rest.rpc.AbstractDataRpcHandler;


public final class GetUserStoreRpcHandler
    extends AbstractDataRpcHandler
{
    public GetUserStoreRpcHandler()
    {
        super( "userstore_get" );
    }

    @Override
    public void handle( final JsonRpcContext context )
        throws Exception
    {
        final String name = context.param( "name" ).required().asString();

        final UserStores userStores = this.client.execute(
            Commands.userStore().get().names( UserStoreNames.from( name ) ).includeConfig().includeConnector().includeStatistics() );
        context.setResult( new GetUserStoreJsonResult( userStores.first() ) );
    }
}
