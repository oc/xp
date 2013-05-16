package com.enonic.wem.core.content.schema.relationship;

import javax.inject.Inject;
import javax.jcr.Session;

import com.enonic.wem.api.command.content.schema.relationship.RelationshipTypesExists;
import com.enonic.wem.api.command.content.schema.relationship.RelationshipTypesExistsResult;
import com.enonic.wem.api.content.schema.relationship.QualifiedRelationshipTypeNames;
import com.enonic.wem.core.command.CommandContext;
import com.enonic.wem.core.command.CommandHandler;
import com.enonic.wem.core.content.schema.relationship.dao.RelationshipTypeDao;


public final class RelationshipTypesExistsHandler
    extends CommandHandler<RelationshipTypesExists>
{
    private RelationshipTypeDao relationshipTypeDao;

    public RelationshipTypesExistsHandler()
    {
        super( RelationshipTypesExists.class );
    }

    @Override
    public void handle( final CommandContext context, final RelationshipTypesExists command )
        throws Exception
    {
        final Session session = context.getJcrSession();

        final QualifiedRelationshipTypeNames qualifiedNames = command.getQualifiedNames();
        final QualifiedRelationshipTypeNames existing = relationshipTypeDao.exists( qualifiedNames, session );

        command.setResult( RelationshipTypesExistsResult.from( existing ) );
    }

    @Inject
    public void setRelationshipTypeDao( final RelationshipTypeDao relationshipTypeDao )
    {
        this.relationshipTypeDao = relationshipTypeDao;
    }
}
