package com.enonic.wem.portal.exception.mapper;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import com.google.common.base.Throwables;

import com.enonic.wem.portal.exception.renderer.ExceptionRenderer;
import com.enonic.wem.portal.script.EvaluationException;

@Provider
public final class EvaluationExceptionMapper
    implements ExceptionMapper<EvaluationException>
{
    @Override
    public Response toResponse( final EvaluationException e )
    {
        final ExceptionRenderer renderer = new ExceptionRenderer();
        renderer.status( Response.Status.INTERNAL_SERVER_ERROR );
        renderer.description( e.getMessage() );
        renderer.title( "Script evaluation error" );
        renderer.sourceError( e );
        renderer.exception( Throwables.getRootCause( e ) );
        return renderer.render();
    }
}
