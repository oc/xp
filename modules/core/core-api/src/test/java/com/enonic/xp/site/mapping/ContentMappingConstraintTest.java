package com.enonic.xp.site.mapping;

import java.time.Instant;

import org.junit.Test;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ExtraData;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.page.DescriptorKey;
import com.enonic.xp.page.Page;
import com.enonic.xp.region.Component;
import com.enonic.xp.region.LayoutComponent;
import com.enonic.xp.region.PartComponent;
import com.enonic.xp.region.Region;
import com.enonic.xp.region.Regions;
import com.enonic.xp.schema.content.ContentTypeName;
import com.enonic.xp.schema.mixin.MixinName;
import com.enonic.xp.security.PrincipalKey;

import static org.junit.Assert.*;

public class ContentMappingConstraintTest
{

    @Test(expected = IllegalArgumentException.class)
    public void testInvalidExpression()
        throws Exception
    {
        ContentMappingConstraint.parse( "_path='/'" );
    }

    @Test
    public void testMatchesPath()
        throws Exception
    {
        final Content content = newContent();
        assertTrue( ContentMappingConstraint.parse( "_path:'/a/b/mycontent'" ).matches( content ) );
        assertTrue( ContentMappingConstraint.parse( "_path:'/a/b/.*'" ).matches( content ) );
        assertTrue( ContentMappingConstraint.parse( "_path:'/.*'" ).matches( content ) );
        assertFalse( ContentMappingConstraint.parse( "_path:'/'" ).matches( content ) );
        assertFalse( ContentMappingConstraint.parse( "_path:'/a/b'" ).matches( content ) );
    }

    @Test
    public void testMatchesId()
        throws Exception
    {
        final Content content = newContent();
        assertTrue( ContentMappingConstraint.parse( "_id:'123456'" ).matches( content ) );
        assertTrue( ContentMappingConstraint.parse( "_id:'12345.*'" ).matches( content ) );
        assertFalse( ContentMappingConstraint.parse( "_id:'123457'" ).matches( content ) );
    }

    @Test
    public void testMatchesName()
        throws Exception
    {
        final Content content = newContent();
        assertTrue( ContentMappingConstraint.parse( "_name:'mycontent'" ).matches( content ) );
        assertTrue( ContentMappingConstraint.parse( "_name:'my.*'" ).matches( content ) );
        assertFalse( ContentMappingConstraint.parse( "_name:''" ).matches( content ) );
    }

    @Test
    public void testMatchesDisplayName()
        throws Exception
    {
        final Content content = newContent();
        assertTrue( ContentMappingConstraint.parse( "displayName:'My Content'" ).matches( content ) );
        assertTrue( ContentMappingConstraint.parse( "displayName:'My .*'" ).matches( content ) );
        assertFalse( ContentMappingConstraint.parse( "displayName:''" ).matches( content ) );
    }

    @Test
    public void testMatchesType()
        throws Exception
    {
        final Content content = newContent();
        assertTrue( ContentMappingConstraint.parse( "type:'com.enonic.test.app:mytype'" ).matches( content ) );
        assertTrue( ContentMappingConstraint.parse( "type:'com.enonic.test.app:.*'" ).matches( content ) );
        assertFalse( ContentMappingConstraint.parse( "type:'com.enonic.test.app:other'" ).matches( content ) );
    }

    @Test
    public void testEquals()
        throws Exception
    {
        final ContentMappingConstraint constr1 = ContentMappingConstraint.parse( "_id:'123457'" );
        final ContentMappingConstraint constr2 = ContentMappingConstraint.parse( "_id:'123457'" );
        final ContentMappingConstraint constr3 = ContentMappingConstraint.parse( "_id:'12345'" );
        assertEquals( constr1, constr2 );
        assertNotEquals( constr1, constr3 );
    }

    @Test
    public void testHashCode()
        throws Exception
    {
        final ContentMappingConstraint constr1 = ContentMappingConstraint.parse( "_id:'123457'" );
        final ContentMappingConstraint constr2 = ContentMappingConstraint.parse( "_id:'123457'" );
        final ContentMappingConstraint constr3 = ContentMappingConstraint.parse( "_id:'12345'" );
        assertEquals( constr1.hashCode(), constr2.hashCode() );
        assertNotEquals( constr1.hashCode(), constr3.hashCode() );
    }

    @Test
    public void testToString()
        throws Exception
    {
        final ContentMappingConstraint constr1 = ContentMappingConstraint.parse( "_id:'123457'" );
        assertEquals( "_id:'123457'", constr1.toString() );
    }

    @Test
    public void testMatchesDataPropertyBoolean()
        throws Exception
    {
        final Content content = newContent();
        assertTrue( ContentMappingConstraint.parse( "c.h:true" ).matches( content ) );
        assertFalse( ContentMappingConstraint.parse( "c.h:false" ).matches( content ) );
    }

    @Test
    public void testMatchesDataPropertyString()
        throws Exception
    {
        final Content content = newContent();
        assertTrue( ContentMappingConstraint.parse( "c.g:'test'" ).matches( content ) );
        assertTrue( ContentMappingConstraint.parse( "c.g:test" ).matches( content ) );
        assertFalse( ContentMappingConstraint.parse( "c.g:'foo'" ).matches( content ) );
    }

    @Test
    public void testMatchesDataPropertyLong()
        throws Exception
    {
        final Content content = newContent();
        assertTrue( ContentMappingConstraint.parse( "c.i:42" ).matches( content ) );
        assertFalse( ContentMappingConstraint.parse( "c.i:1" ).matches( content ) );
    }

    @Test
    public void testMatchesDataPropertyDouble()
        throws Exception
    {
        final Content content = newContent();
        assertTrue( ContentMappingConstraint.parse( "c.j:99" ).matches( content ) );
        assertFalse( ContentMappingConstraint.parse( "c.j:1" ).matches( content ) );
    }

    private Content newContent()
    {
        final Content.Builder builder = Content.create();
        builder.id( ContentId.from( "123456" ) );
        builder.name( "mycontent" );
        builder.displayName( "My Content" );
        builder.parentPath( ContentPath.from( "/a/b" ) );
        builder.type( ContentTypeName.from( ApplicationKey.from( "com.enonic.test.app" ), "mytype" ) );
        builder.modifier( PrincipalKey.from( "user:system:admin" ) );
        builder.modifiedTime( Instant.ofEpochSecond( 0 ) );
        builder.creator( PrincipalKey.from( "user:system:admin" ) );
        builder.createdTime( Instant.ofEpochSecond( 0 ) );
        builder.data( newPropertyTree() );

        builder.addExtraData( new ExtraData( MixinName.from( "myapplication:myschema" ), newTinyPropertyTree() ) );
        builder.page( newPage() );

        return builder.build();
    }

    private PropertyTree newPropertyTree()
    {
        final PropertyTree tree = new PropertyTree();
        tree.setLong( "a", 1L );
        tree.setString( "b", "2" );

        final PropertySet set1 = tree.addSet( "c" );
        set1.setBoolean( "d", true );
        set1.addStrings( "e", "3", "4", "5" );
        set1.setLong( "f", 2L );
        set1.setString( "g", "test" );
        set1.setBoolean( "h", true );
        set1.setLong( "i", 42L );
        set1.setDouble( "j", 99.0 );

        return tree;
    }

    private PropertyTree newTinyPropertyTree()
    {
        final PropertyTree tree = new PropertyTree();
        tree.setString( "a", "1" );
        return tree;
    }

    private Page newPage()
    {
        final Page.Builder builder = Page.create();
        builder.config( newTinyPropertyTree() );
        builder.controller( DescriptorKey.from( "myapplication:mycontroller" ) );
        builder.regions( newPageRegions() );
        return builder.build();
    }

    private Regions newPageRegions()
    {
        final Regions.Builder builder = Regions.create();
        builder.add( newTopRegion() );
        return builder.build();
    }

    private Region newTopRegion()
    {
        final Region.Builder builder = Region.create();
        builder.name( "top" );
        builder.add( newPartComponent() );
        builder.add( newLayoutComponent() );
        return builder.build();
    }

    private Region newBottomRegion()
    {
        final Region.Builder builder = Region.create();
        builder.name( "bottom" );
        builder.add( newPartComponent() );
        return builder.build();
    }

    private Component newPartComponent()
    {
        final PartComponent.Builder builder = PartComponent.create();
        builder.name( "mypart" );
        builder.config( newTinyPropertyTree() );
        builder.descriptor( DescriptorKey.from( "myapplication:mypart" ) );
        return builder.build();
    }

    private LayoutComponent newLayoutComponent()
    {
        final LayoutComponent.Builder builder = LayoutComponent.create();
        builder.name( "mylayout" );
        builder.config( newTinyPropertyTree() );
        builder.descriptor( DescriptorKey.from( "myapplication:mylayout" ) );
        builder.regions( newLayoutRegions() );
        return builder.build();
    }

    private Regions newLayoutRegions()
    {
        final Regions.Builder builder = Regions.create();
        builder.add( newBottomRegion() );
        return builder.build();
    }
}