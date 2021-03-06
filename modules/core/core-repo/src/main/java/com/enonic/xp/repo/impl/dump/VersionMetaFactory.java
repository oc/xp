package com.enonic.xp.repo.impl.dump;

import com.enonic.xp.node.Node;
import com.enonic.xp.node.NodeState;
import com.enonic.xp.node.NodeVersion;
import com.enonic.xp.node.NodeVersionMetadata;
import com.enonic.xp.repo.impl.dump.model.VersionMeta;

class VersionMetaFactory
{
    public static VersionMeta create( final Node node, final NodeVersionMetadata metaData )
    {
        return VersionMeta.create().
            timestamp( node.getTimestamp() ).
            nodePath( node.path() ).
            version( node.getNodeVersionId() ).
            blobKey( metaData.getBlobKey() ).
            nodeState( node.getNodeState() ).
            build();
    }

    public static VersionMeta create( final NodeVersionMetadata metaData )
    {
        return VersionMeta.create().
            timestamp( metaData.getTimestamp() ).
            nodePath( metaData.getNodePath() ).
            version( metaData.getNodeVersionId() ).
            blobKey( metaData.getBlobKey() ).
            nodeState( NodeState.DEFAULT ).
            build();
    }
}
