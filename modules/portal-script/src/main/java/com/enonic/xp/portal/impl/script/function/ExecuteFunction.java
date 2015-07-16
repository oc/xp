package com.enonic.xp.portal.impl.script.function;

import java.util.Collections;

import com.enonic.xp.portal.impl.script.bean.JsObjectConverter;
import com.enonic.xp.portal.impl.script.invoker.CommandInvoker;
import com.enonic.xp.portal.impl.script.invoker.CommandRequestImpl;
import com.enonic.xp.resource.ResourceKey;

public final class ExecuteFunction
    extends AbstractFunction
{
    private final ResourceKey script;

    private final CommandInvoker invoker;

    public ExecuteFunction( final ResourceKey script, final CommandInvoker invoker )
    {
        super( "execute" );
        this.script = script;
        this.invoker = invoker;
    }

    @Override
    public Object call( final Object thiz, final Object... args )
    {
        if ( args.length < 1 )
        {
            throw new IllegalArgumentException( "execute(..) must have at least one parameter" );
        }

        final String name = args[0].toString();
        final Object params = args.length > 1 ? args[1] : Collections.emptyMap();

        final CommandRequestImpl request = new CommandRequestImpl();
        request.setName( name );
        request.setScript( this.script );
        request.setParamsMap( JsObjectConverter.fromJsAsMap( params ) );
        return this.invoker.invoke( request );
    }
}