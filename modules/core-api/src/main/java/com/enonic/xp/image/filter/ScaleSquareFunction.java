package com.enonic.xp.image.filter;

import java.awt.image.BufferedImage;

import com.google.common.annotations.Beta;

import com.enonic.xp.image.ImageHelper;
import com.enonic.xp.image.ImageScaleFunction;

@Beta
public final class ScaleSquareFunction
    extends BaseImageProcessor
    implements ImageScaleFunction
{
    private final int size;

    private final double xOffset;

    private final double yOffset;

    public ScaleSquareFunction( int size, double xOffset, double yOffset )
    {
        this.size = size;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }

    public ScaleSquareFunction( int size )
    {
        this( size, 0.5, 0.5 );
    }

    @Override
    public BufferedImage scale( BufferedImage source )
    {
        return ImageHelper.scaleSquare( source, this.size, this.xOffset, this.yOffset );
    }
}
