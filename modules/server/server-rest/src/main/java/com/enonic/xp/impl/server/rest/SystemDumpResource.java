package com.enonic.xp.impl.server.rest;

import java.nio.file.Paths;
import java.util.List;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.google.common.collect.Lists;

import com.enonic.xp.branch.Branch;
import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.dump.DumpParams;
import com.enonic.xp.dump.DumpResults;
import com.enonic.xp.dump.DumpService;
import com.enonic.xp.dump.LoadParams;
import com.enonic.xp.export.ExportService;
import com.enonic.xp.export.ImportNodesParams;
import com.enonic.xp.export.NodeImportResult;
import com.enonic.xp.home.HomeDir;
import com.enonic.xp.impl.server.rest.model.NodeImportResultsJson;
import com.enonic.xp.impl.server.rest.model.SystemDumpRequestJson;
import com.enonic.xp.impl.server.rest.model.SystemDumpResultJson;
import com.enonic.xp.impl.server.rest.model.SystemLoadRequestJson;
import com.enonic.xp.jaxrs.JaxRsComponent;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.repository.CreateRepositoryParams;
import com.enonic.xp.repository.NodeRepositoryService;
import com.enonic.xp.repository.Repository;
import com.enonic.xp.repository.RepositoryId;
import com.enonic.xp.repository.RepositoryService;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.SystemConstants;
import com.enonic.xp.vfs.VirtualFiles;

@Path("/api/system")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed(RoleKeys.ADMIN_ID)
@Component(immediate = true, property = "group=api")
public final class SystemDumpResource
    implements JaxRsComponent
{
    private ExportService exportService;

    private RepositoryService repositoryService;

    private NodeRepositoryService nodeRepositoryService;

    private DumpService dumpService;

    private java.nio.file.Path getDumpDirectory( final String name )
    {
        return Paths.get( HomeDir.get().toString(), "data", "dump", name ).toAbsolutePath();
    }

    private java.nio.file.Path getDataHome()
    {
        return Paths.get( HomeDir.get().toString(), "data" );
    }

    @POST
    @Path("dump")
    public SystemDumpResultJson systemDump( final SystemDumpRequestJson request )
        throws Exception
    {
        final DumpResults dumpResults = this.dumpService.dumpSystem( DumpParams.create().
            dumpName( request.getName() ).
            includeBinaries( true ).
            includeVersions( request.isIncludeVersions() ).
            maxAge( request.getMaxAge() ).
            maxVersions( request.getMaxVersions() ).
            build() );

        return SystemDumpResultJson.from( dumpResults );
    }

    @POST
    @Path("load")
    public NodeImportResultsJson load( final SystemLoadRequestJson request )
    {
        if ( isExport( request ) )
        {
            return doLoadFromExport( request );
        }

        return doLoadFromSystemDump( request );
    }

    private boolean isExport( final SystemLoadRequestJson request )
    {
        final java.nio.file.Path rootDir = getDumpRoot( request.getName() );

        final java.nio.file.Path exportProperties = Paths.get( rootDir.toString(), "export.properties" );

        return exportProperties.toFile().exists();
    }

    private NodeImportResultsJson doLoadFromExport( final SystemLoadRequestJson request )
    {
        final List<NodeImportResult> results = Lists.newArrayList();

        importSystemRepo( request, results );

        this.repositoryService.invalidateAll();

        for ( Repository repository : repositoryService.list() )
        {
            initializeRepo( repository );
            importRepoBranches( request.getName(), results, repository );
        }

        return NodeImportResultsJson.from( results );
    }

    private NodeImportResultsJson doLoadFromSystemDump( final SystemLoadRequestJson request )
    {
        final List<NodeImportResult> results = Lists.newArrayList();

        this.dumpService.loadSystemDump( LoadParams.create().
            dumpName( request.getName() ).
            includeVersions( true ).
            build() );

        return NodeImportResultsJson.from( results );
    }

    private void importRepoBranches( final String dumpName, final List<NodeImportResult> results, final Repository repository )
    {
        for ( Branch branch : repository.getBranches() )
        {
            if ( isSystemRepoMaster( repository, branch ) )
            {
                continue;
            }
            results.add( importRepoBranch( repository.getId().toString(), branch.getValue(), dumpName ) );
        }
    }

    private boolean isSystemRepoMaster( final Repository repository, final Branch branch )
    {
        return SystemConstants.SYSTEM_REPO.equals( repository ) && SystemConstants.BRANCH_SYSTEM.equals( branch );
    }

    private void initializeRepo( final Repository repository )
    {
        if ( !this.nodeRepositoryService.isInitialized( repository.getId() ) )
        {
            final CreateRepositoryParams createRepositoryParams = CreateRepositoryParams.create().
                repositoryId( repository.getId() ).
                repositorySettings( repository.getSettings() ).
                build();
            this.nodeRepositoryService.create( createRepositoryParams );
        }
    }

    private void importSystemRepo( final SystemLoadRequestJson request, final List<NodeImportResult> results )
    {
        final NodeImportResult systemRepoImport =
            importRepoBranch( SystemConstants.SYSTEM_REPO.getId().toString(), SystemConstants.BRANCH_SYSTEM.toString(), request.getName() );

        results.add( systemRepoImport );
    }

    private NodeImportResult importRepoBranch( final String repoName, final String branch, final String dumpName )
    {
        final java.nio.file.Path rootDir = getDumpRoot( dumpName );

        final java.nio.file.Path importPath = rootDir.resolve( repoName ).resolve( branch );

        return getContext( branch, repoName ).callWith( () -> this.exportService.importNodes( ImportNodesParams.create().
            source( VirtualFiles.from( importPath ) ).
            targetNodePath( NodePath.ROOT ).
            includeNodeIds( true ).
            includePermissions( true ).
            build() ) );
    }

    private java.nio.file.Path getDumpRoot( final String dumpName )
    {
        final java.nio.file.Path rootDir = getDumpDirectory( dumpName );

        if ( !rootDir.toFile().exists() )
        {
            throw new IllegalArgumentException( "No dump with name '" + dumpName + "' found in " + getDataHome() );
        }
        return rootDir;
    }

    private Context getContext( final String branchName, final String repositoryName )
    {
        return ContextBuilder.from( ContextAccessor.current() ).
            branch( Branch.from( branchName ) ).
            repositoryId( RepositoryId.from( repositoryName ) ).
            build();
    }

    @SuppressWarnings("WeakerAccess")
    @Reference
    public void setExportService( final ExportService exportService )
    {
        this.exportService = exportService;
    }

    @SuppressWarnings("WeakerAccess")
    @Reference
    public void setRepositoryService( final RepositoryService repositoryService )
    {
        this.repositoryService = repositoryService;
    }

    @SuppressWarnings("WeakerAccess")
    @Reference
    public void setNodeRepositoryService( final NodeRepositoryService nodeRepositoryService )
    {
        this.nodeRepositoryService = nodeRepositoryService;
    }

    @SuppressWarnings("WeakerAccess")
    @Reference
    public void setDumpService( final DumpService dumpService )
    {
        this.dumpService = dumpService;
    }
}
