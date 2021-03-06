package com.enonic.xp.repo.impl.version.storage;

import java.time.Instant;

import com.enonic.xp.node.NodeVersionMetadata;
import com.enonic.xp.repo.impl.StorageSource;
import com.enonic.xp.repo.impl.storage.StaticStorageType;
import com.enonic.xp.repo.impl.storage.StorageData;
import com.enonic.xp.repo.impl.storage.StoreRequest;
import com.enonic.xp.repo.impl.storage.StoreStorageName;
import com.enonic.xp.repo.impl.version.VersionIndexPath;
import com.enonic.xp.repository.RepositoryId;

public class VersionStorageDocFactory
{
    public static StoreRequest create( final NodeVersionMetadata nodeVersion, final RepositoryId repositoryId )
    {
        final StorageData data = StorageData.create().
            add( VersionIndexPath.VERSION_ID.getPath(), nodeVersion.getNodeVersionId().toString() ).
            add( VersionIndexPath.BLOB_KEY.getPath(), nodeVersion.getBlobKey().toString() ).
            add( VersionIndexPath.NODE_ID.getPath(), nodeVersion.getNodeId().toString() ).
            add( VersionIndexPath.TIMESTAMP.getPath(), nodeVersion.getTimestamp() != null ? nodeVersion.getTimestamp() : Instant.now() ).
            add( VersionIndexPath.NODE_PATH.getPath(), nodeVersion.getNodePath().toString() ).
            build();

        return StoreRequest.create().
            nodePath( nodeVersion.getNodePath() ).
            id( nodeVersion.getNodeVersionId().toString() ).
            forceRefresh( false ).
            settings( StorageSource.create().
                storageName( StoreStorageName.from( repositoryId ) ).
                storageType( StaticStorageType.VERSION ).
                build() ).
            data( data ).
            routing( nodeVersion.getNodeId().toString() ).
            build();
    }
}
