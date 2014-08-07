package com.enonic.wem.portal.script.loader;

import com.enonic.wem.api.module.ModuleKey;
import com.enonic.wem.api.resource.ResourceKey;

public interface ScriptSource
{
    public String getName();

    public String getScriptAsString();

    public long getTimestamp();

    public ModuleKey getModule();

    public ResourceKey getResource();
}
