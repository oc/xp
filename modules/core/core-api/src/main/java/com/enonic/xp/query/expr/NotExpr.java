package com.enonic.xp.query.expr;

import com.google.common.annotations.Beta;

@Beta
public final class NotExpr
    implements ConstraintExpr
{
    private final Expression expr;

    public NotExpr( final ConstraintExpr expr )
    {
        this.expr = expr;
    }

    public Expression getExpression()
    {
        return this.expr;
    }

    @Override
    public String toString()
    {
        return "NOT (" + this.expr.toString() + ")";
    }
}
