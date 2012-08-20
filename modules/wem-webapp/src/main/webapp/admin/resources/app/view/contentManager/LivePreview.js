Ext.define('Admin.view.contentManager.LivePreview', {
    extend: 'Ext.Component',
    alias: 'widget.contentLive',

    html: '<iframe style="border: 0 none; margin: -1px 0; width: 100%; height: 100%;"></iframe>',
    autoScroll: false,
    styleHtmlContent: true,
    layout: 'fit',

    initComponent: function () {

        this.callParent(arguments);

    },

    load: function (url) {
        var iframe = this.getTargetEl().down('iframe');
        if (!Ext.isEmpty(url)) {
            iframe.dom.src = Admin.lib.UriHelper.getAbsoluteUri(url);
        } else {
            iframe.update("<h2 class='message'>Page can't be found.</h2>");
        }
    }

});
