package com.enonic.wem.api.content.schema.content.form.inputtype;


import com.enonic.wem.api.content.data.Data;
import com.enonic.wem.api.content.data.DataSet;
import com.enonic.wem.api.content.data.type.DataTool;
import com.enonic.wem.api.content.data.type.DataTypes;
import com.enonic.wem.api.content.data.type.InvalidValueTypeException;
import com.enonic.wem.api.content.schema.content.form.BreaksRequiredContractException;
import com.enonic.wem.api.content.schema.content.form.InvalidValueException;

public class Image
    extends BaseInputType
{
    public Image()
    {
    }

    @Override
    public void checkValidity( final Data data )
        throws InvalidValueTypeException, InvalidValueException
    {
        DataTool.checkDataType( data, "binary", DataTypes.BINARY_REFERENCE );
        DataTool.checkDataType( data, "caption", DataTypes.TEXT );
    }

    @Override
    public void ensureType( final Data data )
    {
        final DataSet dataSet = data.toDataSet();
        DataTypes.BINARY_REFERENCE.ensureType( dataSet.getData( "binary" ) );
        DataTypes.TEXT.ensureType( dataSet.getData( "caption" ) );
    }

    @Override
    public void checkBreaksRequiredContract( final Data data )
        throws BreaksRequiredContractException
    {
        final DataSet dataSet = data.toDataSet();
        final Data binary = dataSet.getData( "binary" );
        if ( binary == null )
        {
            throw new BreaksRequiredContractException( data, this );
        }
    }

}

