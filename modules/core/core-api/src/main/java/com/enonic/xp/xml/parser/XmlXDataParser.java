package com.enonic.xp.xml.parser;

import com.google.common.annotations.Beta;

import com.enonic.xp.schema.mixin.XData;
import com.enonic.xp.xml.DomElement;

@Beta
public final class XmlXDataParser
    extends XmlMixinParser<XmlXDataParser>
{
    public XmlMixinParser builder( final XData.Builder builder )
    {
        this.builder = builder;
        return this;
    }

    @Override
    protected void doParse( final DomElement root )
        throws Exception
    {
        super.doParse( root );

        root.getChildren( "allowContentType" ).forEach(
            domElement -> ( (XData.Builder) this.builder ).allowContentType( domElement.getValue() ) );
    }
}