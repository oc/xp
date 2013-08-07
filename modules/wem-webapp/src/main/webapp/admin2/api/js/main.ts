/**
 * Main file for all admin API classes and methods.
 */

// require ExtJs as long as it is used for implementation
///<reference path='ExtJs.d.ts' />

///<reference path='plugin/PersistentGridSelectionPlugin.ts' />
///<reference path='plugin/GridToolbarPlugin.ts' />
///<reference path='plugin/fileupload/FileUploadGrid.ts' />
///<reference path='plugin/fileupload/PhotoUploadButton.ts' />
///<reference path='plugin/fileupload/PhotoUploadWindow.ts' />

///<reference path='Mousetrap.d.ts' />
///<reference path='jquery.d.ts' />
///<reference path='codemirror.d.ts' />

///<reference path='util/ImageLoader.ts' />
///<reference path='util/UriHelper.ts' />
///<reference path='util/Animation.ts'/>

///<reference path='model/Model.ts' />
///<reference path='model/SpaceModel.ts' />
///<reference path='model/ContentModel.ts' />
///<reference path='model/SchemaModel.ts' />
///<reference path='model/ContentTypeModel.ts' />

///<reference path='handler/DeleteSpaceParam.ts' />
///<reference path='handler/DeleteSpaceParamFactory.ts' />
///<reference path='handler/DeleteSpacesHandler.ts' />
///<reference path='handler/DeleteContentParam.ts' />
///<reference path='handler/DeleteContentParamFactory.ts' />
///<reference path='handler/DeleteContentHandler.ts' />
///<reference path='handler/DeleteSchemaParam.ts' />
///<reference path='handler/DeleteSchemaParamFactory.ts' />
///<reference path='handler/DeleteSchemaHandler.ts' />

///<reference path='remote/JsonRpcProvider.ts' />
///<reference path='remote/RemoteAccountService.ts' />
///<reference path='remote/RemoteSpaceService.ts' />
///<reference path='remote/RemoteContentService.ts' />
///<reference path='remote/RemoteContentTypeService.ts' />
///<reference path='remote/RemoteMixinService.ts' />
///<reference path='remote/RemoteRelationshipTypeService.ts' />
///<reference path='remote/RemoteSchemaService.ts' />
///<reference path='remote/RemoteSystemService.ts' />
///<reference path='remote/RemoteUserStoreService.ts' />

///<reference path='event/Event.ts' />
///<reference path='event/FilterSearchEvent.ts' />
///<reference path='event/EventBus.ts' />

///<reference path='notify/Message.ts' />
///<reference path='notify/NotifyManager.ts' />
///<reference path='notify/NotifyOpts.ts' />
///<reference path='notify/MessageBus.ts' />

///<reference path='dom/TextNodeHelper.ts' />
///<reference path='dom/TextNode.ts' />
///<reference path='dom/ElementHelper.ts' />
///<reference path='dom/ImgElHelper.ts' />
///<reference path='dom/Element.ts' />
///<reference path='dom/AEl.ts' />
///<reference path='dom/Body.ts' />
///<reference path='dom/DivEl.ts' />
///<reference path='dom/H1El.ts' />
///<reference path='dom/H2El.ts' />
///<reference path='dom/H3El.ts' />
///<reference path='dom/H4El.ts' />
///<reference path='dom/H5El.ts' />
///<reference path='dom/H6El.ts' />
///<reference path='dom/UlEl.ts' />
///<reference path='dom/LiEl.ts' />
///<reference path='dom/EmEl.ts' />
///<reference path='dom/ImgEl.ts' />
///<reference path='dom/SpanEl.ts' />
///<reference path='dom/ButtonEl.ts' />
///<reference path='dom/PEl.ts' />
///<reference path='dom/InputEl.ts' />
///<reference path='dom/LabelEl.ts' />
///<reference path='dom/SelectEl.ts' />
///<reference path='dom/OptionEl.ts' />
///<reference path='dom/IFrameEl.ts' />
///<reference path='dom/FieldsetEl.ts' />
///<reference path='dom/LegendEl.ts' />
///<reference path='dom/FormEl.ts' />


///<reference path='ui/KeyBindings.ts'/>
///<reference path='ui/Mnemonic.ts' />
///<reference path='ui/Action.ts' />
///<reference path='ui/Panel.ts' />
///<reference path='ui/Closeable.ts' />
///<reference path='ui/DeckPanel.ts' />
///<reference path='ui/SplitPanel.ts' />
///<reference path='ui/BodyMask.ts' />
///<reference path='ui/Tooltip.ts' />
///<reference path='ui/ProgressBar.ts' />
///<reference path='ui/Button.ts' />
///<reference path='ui/ActionButton.ts' />
///<reference path='ui/ToggleSlide.ts' />
///<reference path='ui/toolbar/Toolbar.ts' />
///<reference path='ui/menu/MenuItem.ts' />
///<reference path='ui/menu/ContextMenu.ts' />
///<reference path='ui/menu/ActionMenu.ts' />
///<reference path='ui/PanelNavigationItem.ts' />
///<reference path='ui/DeckPanelNavigator.ts' />
///<reference path='ui/tab/TabMenu.ts' />
///<reference path='ui/tab/TabMenuButton.ts' />
///<reference path='ui/tab/TabMenuItem.ts' />
///<reference path='ui/NavigatedDeckPanel.ts' />
///<reference path='ui/grid/TreeGridPanel.ts' />
///<reference path='ui/Fieldset.ts' />
///<reference path='ui/Dropdown.ts' />
///<reference path='ui/TextInput.ts' />
///<reference path='ui/AutosizeTextInput.ts' />
///<reference path='ui/TextArea.ts' />
///<reference path='ui/CodeArea.ts' />
///<reference path='ui/Form.ts' />
///<reference path='ui/FormItem.ts' />

///<reference path='app/wizard/FormIcon.ts' />
///<reference path='app/wizard/WizardEvents.ts' />
///<reference path='app/wizard/WizardPanelHeader.ts' />
///<reference path='app/wizard/WizardStepDeckPanel.ts' />
///<reference path='app/wizard/WizardStepNavigator.ts' />
///<reference path='app/wizard/WizardStepNavigationArrow.ts' />
///<reference path='app/wizard/WizardStep.ts' />
///<reference path='app/wizard/WizardPanel.ts' />

///<reference path='app/AppBar.ts' />
///<reference path='app/UserInfoPopup.ts' />
///<reference path='app/AppBarActions.ts' />
///<reference path='app/AppBarEvents.ts' />
///<reference path='app/AppBarTabMenu.ts' />
///<reference path='app/AppBarTabMenuButton.ts' />
///<reference path='app/AppBarTabMenuItem.ts' />
///<reference path='app/AppPanel.ts' />
///<reference path='app/BrowseAndWizardBasedAppPanel.ts' />

///<reference path='app/browse/BrowsePanel.ts' />
///<reference path='app/browse/BrowseItem.ts' />
///<reference path='app/browse/ItemsSelectionPanel.ts' />
///<reference path='app/browse/BrowseItemPanel.ts' />

///<reference path='app/browse/filter/BrowseFilterPanelActions.ts' />
///<reference path='app/browse/filter/Facet.ts' />
///<reference path='app/browse/filter/FacetGroup.ts' />
///<reference path='app/browse/filter/FacetContainer.ts' />
///<reference path='app/browse/filter/BrowseFilterPanel.ts' />

///<reference path='app/view/ViewItem.ts' />
///<reference path='app/view/ItemStatisticsPanel.ts' />
///<reference path='app/view/ItemViewPanel.ts' />

///<reference path='ui/dialog/DialogButton.ts' />
///<reference path='ui/dialog/ModalDialog.ts' />
///<reference path='app/delete/DeleteItem.ts' />
///<reference path='app/delete/DeleteDialog.ts' />
///<reference path='app/wizard/SaveBeforeCloseDialog.ts' />

///<reference path='content/data/DataId.ts' />
///<reference path='content/data/Data.ts' />
///<reference path='content/data/DataSet.ts' />
///<reference path='content/data/ContentData.ts' />
///<reference path='content/data/Property.ts' />

///<reference path='schema/content/form/FormItem.ts' />
///<reference path='schema/content/form/InputType.ts' />
///<reference path='schema/content/form/Input.ts' />
///<reference path='schema/content/form/Occurrences.ts' />

declare var Mousetrap;
declare var Ext;
declare var Admin;

Ext.Loader.setConfig({
    enabled: false,
    disableCaching: false
});

Ext.override(Ext.LoadMask, {
    floating: {
        shadow: false
    },
    msg: undefined,
    cls: 'admin-load-mask',
    msgCls: 'admin-load-text',
    maskCls: 'admin-mask-white'
});

