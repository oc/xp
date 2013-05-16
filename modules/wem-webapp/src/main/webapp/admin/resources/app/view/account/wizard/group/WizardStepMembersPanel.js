Ext.define('Admin.view.account.wizard.group.WizardStepMembersPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.wizardStepMembersPanel',

    requires: [ 'Admin.plugin.BoxSelect' ],
    border: false,

    initComponent: function () {
        var memberKeys = [];
        if (this.data && this.data.members) {
            Ext.Array.each(this.data.members, function (member) {
                Ext.Array.include(memberKeys, member.key);
            });
        }
        var membersList = {
            allowBlank: true,
            minChars: 1,
            forceSelection: true,
            triggerOnClick: true,
            typeAhead: true,
            xtype: 'boxselect',
            cls: 'admin-groups-boxselect',
            resizable: false,
            name: 'members',
            itemId: 'members',
            value: memberKeys,
            store: Ext.create('Admin.store.account.AccountStore', {
                autoLoad: true,
                buffered: false,
                remoteSort: false,
                sorters: [
                    {
                        property: 'type',
                        direction: 'ASC'
                    }
                ]
            }),
            mode: 'local',
            displayField: 'displayName',
            itemClassResolver: function (values) {
                if (values.type === 'user' && !values.builtIn) {
                    return 'admin-user-item';
                }
                if (values.type === 'role' || values.builtIn) {
                    return 'admin-role-item';
                } else {
                    return 'admin-group-item';
                }
            },
            listConfig: {
                getInnerTpl: function () {
                    var Templates_common_groupList =
                    		'<div class="clearfix">' +
                    		    '<div class="admin-left">' +
                    		        '<span class="{[values.type==="user" && !values.builtIn ? "icon-user" : values.type==="role" || values.builtIn ? "icon-role" : "icon-group"]} admin-list-item"></span>' +
                    		    '</div>' +
                    		    '<div class="admin-left">' +
                    		        '<span>' +
                    		            '<tpl if="type==\'user\'"> {name} ({qualifiedName})</tpl>' +
                    		            '<tpl if="type!=\'user\'">{name} ({userStore})</tpl>' +
                    		        '</span>' +
                    		    '</div>' +
                    		'</div>';
                    return Templates_common_groupList;
                }

            },
            valueField: 'key',
            growMin: 75,
            hideTrigger: true,
            pinList: false,
            labelTpl: '<tpl if="type==\'user\'">{displayName} ({qualifiedName})</tpl>' +
                      '<tpl if="type!=\'user\'">{displayName} ({userStore})</tpl>'
        };
        var newGroupButton = {
            xtype: 'button',
            action: 'newGroup',
            iconCls: 'icon-group-add-24',
            iconAlign: 'left',
            scale: 'medium',
            width: 'auto',
            text: 'New'
        };
        var formItems = [];
        if (this.data && this.data.type === 'role') {
            var roleDescription = this.getRoleDescription(this.data.name);
            var descriptionItem = {
                xtype: 'displayfield',
                fieldLabel: 'Description',
                value: roleDescription
            };
            formItems = [descriptionItem, membersList, newGroupButton];
        } else {
            formItems = [membersList, newGroupButton];
        }
        this.items = [
            {
                xtype: 'fieldset',
                title: 'Members',
                padding: '10px 15px',
                defaults: {
                    width: 600
                },
                items: formItems
            }
        ];

        this.callParent(arguments);

        // only select members from same userstore if it is remote
        this.down('#members').getStore().getProxy().extraParams = {
            currentGroupKey: this.getSelectedKey()
        };
    },

    getSelectedUserStore: function () {
        return this.userStore || this.data.userStore;
    },

    getSelectedKey: function () {
        return this.data ? this.data.key : undefined;
    },

    getData: function () {
        var selectBox = this.down('comboboxselect');
        var values = selectBox.valueModels;
        var groupsSelected = [];
        Ext.Array.each(values, function (group) {
            var groupMap = group.data.key;
            groupsSelected.push(groupMap);
        });
        var userData = { members: groupsSelected };
        return userData;
    },

    //TODO: Should be replaced, better move to some kind of service
    getRoleDescription: function (name) {
        if (name === 'Contributors') {
            return 'Sed at commodo arcu. Integer mattis lorem pharetra ligula dignissim. ';
        }
        if (name === 'Developers') {
            return 'Curabitur suscipit condimentum ultrices. Nam dolor sem, suscipit ac faucibus. ';
        }
        if (name === 'Enterprise Administrators') {
            return 'Mauris pellentesque diam in ligula pulvinar luctus. Donec ac elit. ';
        }
        if (name === 'Expert Contributors') {
            return 'Morbi vulputate purus non neque dignissim eu iaculis sapien auctor. ';
        }
        return 'Vivamus tellus turpis, varius vel hendrerit et, commodo vitae ipsum.';
    }
});
