package com.enonic.xp.admin.impl.portal;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.osgi.service.component.annotations.Component;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.page.DescriptorKey;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.RenderMode;
import com.enonic.xp.portal.handler.BasePortalHandler;
import com.enonic.xp.web.WebRequest;
import com.enonic.xp.web.WebResponse;
import com.enonic.xp.web.handler.WebHandler;

@Component(immediate = true, service = WebHandler.class)
public class AdminToolPortalHandler
    extends BasePortalHandler
{
    public final static String ADMIN_TOOL_START = "/admin/tool";

    public final static String ADMIN_TOOL_PREFIX = ADMIN_TOOL_START + "/";

    public final static DescriptorKey DEFAULT_DESCRIPTOR_KEY = DescriptorKey.from( "com.enonic.xp.app.main:home" );

    public final static Pattern PATTERN = Pattern.compile( "([^/]+)/([^/]+)" );

    @Override
    protected boolean canHandle( final WebRequest webRequest )
    {
        return webRequest.getRawPath().startsWith( ADMIN_TOOL_START );
    }

    @Override
    protected PortalRequest createPortalRequest( final WebRequest webRequest, final WebResponse webResponse )
    {
        final DescriptorKey descriptorKey = getDescriptorKey( webRequest );
        final PortalRequest portalRequest = new PortalRequest( webRequest );
        portalRequest.setBaseUri( ADMIN_TOOL_PREFIX + descriptorKey.getApplicationKey() + "/" + descriptorKey.getName() );
        portalRequest.setApplicationKey( descriptorKey.getApplicationKey() );
        portalRequest.setMode( RenderMode.ADMIN );
        return portalRequest;
    }

    public static DescriptorKey getDescriptorKey( final WebRequest webRequest )
    {
        final String path = webRequest.getRawPath();
        final String subPath = path.length() > ADMIN_TOOL_PREFIX.length() ? path.substring( ADMIN_TOOL_PREFIX.length() ) : "";
        final Matcher matcher = PATTERN.matcher( subPath );

        if ( matcher.find() )
        {
            final ApplicationKey applicationKey = ApplicationKey.from( matcher.group( 1 ) );
            final String adminToolName = matcher.group( 2 );
            return DescriptorKey.from( applicationKey, adminToolName );
        }
        else
        {
            return DEFAULT_DESCRIPTOR_KEY;
        }
    }
}