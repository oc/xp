Ext.define('Admin.view.userstore.GridPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.userstoreGrid',

    requires: [
        'Admin.plugin.PersistentGridSelectionPlugin',
        'Admin.plugin.SlidingPagerPlugin'
    ],

    layout: 'fit',
    loadMask: true,
    columnLines: true,
    frame: false,
    store: 'Admin.store.userstore.UserstoreConfigStore',

    initComponent: function () {
        this.columns = [
            {
                text: 'Display Name',
                dataIndex: 'name',
                sortable: true,
                renderer: this.nameRenderer,
                flex: 1
            },
            {
                text: 'Last Modified',
                dataIndex: 'lastModified',
                renderer: this.prettyDateRenderer,
                sortable: true
            }
        ];

        this.viewConfig = {
            trackOver: true,
            stripeRows: true
        };

        this.callParent(arguments);
    },

    nameRenderer: function (value, p, record) {
        var Templates_userstore_gridPanelNameRenderer =
    		'<div class="admin-grid-thumbnail">' +
    		    '<img src="{0}?size=32" alt="{1}"/>' +
    		'</div>' +
    		'<div class="admin-grid-description">' +
    		    '<h6>{1}</h6>' +
    		    '<p>{3}\\{2}</p>' +
    		'</div>';

        return Ext.String.format(Templates_userstore_gridPanelNameRenderer,
            'resources/images/icons/48x48/userstore.png',
            value,
            record.data.name
        );
    },

    prettyDateRenderer: function (value, p, record) {
        try {
            if (parent && Ext.isFunction(parent.humane_date)) {
                return parent.humane_date(value);
            } else {
                return value;
            }
        }
        catch (e) {
            return value;
        }
    },

    getSelection: function () {
        return this.getSelectionModel().getSelection();
    }
});
