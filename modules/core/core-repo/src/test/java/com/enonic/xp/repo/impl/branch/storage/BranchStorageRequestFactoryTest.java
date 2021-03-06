package com.enonic.xp.repo.impl.branch.storage;

import org.junit.Test;

import com.enonic.xp.blob.BlobKey;
import com.enonic.xp.branch.Branch;
import com.enonic.xp.node.NodeBranchEntry;
import com.enonic.xp.node.NodeId;
import com.enonic.xp.node.NodePath;
import com.enonic.xp.node.NodeState;
import com.enonic.xp.node.NodeVersionId;
import com.enonic.xp.repo.impl.InternalContext;
import com.enonic.xp.repo.impl.storage.StoreRequest;
import com.enonic.xp.repository.RepositoryId;

import static org.junit.Assert.*;

public class BranchStorageRequestFactoryTest
{

    @Test
    public void create()
        throws Exception
    {
        final StoreRequest storeRequest = BranchStorageRequestFactory.create( NodeBranchEntry.create().
            nodeId( NodeId.from( "nodeId" ) ).
            nodePath( NodePath.create( "nodePath" ).build() ).
            nodeState( NodeState.DEFAULT ).
            nodeVersionId( NodeVersionId.from( "nodeVersionId" ) ).
            blobKey( BlobKey.from( "blobKey" ) ).
            build(), InternalContext.create().
            branch( Branch.from( "myBranch" ) ).
            repositoryId( RepositoryId.from( "my-repo-id" ) ).
            build() );

        assertEquals( storeRequest.getId(), "nodeId_myBranch" );
        assertEquals( storeRequest.getParent(), "nodeVersionId" );
        assertEquals( storeRequest.getRouting(), "nodeId" );
    }
}