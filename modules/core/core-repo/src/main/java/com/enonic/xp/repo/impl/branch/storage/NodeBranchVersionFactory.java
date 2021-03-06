package com.enonic.xp.repo.impl.branch.storage;

import java.time.Instant;

import com.enonic.xp.blob.BlobKey;
import com.enonic.xp.node.NodeBranchEntry;
import com.enonic.xp.node.NodeId;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.node.NodeState;
import com.enonic.xp.node.NodeVersionId;
import com.enonic.xp.repo.impl.ReturnValues;

public class NodeBranchVersionFactory
{
    public static NodeBranchEntry create( final ReturnValues returnValues )
    {
        final Object path = returnValues.getSingleValue( BranchIndexPath.PATH.getPath() );
        final Object state = returnValues.getSingleValue( BranchIndexPath.STATE.getPath() );
        final Object versionId = returnValues.getSingleValue( BranchIndexPath.VERSION_ID.getPath() );
        final Object blobKey = returnValues.getSingleValue( BranchIndexPath.BLOB_KEY.getPath() );
        final Object timestamp = returnValues.getSingleValue( BranchIndexPath.TIMESTAMP.getPath() );
        final Object nodeId = returnValues.getSingleValue( BranchIndexPath.NODE_ID.getPath() );

        return NodeBranchEntry.create().
            nodePath( path != null ? NodePath.create( path.toString() ).build() : NodePath.ROOT ).
            nodeState( state != null ? NodeState.from( state.toString() ) : NodeState.DEFAULT ).
            nodeVersionId( NodeVersionId.from( versionId.toString() ) ).
            blobKey( BlobKey.from( blobKey.toString() ) ).
            timestamp( Instant.parse( timestamp.toString() ) ).
            nodeId( NodeId.from( nodeId.toString() ) ).
            build();
    }
}
