package com.enonic.wem.core.content;


import java.io.IOException;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;

public abstract class AbstractJsonSerializer<T>
{
    private boolean prettyPrint = false;

    private final ObjectMapper defaultMapper;

    protected AbstractJsonSerializer()
    {
        defaultMapper = new ObjectMapper();
    }

    protected ObjectMapper objectMapper()
    {
        return defaultMapper;
    }

    public void prettyPrint()
    {
        prettyPrint = true;
    }

    public String toString( T obj )
        throws JsonSerializingException
    {
        final JsonNode jsonNode = serialize( obj, objectMapper() );
        if ( prettyPrint )
        {
            try
            {
                return objectMapper().defaultPrettyPrintingWriter().writeValueAsString( jsonNode );
            }
            catch ( IOException e )
            {
                throw new RuntimeException( e );
            }
        }
        else
        {
            return jsonNode.toString();
        }
    }

    public T toObject( final String json )
    {
        try
        {
            final JsonFactory f = JsonFactoryHolder.DEFAULT_FACTORY;
            final JsonParser jp = f.createJsonParser( json );

            final ObjectMapper mapper = new ObjectMapper();
            final JsonNode node = mapper.readValue( jp, JsonNode.class );

            try
            {
                return parse( node );
            }
            finally
            {
                jp.close();
            }

        }
        catch ( IOException e )
        {
            throw new RuntimeException( "Failed to read json", e );
        }
    }

    public JsonNode toJson( T obj )
    {
        return serialize( obj, objectMapper() );
    }

    protected abstract JsonNode serialize( final T obj, final ObjectMapper objectMapper );

    protected abstract T parse( final JsonNode node );

}
