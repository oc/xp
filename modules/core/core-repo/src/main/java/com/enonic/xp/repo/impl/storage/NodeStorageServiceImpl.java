package com.enonic.xp.repo.impl.storage;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.enonic.xp.blob.BlobKey;
import com.enonic.xp.blob.BlobKeys;
import com.enonic.xp.branch.Branch;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.node.Node;
import com.enonic.xp.node.NodeBranchEntries;
import com.enonic.xp.node.NodeBranchEntry;
import com.enonic.xp.node.NodeId;
import com.enonic.xp.node.NodeIds;
import com.enonic.xp.node.NodeNotFoundException;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.node.NodePaths;
import com.enonic.xp.node.NodeVersion;
import com.enonic.xp.node.NodeVersionId;
import com.enonic.xp.node.NodeVersionMetadata;
import com.enonic.xp.node.NodeVersions;
import com.enonic.xp.node.Nodes;
import com.enonic.xp.node.PushNodeEntries;
import com.enonic.xp.node.PushNodeEntry;
import com.enonic.xp.node.PushNodesListener;
import com.enonic.xp.repo.impl.InternalContext;
import com.enonic.xp.repo.impl.branch.BranchService;
import com.enonic.xp.repo.impl.branch.storage.NodeFactory;
import com.enonic.xp.repo.impl.node.dao.NodeVersionService;
import com.enonic.xp.repo.impl.version.VersionService;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.acl.AccessControlList;
import com.enonic.xp.security.acl.Permission;
import com.enonic.xp.security.auth.AuthenticationInfo;

@Component
public class NodeStorageServiceImpl
    implements NodeStorageService
{
    private VersionService versionService;

    private BranchService branchService;

    private NodeVersionService nodeVersionService;

    private IndexDataService indexDataService;

    @Override
    public Node store( final Node node, final InternalContext context )
    {
        final NodeVersionId nodeVersionId = new NodeVersionId();
        final BlobKey blobKey = nodeVersionService.store( NodeVersion.from( node ), context );

        storeVersionMetadata( node, nodeVersionId, blobKey, context );

        storeBranchMetadata( node, nodeVersionId, blobKey, context );

        indexNode( node, nodeVersionId, context );

        return Node.create( node ).
            nodeVersionId( nodeVersionId ).
            build();
    }

    @Override
    public Node load( final Node node, final InternalContext context )
    {
        final NodeVersion nodeVersion = NodeVersion.create().
            id( node.id() ).
            nodeType( node.getNodeType() ).
            data( node.data() ).
            indexConfigDocument( node.getIndexConfigDocument() ).
            childOrder( node.getChildOrder() ).
            manualOrderValue( node.getManualOrderValue() ).
            permissions( node.getPermissions() ).
            inheritPermissions( node.inheritsPermissions() ).
            attachedBinaries( node.getAttachedBinaries() ).
            build();

        final NodeVersionId nodeVersionId = node.getNodeVersionId();
        final BlobKey blobKey = nodeVersionService.store( nodeVersion, context );

        storeVersionMetadata( node, nodeVersionId, blobKey, context );

        storeBranchMetadata( node, nodeVersionId, blobKey, context );

        indexNode( node, nodeVersionId, context );

        return Node.create( node ).
            nodeVersionId( nodeVersionId ).
            build();
    }

    @Override
    public void storeVersion( final StoreNodeVersionParams params, final InternalContext context )
    {
        final BlobKey blobKey = this.nodeVersionService.store( params.getNodeVersion(), context );

        this.versionService.store( NodeVersionMetadata.create().
            nodeVersionId( params.getNodeVersionId() ).
            blobKey( blobKey ).
            nodeId( params.getNodeId() ).
            nodePath( params.getNodePath() ).
            timestamp( params.getTimestamp() ).
            build(), context );
    }

    @Override
    public Node move( final MoveNodeParams params, final InternalContext context )
    {
        final NodeBranchEntry nodeBranchEntry = this.branchService.get( params.getNode().id(), context );

        final NodeVersionId nodeVersionId;
        final BlobKey blobKey;
        if ( params.isUpdateMetadataOnly() )
        {
            nodeVersionId = nodeBranchEntry.getVersionId();
            blobKey = nodeBranchEntry.getBlobKey();

        }
        else
        {
            nodeVersionId = new NodeVersionId();
            blobKey = nodeVersionService.store( NodeVersion.from( params.getNode() ), context );
        }

        storeVersionMetadata( params.getNode(), nodeVersionId, blobKey, context );

        return moveInBranchAndReIndex( params.getNode(), nodeVersionId, blobKey, nodeBranchEntry.getNodePath(), context );
    }

    @Override
    public void delete( final NodeIds nodeIds, final InternalContext context )
    {
        branchService.delete( nodeIds, context );
        indexDataService.delete( nodeIds, context );
    }

    @Override
    public Node updateMetadata( final Node node, final InternalContext context )
    {
        final NodeBranchEntry nodeBranchEntry = this.branchService.get( node.id(), context );

        if ( nodeBranchEntry == null )
        {
            throw new NodeNotFoundException( "Cannot find node with id: " + node.id() + " in branch " + context.getBranch() );
        }

        final NodeVersionId nodeVersionId = nodeBranchEntry.getVersionId();
        final BlobKey blobKey = nodeBranchEntry.getBlobKey();

        storeBranchMetadata( node, nodeVersionId, blobKey, context );

        indexNode( node, nodeVersionId, context );

        return Node.create( node ).
            nodeVersionId( nodeVersionId ).
            build();
    }

    @Override
    public void updateVersion( final Node node, final NodeVersionId nodeVersionId, final InternalContext context )
    {
        //TODO Check
        final NodeVersionMetadata nodeVersionMetadata = this.versionService.getVersion( node.id(), nodeVersionId, context );

        if ( nodeVersionMetadata == null )
        {
            throw new NodeNotFoundException( "Cannot find node version with id: " + nodeVersionId );
        }

        this.branchService.store( NodeBranchEntry.create().
            nodeVersionId( nodeVersionId ).
            blobKey( nodeVersionMetadata.getBlobKey() ).
            nodeId( node.id() ).
            nodeState( node.getNodeState() ).
            timestamp( node.getTimestamp() ).
            nodePath( node.path() ).
            build(), context );

        this.indexDataService.store( node, context );
    }

    @Override
    public void push( final PushNodeEntries entries, final PushNodesListener pushListener, final InternalContext context )
    {
        for ( final PushNodeEntry entry : entries )
        {
            final NodeBranchEntry nodeBranchEntry = entry.getNodeBranchEntry();
            this.branchService.store( nodeBranchEntry, entry.getCurrentTargetPath(), InternalContext.create( context ).
                branch( entries.getTargetBranch() ).
                build() );
            if ( pushListener != null )
            {
                pushListener.nodesPushed( 1 );
            }
        }

        this.indexDataService.push( IndexPushNodeParams.create().
            nodeIds( entries.getNodeIds() ).
            targetBranch( entries.getTargetBranch() ).
            targetRepo( entries.getTargetRepo() ).
            pushListener( pushListener ).
            build(), context );
    }

    @Override
    public void push( final Node node, final Branch target, final InternalContext context )
    {
        final NodeBranchEntry entry = this.branchService.get( node.id(), context );

        this.branchService.store( entry, InternalContext.create( context ).
            branch( target ).
            build() );

        this.indexDataService.push( IndexPushNodeParams.create().
            nodeIds( NodeIds.from( node.id() ) ).
            targetBranch( target ).
            targetRepo( context.getRepositoryId() ).
            build(), context );
    }


    @Override
    public Node get( final NodeId nodeId, final InternalContext context )
    {
        final NodeBranchEntry nodeBranchEntry = this.branchService.get( nodeId, context );

        return doGetNode( nodeBranchEntry, context );
    }

    @Override
    public Node get( final NodePath nodePath, final InternalContext context )
    {
        final NodeBranchEntry nodeBranchEntry = this.branchService.get( nodePath, context );

        return doGetNode( nodeBranchEntry, context );
    }

    @Override
    public Nodes get( final NodeIds nodeIds, final boolean keepOrder, final InternalContext context )
    {
        final NodeBranchEntries nodeBranchEntries = this.branchService.get( nodeIds, keepOrder, context );

        return doReturnNodes( nodeBranchEntries, context );
    }

    @Override
    public Nodes get( final NodePaths nodePaths, final InternalContext context )
    {
        final NodeBranchEntries nodeBranchEntries = this.branchService.get( nodePaths, context );

        return doReturnNodes( nodeBranchEntries, context );
    }

    @Override
    public Node get( final NodeId nodeId, final NodeVersionId nodeVersionId, final InternalContext context )
    {
        final NodeVersionMetadata nodeVersionMetadata = versionService.getVersion( nodeId, nodeVersionId, context );

        if ( nodeVersionMetadata == null )
        {
            return null;
        }

        final NodeVersion nodeVersion = nodeVersionService.get( nodeVersionMetadata.getBlobKey(), context );

        if ( nodeVersion == null )
        {
            return null;
        }

        final NodeBranchEntry nodeBranchEntry = branchService.get( nodeVersionMetadata.getNodeId(), context );

        if ( nodeBranchEntry == null )
        {
            return null;
        }

        return constructNode( nodeBranchEntry, nodeVersion );
    }

    @Override
    public NodeVersion getNodeVersion( final BlobKey blobKey, final InternalContext context )
    {
        return this.nodeVersionService.get( blobKey, context );
    }

    @Override
    public NodeBranchEntry getBranchNodeVersion( final NodeId nodeId, final InternalContext context )
    {
        return this.branchService.get( nodeId, context );
    }

    @Override
    public NodeBranchEntries getBranchNodeVersions( final NodeIds nodeIds, final boolean keepOrder, final InternalContext context )
    {
        return this.branchService.get( nodeIds, keepOrder, context );
    }

    @Override
    public NodeVersionMetadata getVersion( final NodeId nodeId, final NodeVersionId nodeVersionId, final InternalContext context )
    {
        return this.versionService.getVersion( nodeId, nodeVersionId, context );
    }

    @Override
    public NodeId getIdForPath( final NodePath nodePath, final InternalContext context )
    {
        final NodeBranchEntry nodeBranchEntry = this.branchService.get( nodePath, context );

        return nodeBranchEntry != null ? nodeBranchEntry.getNodeId() : null;
    }

    @Override
    public void invalidate()
    {
        this.branchService.evictAllPaths();
    }

    @Override
    public void handleNodeCreated( final NodeId nodeId, final NodePath nodePath, final InternalContext context )
    {
        this.branchService.cachePath( nodeId, nodePath, context );
    }

    @Override
    public void handleNodeDeleted( final NodeId nodeId, final NodePath nodePath, final InternalContext context )
    {
        this.branchService.evictPath( nodePath, context );
    }

    @Override
    public void handleNodeMoved( final NodeMovedParams params, final InternalContext context )
    {
        this.branchService.evictPath( params.getExistingPath(), context );
        this.branchService.cachePath( params.getNodeId(), params.getNewPath(), context );
    }

    @Override
    public void handleNodePushed( final NodeId nodeId, final NodePath nodePath, final NodePath currentTargetPath,
                                  final InternalContext context )
    {
        if ( !nodePath.equals( currentTargetPath ) )
        {
            if ( currentTargetPath != null )
            {
                this.branchService.evictPath( currentTargetPath, context );
            }
            this.branchService.cachePath( nodeId, nodePath, context );
        }
    }

    private Node doGetNode( final NodeBranchEntry nodeBranchEntry, final InternalContext context )
    {
        if ( nodeBranchEntry == null )
        {
            return null;
        }

        final NodeVersion nodeVersion = nodeVersionService.get( nodeBranchEntry.getBlobKey(), context );

        return constructNode( nodeBranchEntry, nodeVersion );
    }

    private Node constructNode( final NodeBranchEntry nodeBranchEntry, final NodeVersion nodeVersion )
    {
        final Node node = NodeFactory.create( nodeVersion, nodeBranchEntry );

        return canRead( node.getPermissions() ) ? node : null;
    }

    private void indexNode( final Node node, final NodeVersionId nodeVersionId, final InternalContext context )
    {
        this.indexDataService.store( Node.create( node ).
            nodeVersionId( nodeVersionId ).
            build(), context );
    }

    private void storeVersionMetadata( final Node node, final NodeVersionId nodeVersionId, final BlobKey blobKey,
                                       final InternalContext context )
    {
        this.versionService.store( NodeVersionMetadata.create().
            nodeId( node.id() ).
            nodeVersionId( nodeVersionId ).
            blobKey( blobKey ).
            nodePath( node.path() ).
            timestamp( node.getTimestamp() ).
            build(), context );
    }


    private Nodes doReturnNodes( final NodeBranchEntries nodeBranchEntries, final InternalContext context )
    {
        final BlobKeys.Builder builder = BlobKeys.create();
        nodeBranchEntries.stream().
            map( NodeBranchEntry::getBlobKey ).
            forEach( builder::add );

        final NodeVersions nodeVersions = nodeVersionService.get( builder.build(), context );

        final Nodes.Builder filteredNodes = Nodes.create();

        nodeVersions.stream().filter( ( nodeVersion ) -> canRead( nodeVersion.getPermissions() ) ).forEach(
            ( nodeVersion ) -> filteredNodes.add( NodeFactory.create( nodeVersion, nodeBranchEntries.get( nodeVersion.getId() ) ) ) );

        return filteredNodes.build();
    }

    private void storeBranchMetadata( final Node node, final NodeVersionId nodeVersionId, final BlobKey blobKey,
                                      final InternalContext context )
    {
        this.branchService.store( NodeBranchEntry.create().
            nodeVersionId( nodeVersionId ).
            blobKey( blobKey ).
            nodeId( node.id() ).
            nodeState( node.getNodeState() ).
            timestamp( node.getTimestamp() ).
            nodePath( node.path() ).
            build(), context );
    }

    private Node moveInBranchAndReIndex( final Node node, final NodeVersionId nodeVersionId, final BlobKey blobKey,
                                         final NodePath previousPath, final InternalContext context )
    {
        this.branchService.store( NodeBranchEntry.create().
            nodeVersionId( nodeVersionId ).
            blobKey( blobKey ).
            nodeId( node.id() ).
            nodeState( node.getNodeState() ).
            timestamp( node.getTimestamp() ).
            nodePath( node.path() ).
            build(), previousPath, context );

        this.indexDataService.store( node, context );

        return node;
    }

    private boolean canRead( final AccessControlList permissions )
    {
        final AuthenticationInfo authInfo = ContextAccessor.current().getAuthInfo();

        if ( authInfo.getPrincipals().contains( RoleKeys.ADMIN ) )
        {
            return true;
        }

        return permissions.isAllowedFor( authInfo.getPrincipals(), Permission.READ );
    }

    @Reference
    public void setVersionService( final VersionService versionService )
    {
        this.versionService = versionService;
    }

    @Reference
    public void setBranchService( final BranchService branchService )
    {
        this.branchService = branchService;
    }

    @Reference
    public void setNodeVersionService( final NodeVersionService nodeVersionService )
    {
        this.nodeVersionService = nodeVersionService;
    }

    @Reference
    public void setIndexDataService( final IndexDataService indexDataService )
    {
        this.indexDataService = indexDataService;
    }
}
