package com.enonic.wem.core.module;

import org.junit.Test;

import com.enonic.wem.api.form.Form;
import com.enonic.wem.api.form.Input;
import com.enonic.wem.api.form.inputtype.InputTypes;
import com.enonic.wem.api.module.Module;
import com.enonic.wem.api.module.ModuleKey;
import com.enonic.wem.api.support.SerializingTestHelper;
import com.enonic.wem.api.xml.XmlException;

import static org.junit.Assert.*;

public class ModuleXmlBuilderTest
{
    private final SerializingTestHelper serializingTestHelper;

    private final ModuleXmlBuilder xmlBuilder;

    public ModuleXmlBuilderTest()
    {
        this.serializingTestHelper = new SerializingTestHelper( this, true );
        this.xmlBuilder = new ModuleXmlBuilder();
    }

    private String loadTestXml( final String fileName )
    {
        return this.serializingTestHelper.loadTextXml( fileName );
    }

    @Test
    public void testModuleXmlDeserialization()
    {
        final String xml = loadTestXml( "serialized-module.xml" );
        final ModuleBuilder module = new ModuleBuilder().moduleKey( ModuleKey.from( "mymodule-1.0.0" ) );
        this.xmlBuilder.toModule( xml, module );
        assertEquals( createModule().toString(), module.build().toString() );
    }

    @Test(expected = XmlException.class)
    public void testBadXmlModuleSerialization()
    {
        this.xmlBuilder.toModule( "<module><display-name/>", new ModuleBuilder() );
    }

    private Module createModule()
    {
        final Form config = Form.newForm().
            addFormItem( Input.newInput().name( "some-name" ).inputType( InputTypes.TEXT_LINE ).build() ).
            build();

        return new ModuleBuilder().
            moduleKey( ModuleKey.from( "mymodule-1.0.0" ) ).
            displayName( "module display name" ).
            url( "http://enonic.net" ).
            vendorName( "Enonic" ).
            vendorUrl( "https://www.enonic.com" ).
            config( config ).
            build();
    }
}
