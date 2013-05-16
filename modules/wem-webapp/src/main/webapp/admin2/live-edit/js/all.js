var LiveEdit;
(function (LiveEdit) {
    var DomHelper = (function () {
        function DomHelper() { }
        DomHelper.$ = $liveedit;
        DomHelper.getDocumentSize = function getDocumentSize() {
            var $document = DomHelper.$(document);
            return {
                width: $document.width(),
                height: $document.height()
            };
        };
        DomHelper.getViewPortSize = function getViewPortSize() {
            var $window = DomHelper.$(window);
            return {
                width: $window.width(),
                height: $window.height()
            };
        };
        DomHelper.getDocumentScrollTop = function getDocumentScrollTop() {
            return DomHelper.$(document).scrollTop();
        };
        return DomHelper;
    })();
    LiveEdit.DomHelper = DomHelper;    
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    var ComponentHelper = (function () {
        function ComponentHelper() { }
        ComponentHelper.$ = $liveedit;
        ComponentHelper.getBoxModel = function getBoxModel(component) {
            var cmp = component;
            var offset = cmp.offset();
            var top = offset.top;
            var left = offset.left;
            var width = cmp.outerWidth();
            var height = cmp.outerHeight();
            var bt = parseInt(cmp.css('borderTopWidth'), 10);
            var br = parseInt(cmp.css('borderRightWidth'), 10);
            var bb = parseInt(cmp.css('borderBottomWidth'), 10);
            var bl = parseInt(cmp.css('borderLeftWidth'), 10);
            var pt = parseInt(cmp.css('paddingTop'), 10);
            var pr = parseInt(cmp.css('paddingRight'), 10);
            var pb = parseInt(cmp.css('paddingBottom'), 10);
            var pl = parseInt(cmp.css('paddingLeft'), 10);
            return {
                top: top,
                left: left,
                width: width,
                height: height,
                borderTop: bt,
                borderRight: br,
                borderBottom: bb,
                borderLeft: bl,
                paddingTop: pt,
                paddingRight: pr,
                paddingBottom: pb,
                paddingLeft: pl
            };
        };
        ComponentHelper.getPagePositionForComponent = function getPagePositionForComponent(component) {
            var pos = component.position();
            return {
                top: pos.top,
                left: pos.left
            };
        };
        ComponentHelper.getComponentInfo = function getComponentInfo(component) {
            return {
                type: ComponentHelper.getComponentType(component),
                key: ComponentHelper.getComponentKey(component),
                name: ComponentHelper.getComponentName(component),
                tagName: ComponentHelper.getTagNameForComponent(component)
            };
        };
        ComponentHelper.getComponentType = function getComponentType(component) {
            return component.data('live-edit-type');
        };
        ComponentHelper.getComponentKey = function getComponentKey(component) {
            return component.data('live-edit-key');
        };
        ComponentHelper.getComponentName = function getComponentName(component) {
            return component.data('live-edit-name') || '[No Name]';
        };
        ComponentHelper.getTagNameForComponent = function getTagNameForComponent(component) {
            return component[0].tagName.toLowerCase();
        };
        ComponentHelper.supportsTouch = function supportsTouch() {
            return document.hasOwnProperty('ontouchend');
        };
        return ComponentHelper;
    })();
    LiveEdit.ComponentHelper = ComponentHelper;    
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    var $ = $liveedit;
    var MutationObserver = (function () {
        function MutationObserver() {
            this.mutationSummary = null;
            this.observedComponent = null;
            this.registerGlobalListeners();
        }
        MutationObserver.prototype.registerGlobalListeners = function () {
            var _this = this;
            $(window).on('paragraphEdit.liveEdit.component', function (event, component) {
                return _this.observe(event, component);
            });
            $(window).on('click.liveEdit.shader', function (event) {
                return _this.disconnect(event);
            });
        };
        MutationObserver.prototype.observe = function (event, component) {
            var _this = this;
            var isBeingObserved = this.observedComponent && this.observedComponent[0] === component[0];
            if(isBeingObserved) {
                return;
            }
            this.disconnect(event);
            this.observedComponent = component;
            this.mutationSummary = new LiveEditMutationSummary({
                callback: function (summaries) {
                    _this.onMutate(summaries, event);
                },
                rootNode: component[0],
                queries: [
                    {
                        all: true
                    }
                ]
            });
            console.log('MutationObserver: start observing component', component);
        };
        MutationObserver.prototype.disconnect = function (event) {
            var targetComponentIsSelected = (this.observedComponent && this.observedComponent.hasClass('live-edit-selected-component'));
            var componentIsSelectedAndUserMouseOut = event.type === 'mouseOut.liveEdit.component' && targetComponentIsSelected;
            if(componentIsSelectedAndUserMouseOut) {
                return;
            }
            this.observedComponent = null;
            if(this.mutationSummary) {
                this.mutationSummary.disconnect();
                this.mutationSummary = null;
                console.log('MutationObserver: disconnected');
            }
        };
        MutationObserver.prototype.onMutate = function (summaries, event) {
            if(summaries && summaries[0]) {
                var $targetComponent = $(summaries[0].target), targetComponentIsSelected = $targetComponent.hasClass('live-edit-selected-component'), componentIsNotSelectedAndMouseIsOver = !targetComponentIsSelected && event.type === 'mouseOver.liveEdit.component', componentIsParagraphAndBeingEdited = $targetComponent.attr('contenteditable');
                if(componentIsParagraphAndBeingEdited) {
                    $(window).trigger('paragraphEdit.liveEdit.component', [
                        $targetComponent
                    ]);
                } else if(componentIsNotSelectedAndMouseIsOver) {
                    $(window).trigger('mouseOver.liveEdit.component', [
                        $targetComponent
                    ]);
                } else {
                    $(window).trigger('select.liveEdit.component', [
                        $targetComponent
                    ]);
                }
            }
        };
        return MutationObserver;
    })();
    LiveEdit.MutationObserver = MutationObserver;    
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    var $ = $liveedit;
    var componentHelper = LiveEdit.ComponentHelper;
    var _isDragging = false;
    var cursorAt = LiveEdit.ComponentHelper.supportsTouch() ? {
        left: 15,
        top: 70
    } : {
        left: -10,
        top: -15
    };
    var regionSelector = '[data-live-edit-type=region]';
    var layoutSelector = '[data-live-edit-type=layout]';
    var partSelector = '[data-live-edit-type=part]';
    var paragraphSelector = '[data-live-edit-type=paragraph]';
    var itemsToSortSelector = layoutSelector + ',' + partSelector + ',' + paragraphSelector;
    var DragDropSort = (function () {
        function DragDropSort() {
            this.createSortable();
            this.registerGlobalListeners();
        }
        DragDropSort.isDragging = function isDragging() {
            return _isDragging;
        };
        DragDropSort.prototype.enableDragDrop = function () {
            $(regionSelector).sortable('enable');
        };
        DragDropSort.prototype.disableDragDrop = function () {
            $(regionSelector).sortable('disable');
        };
        DragDropSort.prototype.getDragHelperHtml = function (text) {
            return '<div id="live-edit-drag-helper" style="width: 150px; height: 16px;">' + '    <img id="live-edit-drag-helper-status-icon" src="../../../admin2/live-edit/images/drop-no.gif"/>' + '    <span id="live-edit-drag-helper-text" style="width: 134px;">' + text + '</span>' + '</div>';
        };
        DragDropSort.prototype.setDragHelperText = function (text) {
            $('#live-edit-drag-helper-text').text(text);
        };
        DragDropSort.prototype.createComponentBarDraggables = function () {
            var _this = this;
            var $componentBarComponents = $('.live-edit-component');
            var draggableOptions = {
                connectToSortable: regionSelector,
                addClasses: false,
                cursor: 'move',
                appendTo: 'body',
                zIndex: 5100000,
                revert: function (validDrop) {
                },
                cursorAt: cursorAt,
                helper: function () {
                    return _this.getDragHelperHtml('');
                },
                start: function (event, ui) {
                    $(window).trigger('dragStart.liveEdit.component', [
                        event, 
                        ui
                    ]);
                    _this.setDragHelperText($(event.target).data('live-edit-component-name'));
                    _isDragging = true;
                },
                stop: function (event, ui) {
                    $(window).trigger('dragStop.liveEdit.component', [
                        event, 
                        ui
                    ]);
                    _isDragging = false;
                }
            };
            $componentBarComponents.draggable(draggableOptions);
        };
        DragDropSort.prototype.createDragHelper = function (event, helper) {
            return $(this.getDragHelperHtml(componentHelper.getComponentName(helper)));
        };
        DragDropSort.prototype.refreshSortable = function () {
            $(regionSelector).sortable('refresh');
        };
        DragDropSort.prototype.updateHelperStatusIcon = function (status) {
            $('#live-edit-drag-helper-status-icon').attr('src', '../../../admin2/live-edit/images/drop-' + status + '.gif');
        };
        DragDropSort.prototype.targetIsPlaceholder = function (target) {
            return target.hasClass('live-edit-drop-target-placeholder');
        };
        DragDropSort.prototype.handleSortStart = function (event, ui) {
            _isDragging = true;
            var componentIsSelected = ui.item.hasClass('live-edit-selected-component');
            ui.item.data('live-edit-selected-on-sort-start', componentIsSelected);
            var targetComponentName = LiveEdit.ComponentHelper.getComponentName($(event.target));
            ui.placeholder.html('Drop component here' + '<div style="font-size: 10px;">' + targetComponentName + '</div>');
            this.refreshSortable();
            $(window).trigger('sortStart.liveEdit.component', [
                event, 
                ui
            ]);
        };
        DragDropSort.prototype.handleDragOver = function (event, ui) {
            event.stopPropagation();
            var draggedItemIsLayoutComponent = ui.item.data('live-edit-component-type') === 'layout' || ui.item.data('live-edit-type') === 'layout', isDraggingOverLayoutComponent = ui.placeholder.closest(layoutSelector).length > 0;
            if(draggedItemIsLayoutComponent && isDraggingOverLayoutComponent) {
                this.updateHelperStatusIcon('no');
                ui.placeholder.hide();
            } else {
                this.updateHelperStatusIcon('yes');
                $(window).trigger('sortOver.liveEdit.component', [
                    event, 
                    ui
                ]);
            }
        };
        DragDropSort.prototype.handleDragOut = function (event, ui) {
            if(this.targetIsPlaceholder($(event.srcElement))) {
                this.removePaddingFromLayoutComponent();
            }
            this.updateHelperStatusIcon('no');
            $(window).trigger('sortOut.liveEdit.component', [
                event, 
                ui
            ]);
        };
        DragDropSort.prototype.handleSortChange = function (event, ui) {
            this.addPaddingToLayoutComponent($(event.target));
            this.updateHelperStatusIcon('yes');
            ui.placeholder.show();
            $(window).trigger('sortChange.liveEdit.component', [
                event, 
                ui
            ]);
        };
        DragDropSort.prototype.handleSortUpdate = function (event, ui) {
            $(window).trigger('sortUpdate.liveEdit.component', [
                event, 
                ui
            ]);
        };
        DragDropSort.prototype.handleSortStop = function (event, ui) {
            _isDragging = false;
            this.removePaddingFromLayoutComponent();
            var draggedItemIsLayoutComponent = ui.item.data('live-edit-component-type') === 'layout' || ui.item.data('live-edit-type') === 'layout', targetIsInLayoutComponent = $(event.target).closest(layoutSelector).length > 0;
            if(draggedItemIsLayoutComponent && targetIsInLayoutComponent) {
                ui.item.remove();
            }
            if(LiveEdit.ComponentHelper.supportsTouch()) {
                $(window).trigger('mouseOut.liveEdit.component');
            }
            var wasSelectedOnDragStart = ui.item.data('live-edit-selected-on-drag-start');
            $(window).trigger('sortStop.liveEdit.component', [
                event, 
                ui, 
                wasSelectedOnDragStart
            ]);
            ui.item.removeData('live-edit-selected-on-drag-start');
        };
        DragDropSort.prototype.handleReceive = function (event, ui) {
            var _this = this;
            if(this.itemIsDraggedFromComponentBar(ui.item)) {
                var $componentBarComponent = $(event.target).children('.live-edit-component');
                console.log($componentBarComponent);
                var componentKey = $componentBarComponent.data('live-edit-component-key');
                var componentType = $componentBarComponent.data('live-edit-component-type');
                var url = '../../../admin2/live-edit/data/mock-component-' + componentKey + '.html';
                console.log(componentKey);
                $componentBarComponent.hide();
                $.ajax({
                    url: url,
                    cache: false
                }).done(function (html) {
                    $componentBarComponent.replaceWith(html);
                    if(componentType === 'layout') {
                        _this.createSortable();
                    }
                    $(window).trigger('sortUpdate.liveEdit.component');
                });
            }
        };
        DragDropSort.prototype.itemIsDraggedFromComponentBar = function (item) {
            return item.hasClass('live-edit-component');
        };
        DragDropSort.prototype.addPaddingToLayoutComponent = function (component) {
            component.closest(layoutSelector).addClass('live-edit-component-padding');
        };
        DragDropSort.prototype.removePaddingFromLayoutComponent = function () {
            $('.live-edit-component-padding').removeClass('live-edit-component-padding');
        };
        DragDropSort.prototype.registerGlobalListeners = function () {
            var _this = this;
            $(window).on('dataLoaded.liveEdit.componentBar', function () {
                _this.createComponentBarDraggables();
            });
            $(window).on('select.liveEdit.component', function (event, $component) {
            });
            $(window).on('deselect.liveEdit.component', function () {
                if(LiveEdit.ComponentHelper.supportsTouch() && !_isDragging) {
                    _this.disableDragDrop();
                }
            });
            $(window).on('paragraphSelect.liveEdit.component', function () {
                $(regionSelector).sortable('option', 'cancel', '[data-live-edit-type=paragraph]');
            });
            $(window).on('paragraphLeave.liveEdit.component', function () {
                $(regionSelector).sortable('option', 'cancel', '');
            });
        };
        DragDropSort.prototype.createSortable = function () {
            var _this = this;
            $(regionSelector).sortable({
                revert: false,
                connectWith: regionSelector,
                items: itemsToSortSelector,
                distance: 1,
                delay: 150,
                tolerance: 'pointer',
                cursor: 'move',
                cursorAt: cursorAt,
                scrollSensitivity: Math.round(LiveEdit.DomHelper.getViewPortSize().height / 8),
                placeholder: 'live-edit-drop-target-placeholder',
                zIndex: 1001000,
                helper: function (event, helper) {
                    return _this.createDragHelper(event, helper);
                },
                start: function (event, ui) {
                    return _this.handleSortStart(event, ui);
                },
                over: function (event, ui) {
                    return _this.handleDragOver(event, ui);
                },
                out: function (event, ui) {
                    return _this.handleDragOut(event, ui);
                },
                change: function (event, ui) {
                    return _this.handleSortChange(event, ui);
                },
                receive: function (event, ui) {
                    return _this.handleReceive(event, ui);
                },
                update: function (event, ui) {
                    return _this.handleSortUpdate(event, ui);
                },
                stop: function (event, ui) {
                    return _this.handleSortStop(event, ui);
                }
            });
        };
        return DragDropSort;
    })();
    LiveEdit.DragDropSort = DragDropSort;    
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (model) {
        var $ = $liveedit;
        var Base = (function () {
            function Base() {
                this.cssSelector = '';
            }
            Base.prototype.attachMouseOverEvent = function () {
                var _this = this;
                $(document).on('mouseover', this.cssSelector, function (event) {
                    var component = $(event.currentTarget);
                    var targetIsUiComponent = _this.isLiveEditUiComponent($(event.target));
                    var cancelEvents = targetIsUiComponent || _this.hasComponentSelected() || LiveEdit.DragDropSort.isDragging();
                    if(cancelEvents) {
                        return;
                    }
                    event.stopPropagation();
                    $(window).trigger('mouseOver.liveEdit.component', [
                        component
                    ]);
                });
            };
            Base.prototype.attachMouseOutEvent = function () {
                var _this = this;
                $(document).on('mouseout', function () {
                    if(_this.hasComponentSelected()) {
                        return;
                    }
                    $(window).trigger('mouseOut.liveEdit.component');
                });
            };
            Base.prototype.attachClickEvent = function () {
                var _this = this;
                $(document).on('click contextmenu touchstart', this.cssSelector, function (event) {
                    if(_this.isLiveEditUiComponent($(event.target))) {
                        return;
                    }
                    event.stopPropagation();
                    event.preventDefault();
                    var component = $(event.currentTarget), componentIsSelected = component.hasClass('live-edit-selected-component'), pageHasComponentSelected = $('.live-edit-selected-component').length > 0;
                    if(componentIsSelected || pageHasComponentSelected) {
                        $(window).trigger('deselect.liveEdit.component');
                    } else {
                        var pagePosition = {
                            x: event.pageX,
                            y: event.pageY
                        };
                        $(window).trigger('select.liveEdit.component', [
                            component, 
                            pagePosition
                        ]);
                    }
                });
            };
            Base.prototype.hasComponentSelected = function () {
                return $('.live-edit-selected-component').length > 0;
            };
            Base.prototype.isLiveEditUiComponent = function (target) {
                return target.is('[id*=live-edit-ui-cmp]') || target.parents('[id*=live-edit-ui-cmp]').length > 0;
            };
            Base.prototype.getAll = function () {
                return $(this.cssSelector);
            };
            return Base;
        })();
        model.Base = Base;        
    })(LiveEdit.model || (LiveEdit.model = {}));
    var model = LiveEdit.model;
})(LiveEdit || (LiveEdit = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var LiveEdit;
(function (LiveEdit) {
    (function (model) {
        var $ = $liveedit;
        var Page = (function (_super) {
            __extends(Page, _super);
            function Page() {
                        _super.call(this);
                this.cssSelector = '[data-live-edit-type=page]';
                this.attachClickEvent();
                console.log('Page model instantiated. Using jQuery ' + $().jquery);
            }
            return Page;
        })(LiveEdit.model.Base);
        model.Page = Page;        
    })(LiveEdit.model || (LiveEdit.model = {}));
    var model = LiveEdit.model;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (model) {
        var $ = $liveedit;
        var componentHelper = LiveEdit.ComponentHelper;
        var Region = (function (_super) {
            __extends(Region, _super);
            function Region() {
                        _super.call(this);
                this.cssSelector = '[data-live-edit-type=region]';
                this.renderEmptyPlaceholders();
                this.attachMouseOverEvent();
                this.attachMouseOutEvent();
                this.attachClickEvent();
                this.registerGlobalListeners();
                console.log('Region model instantiated. Using jQuery ' + $().jquery);
            }
            Region.prototype.registerGlobalListeners = function () {
                var _this = this;
                $(window).on('sortUpdate.liveEdit.component sortOver.liveEdit.component remove.liveEdit.component', function () {
                    _this.renderEmptyPlaceholders();
                });
            };
            Region.prototype.renderEmptyPlaceholders = function () {
                var _this = this;
                this.removeAllRegionPlaceholders();
                var regions = this.getAll(), region;
                regions.each(function (i) {
                    region = $(regions[i]);
                    var regionIsEmpty = _this.isRegionEmpty(region);
                    if(regionIsEmpty) {
                        _this.appendEmptyPlaceholder(region);
                    }
                });
            };
            Region.prototype.appendEmptyPlaceholder = function ($region) {
                var html = '<div>Drag components here</div>';
                html += '<div style="font-size: 10px;">' + componentHelper.getComponentName($region) + '</div>';
                var $placeholder = $('<div/>', {
                    'class': 'live-edit-empty-region-placeholder',
                    'html': html
                });
                $region.append($placeholder);
            };
            Region.prototype.isRegionEmpty = function ($region) {
                var hasNotParts = $region.children('[data-live-edit-type]' + ':not(:hidden)').length === 0;
                var hasNotDropTargetPlaceholder = $region.children('.live-edit-drop-target-placeholder').length === 0;
                return hasNotParts && hasNotDropTargetPlaceholder;
            };
            Region.prototype.removeAllRegionPlaceholders = function () {
                $('.live-edit-empty-region-placeholder').remove();
            };
            return Region;
        })(LiveEdit.model.Base);
        model.Region = Region;        
    })(LiveEdit.model || (LiveEdit.model = {}));
    var model = LiveEdit.model;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (model) {
        var $ = $liveedit;
        var Layout = (function (_super) {
            __extends(Layout, _super);
            function Layout() {
                        _super.call(this);
                this.cssSelector = '[data-live-edit-type=layout]';
                this.attachMouseOverEvent();
                this.attachMouseOutEvent();
                this.attachClickEvent();
                console.log('Layout model instantiated. Using jQuery ' + $().jquery);
            }
            return Layout;
        })(LiveEdit.model.Base);
        model.Layout = Layout;        
    })(LiveEdit.model || (LiveEdit.model = {}));
    var model = LiveEdit.model;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (model) {
        var $ = $liveedit;
        var Part = (function (_super) {
            __extends(Part, _super);
            function Part() {
                        _super.call(this);
                this.cssSelector = '[data-live-edit-type=part]';
                this.renderEmptyPlaceholders();
                this.attachMouseOverEvent();
                this.attachMouseOutEvent();
                this.attachClickEvent();
                console.log('Part model instantiated. Using jQuery ' + $().jquery);
            }
            Part.prototype.renderEmptyPlaceholders = function () {
                var _this = this;
                var parts = this.getAll(), part;
                parts.each(function (i) {
                    part = $(parts[i]);
                    if(_this.isPartEmpty(part)) {
                        _this.appendEmptyPlaceholder(part);
                    }
                });
            };
            Part.prototype.appendEmptyPlaceholder = function (part) {
                var $placeholder = $('<div/>', {
                    'class': 'live-edit-empty-part-placeholder',
                    'html': 'Empty Part'
                });
                part.append($placeholder);
            };
            Part.prototype.isPartEmpty = function (part) {
                return $(part).children().length === 0;
            };
            return Part;
        })(LiveEdit.model.Base);
        model.Part = Part;        
    })(LiveEdit.model || (LiveEdit.model = {}));
    var model = LiveEdit.model;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (model) {
        var $ = $liveedit;
        var Content = (function (_super) {
            __extends(Content, _super);
            function Content() {
                        _super.call(this);
                this.cssSelector = '[data-live-edit-type=content]';
                this.attachMouseOverEvent();
                this.attachMouseOutEvent();
                this.attachClickEvent();
                console.log('Content model instantiated. Using jQuery ' + $().jquery);
            }
            return Content;
        })(LiveEdit.model.Base);
        model.Content = Content;        
    })(LiveEdit.model || (LiveEdit.model = {}));
    var model = LiveEdit.model;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (model) {
        var $ = $liveedit;
        var Paragraph = (function (_super) {
            __extends(Paragraph, _super);
            function Paragraph() {
                        _super.call(this);
                this.selectedParagraph = null;
                this.modes = {
                };
                this.cssSelector = '[data-live-edit-type=paragraph]';
                this.modes = {
                    UNSELECTED: 0,
                    SELECTED: 1,
                    EDIT: 2
                };
                this.currentMode = this.modes.UNSELECTED;
                this.attachMouseOverEvent();
                this.attachMouseOutEvent();
                this.attachClickEvent();
                this.registerGlobalListeners();
                console.log('Paragraph model instantiated. Using jQuery ' + $().jquery);
            }
            Paragraph.prototype.registerGlobalListeners = function () {
                var _this = this;
                $(window).on('click.liveEdit.shader deselect.liveEdit.component', function (event) {
                    _this.leaveEditMode();
                });
            };
            Paragraph.prototype.attachClickEvent = function () {
                var _this = this;
                $(document).on('click contextmenu touchstart', this.cssSelector, function (event) {
                    _this.handleClick(event);
                });
            };
            Paragraph.prototype.handleClick = function (event) {
                event.stopPropagation();
                event.preventDefault();
                if(this.selectedParagraph && !(this.currentMode === this.modes.EDIT)) {
                    this.selectedParagraph.css('cursor', '');
                }
                var $paragraph = $(event.currentTarget);
                if(!$paragraph.is(this.selectedParagraph)) {
                    this.currentMode = this.modes.UNSELECTED;
                }
                this.selectedParagraph = $paragraph;
                if(this.currentMode === this.modes.UNSELECTED) {
                    this.setSelectMode(event);
                } else if(this.currentMode === this.modes.SELECTED) {
                    this.setEditMode();
                } else {
                }
            };
            Paragraph.prototype.setSelectMode = function (event) {
                this.selectedParagraph.css('cursor', 'url(../../../admin2/live-edit/images/pencil.png) 0 40, text');
                this.currentMode = this.modes.SELECTED;
                if(window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
                var pagePosition = {
                    x: event.pageX,
                    y: event.pageY
                };
                $(window).trigger('select.liveEdit.component', [
                    this.selectedParagraph, 
                    pagePosition
                ]);
                $(window).trigger('paragraphSelect.liveEdit.component', [
                    this.selectedParagraph
                ]);
            };
            Paragraph.prototype.setEditMode = function () {
                var $paragraph = this.selectedParagraph;
                $(window).trigger('paragraphEdit.liveEdit.component', [
                    this.selectedParagraph
                ]);
                $paragraph.css('cursor', 'text');
                $paragraph.addClass('live-edit-edited-paragraph');
                this.currentMode = this.modes.EDIT;
            };
            Paragraph.prototype.leaveEditMode = function () {
                var $paragraph = this.selectedParagraph;
                if($paragraph === null) {
                    return;
                }
                $(window).trigger('paragraphLeave.liveEdit.component', [
                    this.selectedParagraph
                ]);
                $paragraph.css('cursor', '');
                $paragraph.removeClass('live-edit-edited-paragraph');
                this.selectedParagraph = null;
                this.currentMode = this.modes.UNSELECTED;
            };
            return Paragraph;
        })(LiveEdit.model.Base);
        model.Paragraph = Paragraph;        
    })(LiveEdit.model || (LiveEdit.model = {}));
    var model = LiveEdit.model;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var Base = (function () {
            function Base() {
                this.ID_PREFIX = 'live-edit-ui-cmp-';
                this.id = Base.constructedCount++;
            }
            Base.constructedCount = 0;
            Base.prototype.createElement = function (htmlString) {
                this.element = $(htmlString);
                this.element.attr('id', (this.ID_PREFIX + this.id.toString()));
                return this.element;
            };
            Base.prototype.appendTo = function (parent) {
                if(parent.length > 0 && this.element.length > 0) {
                    parent.append(this.element);
                }
            };
            Base.prototype.getRootEl = function () {
                return this.element;
            };
            return Base;
        })();
        ui.Base = Base;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var HtmlElementReplacer = (function (_super) {
            __extends(HtmlElementReplacer, _super);
            function HtmlElementReplacer() {
                        _super.call(this);
                this.elementsToReplaceSpec = [
                    'iframe', 
                    'object'
                ];
                this.replaceElementsWithPlaceholders();
                console.log('HtmlElementReplacer instantiated. Using jQuery ' + $().jquery);
            }
            HtmlElementReplacer.prototype.replaceElementsWithPlaceholders = function () {
                var _this = this;
                var elements = this.getElements();
                var element;
                elements.each(function (i) {
                    element = $(elements[i]);
                    _this.replace(element);
                });
            };
            HtmlElementReplacer.prototype.replace = function (element) {
                this.hideElement(element);
                this.addPlaceholder(element);
            };
            HtmlElementReplacer.prototype.addPlaceholder = function (element) {
                this.createPlaceholder(element).insertAfter(element);
            };
            HtmlElementReplacer.prototype.createPlaceholder = function (element) {
                var placeholder = $('<div></div>');
                placeholder.addClass('live-edit-html-element-placeholder');
                placeholder.width(this.getElementWidth(element));
                placeholder.height(this.getElementHeight(element));
                var icon = $('<div/>');
                icon.addClass(this.resolveIconCssClass(element));
                icon.append('<div>' + element[0].tagName.toLowerCase() + '</div>');
                placeholder.append(icon);
                return placeholder;
            };
            HtmlElementReplacer.prototype.getElements = function () {
                return $('[data-live-edit-type=part] > ' + this.elementsToReplaceSpec.toString());
            };
            HtmlElementReplacer.prototype.getElementWidth = function (element) {
                var attrWidth = parseInt(element.attr('width'), 10);
                if(!attrWidth) {
                    return element.width() - 2;
                }
                return attrWidth;
            };
            HtmlElementReplacer.prototype.getElementHeight = function (element) {
                var attrHeight = parseInt(element.attr('height'), 10);
                if(!attrHeight) {
                    return element.height() - 2;
                }
                return attrHeight;
            };
            HtmlElementReplacer.prototype.showElement = function (element) {
                element.show(null);
            };
            HtmlElementReplacer.prototype.hideElement = function (element) {
                element.hide(null);
            };
            HtmlElementReplacer.prototype.resolveIconCssClass = function (element) {
                var tagName = element[0].tagName.toLowerCase();
                var clsName = '';
                if(tagName === 'iframe') {
                    clsName = 'live-edit-iframe';
                } else {
                    clsName = 'live-edit-object';
                }
                return clsName;
            };
            return HtmlElementReplacer;
        })(LiveEdit.ui.Base);
        ui.HtmlElementReplacer = HtmlElementReplacer;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var Editor = (function (_super) {
            __extends(Editor, _super);
            function Editor() {
                        _super.call(this);
                this.toolbar = new LiveEdit.ui.EditorToolbar();
                this.registerGlobalListeners();
                console.log('Editor instantiated. Using jQuery ' + $().jquery);
            }
            Editor.prototype.registerGlobalListeners = function () {
                var _this = this;
                $(window).on('paragraphEdit.liveEdit.component', function (event, paragraph) {
                    return _this.activate(paragraph);
                });
                $(window).on('paragraphLeave.liveEdit.component', function (event, paragraph) {
                    return _this.deActivate(paragraph);
                });
                $(window).on('buttonClick.liveEdit.editorToolbar', function (event, tag) {
                    return document.execCommand(tag, false, null);
                });
            };
            Editor.prototype.activate = function (paragraph) {
                paragraph.get(0).contentEditable = true;
                paragraph.get(0).focus();
            };
            Editor.prototype.deActivate = function (paragraph) {
                paragraph.get(0).contentEditable = false;
                paragraph.get(0).blur();
            };
            return Editor;
        })(LiveEdit.ui.Base);
        ui.Editor = Editor;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var componentHelper = LiveEdit.ComponentHelper;
        var EditorToolbar = (function (_super) {
            __extends(EditorToolbar, _super);
            function EditorToolbar() {
                        _super.call(this);
                this.selectedComponent = null;
                this.selectedComponent = null;
                this.addView();
                this.addEvents();
                this.registerGlobalListeners();
                console.log('EditorToolbar instantiated. Using jQuery ' + $().jquery);
            }
            EditorToolbar.prototype.registerGlobalListeners = function () {
                var _this = this;
                $(window).on('paragraphEdit.liveEdit.component', function (event, component) {
                    return _this.show(component);
                });
                $(window).on('paragraphLeave.liveEdit.component remove.liveEdit.component sortStart.liveEdit.component', function () {
                    return _this.hide();
                });
            };
            EditorToolbar.prototype.addView = function () {
                var html = '<div class="live-edit-editor-toolbar live-edit-arrow-bottom" style="display: none">' + '    <button data-tag="paste" class="live-edit-editor-button"></button>' + '    <button data-tag="insertUnorderedList" class="live-edit-editor-button"></button>' + '    <button data-tag="insertOrderedList" class="live-edit-editor-button"></button>' + '    <button data-tag="link" class="live-edit-editor-button"></button>' + '    <button data-tag="cut" class="live-edit-editor-button"></button>' + '    <button data-tag="strikeThrough" class="live-edit-editor-button"></button>' + '    <button data-tag="bold" class="live-edit-editor-button"></button>' + '    <button data-tag="underline" class="live-edit-editor-button"></button>' + '    <button data-tag="italic" class="live-edit-editor-button"></button>' + '    <button data-tag="superscript" class="live-edit-editor-button"></button>' + '    <button data-tag="subscript" class="live-edit-editor-button"></button>' + '    <button data-tag="justifyLeft" class="live-edit-editor-button"></button>' + '    <button data-tag="justifyCenter" class="live-edit-editor-button"></button>' + '    <button data-tag="justifyRight" class="live-edit-editor-button"></button>' + '    <button data-tag="justifyFull" class="live-edit-editor-button"></button>' + '</div>';
                this.createElement(html);
                this.appendTo($('body'));
            };
            EditorToolbar.prototype.addEvents = function () {
                var _this = this;
                this.getRootEl().on('click', function (event) {
                    event.stopPropagation();
                    var tag = event.target.getAttribute('data-tag');
                    if(tag) {
                        $(window).trigger('buttonClick.liveEdit.editorToolbar', [
                            tag
                        ]);
                    }
                });
                $(window).scroll(function () {
                    if(_this.selectedComponent) {
                        _this.updatePosition();
                    }
                });
            };
            EditorToolbar.prototype.show = function (component) {
                this.selectedComponent = component;
                this.getRootEl().show(null);
                this.toggleArrowPosition(false);
                this.updatePosition();
            };
            EditorToolbar.prototype.hide = function () {
                this.selectedComponent = null;
                this.getRootEl().hide(null);
            };
            EditorToolbar.prototype.updatePosition = function () {
                if(!this.selectedComponent) {
                    return;
                }
                var defaultPosition = this.getPositionRelativeToComponentTop();
                var stick = $(window).scrollTop() >= this.selectedComponent.offset().top - 60;
                var el = this.getRootEl();
                if(stick) {
                    el.css({
                        position: 'fixed',
                        top: 10,
                        left: defaultPosition.left
                    });
                } else {
                    el.css({
                        position: 'absolute',
                        top: defaultPosition.top,
                        left: defaultPosition.left
                    });
                }
                var placeArrowOnTop = $(window).scrollTop() >= defaultPosition.bottom - 10;
                this.toggleArrowPosition(placeArrowOnTop);
            };
            EditorToolbar.prototype.toggleArrowPosition = function (showArrowAtTop) {
                if(showArrowAtTop) {
                    this.getRootEl().removeClass('live-edit-arrow-bottom').addClass('live-edit-arrow-top');
                } else {
                    this.getRootEl().removeClass('live-edit-arrow-top').addClass('live-edit-arrow-bottom');
                }
            };
            EditorToolbar.prototype.getPositionRelativeToComponentTop = function () {
                var componentBox = componentHelper.getBoxModel(this.selectedComponent), leftPos = componentBox.left + (componentBox.width / 2 - this.getRootEl().outerWidth() / 2), topPos = componentBox.top - this.getRootEl().height() - 25;
                return {
                    left: leftPos,
                    top: topPos,
                    bottom: componentBox.top + componentBox.height
                };
            };
            return EditorToolbar;
        })(LiveEdit.ui.Base);
        ui.EditorToolbar = EditorToolbar;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var componentHelper = LiveEdit.ComponentHelper;
        var Shader = (function (_super) {
            __extends(Shader, _super);
            function Shader() {
                        _super.call(this);
                this.selectedComponent = null;
                this.addView();
                this.addEvents();
                this.registerGlobalListeners();
                console.log('Shader instantiated. Using jQuery ' + $().jquery);
            }
            Shader.prototype.registerGlobalListeners = function () {
                var _this = this;
                $(window).on('select.liveEdit.component paragraphEdit.liveEdit.component', function (event, component) {
                    return _this.show(component);
                });
                $(window).on('deselect.liveEdit.component remove.liveEdit.component sortStart.liveEdit.component', function () {
                    return _this.hide();
                });
                $(window).on('resize.liveEdit.window', function () {
                    return _this.handleWindowResize();
                });
            };
            Shader.prototype.addView = function () {
                var $body = $('body');
                this.$pageShader = $body.append('<div class="live-edit-shader" id="live-edit-page-shader"><!-- --></div>');
                this.$northShader = $('<div id="live-edit-shader-north" class="live-edit-shader"><!-- --></div>');
                $body.append(this.$northShader);
                this.$eastShader = $('<div id="live-edit-shader-east" class="live-edit-shader"><!-- --></div>');
                $body.append(this.$eastShader);
                this.$southShader = $('<div id="live-edit-shader-south" class="live-edit-shader"><!-- --></div>');
                $body.append(this.$southShader);
                this.$westShader = $('<div id="live-edit-shader-west" class="live-edit-shader"><!-- --></div>');
                $body.append(this.$westShader);
            };
            Shader.prototype.addEvents = function () {
                $('.live-edit-shader').on('click contextmenu', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    $(window).trigger('deselect.liveEdit.component');
                    $(window).trigger('click.liveEdit.shader');
                });
            };
            Shader.prototype.show = function (component) {
                this.selectedComponent = component;
                if(componentHelper.getComponentType(component) === 'page') {
                    this.showForPage();
                } else {
                    this.showForComponent(component);
                }
            };
            Shader.prototype.showForPage = function () {
                this.hide();
                $('#live-edit-page-shader').css({
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }).show();
            };
            Shader.prototype.showForComponent = function (component) {
                var documentSize = LiveEdit.DomHelper.getDocumentSize(), docWidth = documentSize.width, docHeight = documentSize.height;
                var boxModel = componentHelper.getBoxModel(component), x = boxModel.left, y = boxModel.top, w = boxModel.width, h = boxModel.height;
                this.$northShader.css({
                    top: 0,
                    left: 0,
                    width: docWidth,
                    height: y
                }).show();
                this.$eastShader.css({
                    top: y,
                    left: x + w,
                    width: docWidth - (x + w),
                    height: h
                }).show();
                this.$southShader.css({
                    top: y + h,
                    left: 0,
                    width: docWidth,
                    height: docHeight - (y + h)
                }).show();
                this.$westShader.css({
                    top: y,
                    left: 0,
                    width: x,
                    height: h
                }).show();
            };
            Shader.prototype.hide = function () {
                this.selectedComponent = null;
                var $shaders = $('.live-edit-shader');
                $shaders.hide();
            };
            Shader.prototype.handleWindowResize = function () {
                if(this.selectedComponent) {
                    this.show(this.selectedComponent);
                }
            };
            return Shader;
        })(LiveEdit.ui.Base);
        ui.Shader = Shader;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var Cursor = (function (_super) {
            __extends(Cursor, _super);
            function Cursor() {
                        _super.call(this);
                this.registerGlobalListeners();
            }
            Cursor.prototype.registerGlobalListeners = function () {
                var _this = this;
                $(window).on('mouseOver.liveEdit.component select.liveEdit.component', function (event, component) {
                    _this.updateCursor(component);
                });
                $(window).on('mouseOut.liveEdit.component', function () {
                    return _this.resetCursor();
                });
            };
            Cursor.prototype.updateCursor = function (component) {
                var componentType = LiveEdit.ComponentHelper.getComponentType(component);
                var $body = $('body');
                var cursor = 'default';
                switch(componentType) {
                    case 'region':
                        cursor = 'pointer';
                        break;
                    case 'part':
                        cursor = 'move';
                        break;
                    case 'layout':
                        cursor = 'move';
                        break;
                    case 'paragraph':
                        cursor = 'move';
                        break;
                    default:
                        cursor = 'default';
                }
                $body.css('cursor', cursor);
            };
            Cursor.prototype.resetCursor = function () {
                $('body').css('cursor', 'default');
            };
            return Cursor;
        })(LiveEdit.ui.Base);
        ui.Cursor = Cursor;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var componentHelper = LiveEdit.ComponentHelper;
        var Highlighter = (function (_super) {
            __extends(Highlighter, _super);
            function Highlighter() {
                        _super.call(this);
                this.selectedComponent = null;
                this.addView();
                this.registerGlobalListeners();
                console.log('Highlighter instantiated. Using jQuery ' + $().jquery);
            }
            Highlighter.prototype.registerGlobalListeners = function () {
                var _this = this;
                $(window).on('mouseOver.liveEdit.component', function (event, component) {
                    _this.componentMouseOver(component);
                });
                $(window).on('select.liveEdit.component', function (event, component) {
                    _this.selectComponent(component);
                });
                $(window).on('deselect.liveEdit.component', function () {
                    return _this.deselect();
                });
                $(window).on('mouseOut.liveEdit.component sortStart.liveEdit.component remove.liveEdit.component paragraphEdit.liveEdit.component', function () {
                    return _this.hide();
                });
                $(window).on('resize.liveEdit.window', function () {
                    return _this.handleWindowResize();
                });
                $(window).on('sortstop.liveedit.component', function (event, uiEvent, ui, wasSelectedOnDragStart) {
                    if(wasSelectedOnDragStart) {
                        $(window).trigger('select.liveEdit.component', [
                            ui.item
                        ]);
                    }
                });
            };
            Highlighter.prototype.addView = function () {
                var html = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="live-edit-highlight-border" style="top:-5000px;left:-5000px">' + '    <rect width="150" height="150"/>' + '</svg>';
                this.createElement(html);
                this.appendTo($('body'));
            };
            Highlighter.prototype.componentMouseOver = function (component) {
                this.show();
                this.paintBorder(component);
            };
            Highlighter.prototype.selectComponent = function (component) {
                this.selectedComponent = component;
                var componentType = componentHelper.getComponentType(component);
                $('.live-edit-selected-component').removeClass('live-edit-selected-component');
                component.addClass('live-edit-selected-component');
                if(componentType === 'page') {
                    this.hide();
                    return;
                }
                this.paintBorder(component);
                this.show();
            };
            Highlighter.prototype.deselect = function () {
                $('.live-edit-selected-component').removeClass('live-edit-selected-component');
                this.selectedComponent = null;
            };
            Highlighter.prototype.paintBorder = function (component) {
                var border = this.getRootEl();
                this.resizeBorderToComponent(component);
                var style = this.getStyleForComponent(component);
                border.css('stroke', style.strokeColor);
                border.css('fill', style.fillColor);
                border.css('stroke-dasharray', style.strokeDashArray);
            };
            Highlighter.prototype.resizeBorderToComponent = function (component) {
                var componentBoxModel = componentHelper.getBoxModel(component);
                var w = Math.round(componentBoxModel.width), h = Math.round(componentBoxModel.height), top = Math.round(componentBoxModel.top), left = Math.round(componentBoxModel.left);
                var $highlighter = this.getRootEl(), $HighlighterRect = $highlighter.find('rect');
                $highlighter.width(w);
                $highlighter.height(h);
                $HighlighterRect.attr('width', w);
                $HighlighterRect.attr('height', h);
                $highlighter.css({
                    top: top,
                    left: left
                });
            };
            Highlighter.prototype.show = function () {
                this.getRootEl().show(null);
            };
            Highlighter.prototype.hide = function () {
                this.getRootEl().hide(null);
            };
            Highlighter.prototype.getStyleForComponent = function (component) {
                var componentType = componentHelper.getComponentType(component);
                var strokeColor, strokeDashArray, fillColor;
                switch(componentType) {
                    case 'region':
                        strokeColor = 'rgba(20,20,20,1)';
                        strokeDashArray = '';
                        fillColor = 'rgba(255,255,255,0)';
                        break;
                    case 'layout':
                        strokeColor = 'rgba(255,165,0,1)';
                        strokeDashArray = '5 5';
                        fillColor = 'rgba(100,12,36,0)';
                        break;
                    case 'part':
                        strokeColor = 'rgba(68,68,68,1)';
                        strokeDashArray = '5 5';
                        fillColor = 'rgba(255,255,255,0)';
                        break;
                    case 'paragraph':
                        strokeColor = 'rgba(85,85,255,1)';
                        strokeDashArray = '5 5';
                        fillColor = 'rgba(255,255,255,0)';
                        break;
                    case 'content':
                        strokeColor = '';
                        strokeDashArray = '';
                        fillColor = 'rgba(0,108,255,.25)';
                        break;
                    default:
                        strokeColor = 'rgba(20,20,20,1)';
                        strokeDashArray = '';
                        fillColor = 'rgba(255,255,255,0)';
                }
                return {
                    strokeColor: strokeColor,
                    strokeDashArray: strokeDashArray,
                    fillColor: fillColor
                };
            };
            Highlighter.prototype.handleWindowResize = function () {
                if(this.selectedComponent) {
                    this.paintBorder(this.selectedComponent);
                }
            };
            return Highlighter;
        })(LiveEdit.ui.Base);
        ui.Highlighter = Highlighter;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var componentHelper = LiveEdit.ComponentHelper;
        var domHelper = LiveEdit.DomHelper;
        var ToolTip = (function (_super) {
            __extends(ToolTip, _super);
            function ToolTip() {
                        _super.call(this);
                this.OFFSET_X = 0;
                this.OFFSET_Y = 18;
                this.addView();
                this.attachEventListeners();
                this.registerGlobalListeners();
                console.log('ToolTip instantiated. Using jQuery ' + $().jquery);
            }
            ToolTip.prototype.registerGlobalListeners = function () {
                var _this = this;
                $(window).on('select.liveEdit.component', function () {
                    return _this.hide();
                });
            };
            ToolTip.prototype.addView = function () {
                var html = '<div class="live-edit-tool-tip" style="top:-5000px; left:-5000px;">' + '    <span class="live-edit-tool-tip-name-text"></span>' + '    <span class="live-edit-tool-tip-type-text"></span> ' + '</div>';
                this.createElement(html);
                this.appendTo($('body'));
            };
            ToolTip.prototype.setText = function (componentType, componentName) {
                var $tooltip = this.getRootEl();
                $tooltip.children('.live-edit-tool-tip-type-text').text(componentType);
                $tooltip.children('.live-edit-tool-tip-name-text').text(componentName);
            };
            ToolTip.prototype.attachEventListeners = function () {
                var _this = this;
                $(document).on('mousemove', '[data-live-edit-type]', function (event) {
                    var targetIsUiComponent = $(event.target).is('[id*=live-edit-ui-cmp]') || $(event.target).parents('[id*=live-edit-ui-cmp]').length > 0;
                    var pageHasComponentSelected = $('.live-edit-selected-component').length > 0;
                    if(targetIsUiComponent || pageHasComponentSelected || LiveEdit.DragDropSort.isDragging()) {
                        _this.hide();
                        return;
                    }
                    var $component = $(event.target).closest('[data-live-edit-type]');
                    var componentInfo = componentHelper.getComponentInfo($component);
                    var pos = _this.getPosition(event);
                    _this.getRootEl().css({
                        top: pos.y,
                        left: pos.x
                    });
                    _this.setText(componentInfo.type, componentInfo.name);
                });
                $(document).on('hover', '[data-live-edit-type]', function (event) {
                    if(event.type === 'mouseenter') {
                        _this.getRootEl().hide(null).fadeIn(300);
                    }
                });
                $(document).on('mouseout', function () {
                    return _this.hide();
                });
            };
            ToolTip.prototype.getPosition = function (event) {
                var pageX = event.pageX;
                var pageY = event.pageY;
                var x = pageX + this.OFFSET_X;
                var y = pageY + this.OFFSET_Y;
                var viewPortSize = domHelper.getViewPortSize();
                var scrollTop = domHelper.getDocumentScrollTop();
                var toolTipWidth = this.getRootEl().width();
                var toolTipHeight = this.getRootEl().height();
                if(x + toolTipWidth > (viewPortSize.width - this.OFFSET_X * 2) - 50) {
                    x = pageX - toolTipWidth - (this.OFFSET_X * 2);
                }
                if(y + toolTipHeight > (viewPortSize.height + scrollTop - this.OFFSET_Y * 2)) {
                    y = pageY - toolTipHeight - (this.OFFSET_Y * 2);
                }
                return {
                    x: x,
                    y: y
                };
            };
            ToolTip.prototype.hide = function () {
                this.getRootEl().css({
                    top: '-5000px',
                    left: '-5000px'
                });
            };
            return ToolTip;
        })(LiveEdit.ui.Base);
        ui.ToolTip = ToolTip;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var componentHelper = LiveEdit.ComponentHelper;
        var domHelper = LiveEdit.DomHelper;
        var Menu = (function (_super) {
            __extends(Menu, _super);
            function Menu() {
                        _super.call(this);
                this.previousPageSizes = null;
                this.previousPagePositions = null;
                this.hidden = true;
                this.buttons = [];
                this.buttonConfig = {
                    'page': [
                        'settings', 
                        'reset'
                    ],
                    'region': [
                        'parent', 
                        'settings', 
                        'reset', 
                        'clear'
                    ],
                    'layout': [
                        'parent', 
                        'settings', 
                        'remove'
                    ],
                    'part': [
                        'parent', 
                        'settings', 
                        'details', 
                        'remove'
                    ],
                    'content': [
                        'parent', 
                        'opencontent', 
                        'view'
                    ],
                    'paragraph': [
                        'parent', 
                        'edit', 
                        'remove'
                    ]
                };
                this.addView();
                this.registerEvents();
                this.registerGlobalListeners();
                console.log('Menu instantiated. Using jQuery ' + $().jquery);
            }
            Menu.prototype.registerGlobalListeners = function () {
                var _this = this;
                $(window).on('select.liveEdit.component', function (event, $component, pagePosition) {
                    return _this.show($component, pagePosition);
                });
                $(window).on('deselect.liveEdit.component remove.liveEdit.component paragraphEdit.liveEdit.component', function () {
                    return _this.hide();
                });
                $(window).on('sortStart.liveEdit.component', function () {
                    return _this.fadeOutAndHide();
                });
            };
            Menu.prototype.addView = function () {
                var html = '';
                html += '<div class="live-edit-component-menu live-edit-arrow-top" style="display: none">';
                html += '   <div class="live-edit-component-menu-title-bar">';
                html += '       <div class="live-edit-component-menu-title-icon"><div><!-- --></div></div>';
                html += '       <div class="live-edit-component-menu-title-text"><!-- populated --></div>';
                html += '       <div class="live-edit-component-menu-title-close-button"><!-- --></div>';
                html += '   </div>';
                html += '   <div class="live-edit-component-menu-items">';
                html += '   </div>';
                html += '</div>';
                this.createElement(html);
                this.appendTo($('body'));
                this.addButtons();
            };
            Menu.prototype.registerEvents = function () {
                this.getRootEl().draggable({
                    handle: '.live-edit-component-menu-title-bar',
                    addClasses: false
                });
                this.getCloseButton().click(function () {
                    $(window).trigger('deselect.liveEdit.component');
                });
            };
            Menu.prototype.show = function (component, pagePosition) {
                this.selectedComponent = component;
                this.previousPagePositions = pagePosition;
                this.previousPageSizes = domHelper.getViewPortSize();
                this.updateTitleBar(component);
                this.updateMenuItemsForComponent(component);
                var pageXPosition = pagePosition.x - this.getRootEl().width() / 2, pageYPosition = pagePosition.y + 15;
                this.moveToXY(pageXPosition, pageYPosition);
                this.getRootEl().show(null);
                this.hidden = false;
            };
            Menu.prototype.hide = function () {
                this.selectedComponent = null;
                this.getRootEl().hide(null);
                this.hidden = true;
            };
            Menu.prototype.fadeOutAndHide = function () {
                var _this = this;
                this.getRootEl().fadeOut(500, function () {
                    _this.hide();
                    $(window).trigger('deselect.liveEdit.component', {
                        showComponentBar: false
                    });
                });
                this.selectedComponent = null;
            };
            Menu.prototype.moveToXY = function (x, y) {
                this.getRootEl().css({
                    left: x,
                    top: y
                });
            };
            Menu.prototype.addButtons = function () {
                var parentButton = new LiveEdit.ui.ParentButton(this);
                var settingsButton = new LiveEdit.ui.SettingsButton(this);
                var detailsButton = new LiveEdit.ui.DetailsButton(this);
                var insertButton = new LiveEdit.ui.InsertButton(this);
                var resetButton = new LiveEdit.ui.ResetButton(this);
                var clearButton = new LiveEdit.ui.ClearButton(this);
                var openContentButton = new LiveEdit.ui.OpenContentButton(this);
                var viewButton = new LiveEdit.ui.ViewButton(this);
                var editButton = new LiveEdit.ui.EditButton(this);
                var removeButton = new LiveEdit.ui.RemoveButton(this);
                var i, $menuItemsPlaceholder = this.getMenuItemsPlaceholderElement();
                for(i = 0; i < this.buttons.length; i++) {
                    this.buttons[i].appendTo($menuItemsPlaceholder);
                }
            };
            Menu.prototype.updateMenuItemsForComponent = function (component) {
                var componentType = componentHelper.getComponentType(component);
                var buttonArray = this.getConfigForButton(componentType);
                var buttons = this.getButtons();
                var i;
                for(i = 0; i < buttons.length; i++) {
                    var $button = buttons[i].getRootEl();
                    var id = $button.attr('data-live-edit-ui-cmp-id');
                    var subStr = id.substring(id.lastIndexOf('-') + 1, id.length);
                    if(buttonArray.indexOf(subStr) > -1) {
                        $button.show();
                    } else {
                        $button.hide();
                    }
                }
            };
            Menu.prototype.updateTitleBar = function (component) {
                var componentInfo = componentHelper.getComponentInfo(component);
                this.setIcon(componentInfo.type);
                this.setTitle(componentInfo.name);
            };
            Menu.prototype.setTitle = function (titleText) {
                this.getTitleElement().text(titleText);
            };
            Menu.prototype.setIcon = function (componentType) {
                var $iconCt = this.getIconElement(), iconCls = this.resolveCssClassForComponentType(componentType);
                $iconCt.children('div').attr('class', iconCls);
                $iconCt.attr('title', componentType);
            };
            Menu.prototype.resolveCssClassForComponentType = function (componentType) {
                var iconCls;
                switch(componentType) {
                    case 'page':
                        iconCls = 'live-edit-component-menu-page-icon';
                        break;
                    case 'region':
                        iconCls = 'live-edit-component-menu-region-icon';
                        break;
                    case 'layout':
                        iconCls = 'live-edit-component-menu-layout-icon';
                        break;
                    case 'part':
                        iconCls = 'live-edit-component-menu-part-icon';
                        break;
                    case 'content':
                        iconCls = 'live-edit-component-menu-content-icon';
                        break;
                    case 'paragraph':
                        iconCls = 'live-edit-component-menu-paragraph-icon';
                        break;
                    default:
                        iconCls = '';
                }
                return iconCls;
            };
            Menu.prototype.getButtons = function () {
                return this.buttons;
            };
            Menu.prototype.getConfigForButton = function (componentType) {
                return this.buttonConfig[componentType];
            };
            Menu.prototype.getIconElement = function () {
                return $('.live-edit-component-menu-title-icon', this.getRootEl());
            };
            Menu.prototype.getTitleElement = function () {
                return $('.live-edit-component-menu-title-text', this.getRootEl());
            };
            Menu.prototype.getCloseButton = function () {
                return $('.live-edit-component-menu-title-close-button', this.getRootEl());
            };
            Menu.prototype.getMenuItemsPlaceholderElement = function () {
                return $('.live-edit-component-menu-items', this.getRootEl());
            };
            return Menu;
        })(LiveEdit.ui.Base);
        ui.Menu = Menu;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var BaseButton = (function (_super) {
            __extends(BaseButton, _super);
            function BaseButton() {
                        _super.call(this);
            }
            BaseButton.prototype.createButton = function (config) {
                var _this = this;
                var id = config.id || '';
                var text = config.text;
                var cls = config.cls || '';
                var iconCls = config.iconCls || '';
                var html = '<div data-live-edit-ui-cmp-id="' + id + '" class="live-edit-button ' + cls + '">';
                if(iconCls !== '') {
                    html += '<span class="live-edit-button-icon ' + iconCls + '"></span>';
                }
                html += '<span class="live-edit-button-text">' + text + '</span></div>';
                var $button = this.createElement(html);
                if(config.handler) {
                    $button.on('click', function (event) {
                        return config.handler.call(_this, event);
                    });
                }
                return $button;
            };
            return BaseButton;
        })(LiveEdit.ui.Base);
        ui.BaseButton = BaseButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var componentHelper = LiveEdit.ComponentHelper;
        var ParentButton = (function (_super) {
            __extends(ParentButton, _super);
            function ParentButton(menu) {
                        _super.call(this);
                this.menu = null;
                this.menu = menu;
                this.init();
            }
            ParentButton.prototype.init = function () {
                var _this = this;
                var $button = this.createButton({
                    id: 'live-edit-button-parent',
                    text: 'Select Parent',
                    cls: 'live-edit-component-menu-button',
                    handler: function (event) {
                        event.stopPropagation();
                        var $parent = _this.menu.selectedComponent.parents('[data-live-edit-type]');
                        if($parent && $parent.length > 0) {
                            $parent = $($parent[0]);
                            $(window).trigger('select.liveEdit.component', [
                                $parent, 
                                {
                                    x: 0,
                                    y: 0
                                }
                            ]);
                            _this.scrollComponentIntoView($parent);
                            var menuWidth = _this.menu.getRootEl().outerWidth();
                            var componentBox = componentHelper.getBoxModel($parent), newMenuPosition = {
                                x: componentBox.left + (componentBox.width / 2) - (menuWidth / 2),
                                y: componentBox.top + 10
                            };
                            _this.menu.moveToXY(newMenuPosition.x, newMenuPosition.y);
                        }
                    }
                });
                this.appendTo(this.menu.getRootEl());
                this.menu.buttons.push(this);
            };
            ParentButton.prototype.scrollComponentIntoView = function ($component) {
                var componentTopPosition = componentHelper.getPagePositionForComponent($component).top;
                if(componentTopPosition <= window.pageYOffset) {
                    $('html, body').animate({
                        scrollTop: componentTopPosition - 10
                    }, 200);
                }
            };
            return ParentButton;
        })(LiveEdit.ui.BaseButton);
        ui.ParentButton = ParentButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var OpenContentButton = (function (_super) {
            __extends(OpenContentButton, _super);
            function OpenContentButton(menu) {
                        _super.call(this);
                this.menu = null;
                this.menu = menu;
                this.init();
            }
            OpenContentButton.prototype.init = function () {
                var $button = this.createButton({
                    text: 'Open in new tab',
                    id: 'live-edit-button-opencontent',
                    cls: 'live-edit-component-menu-button',
                    handler: function (event) {
                        event.stopPropagation();
                        var parentWindow = window['parent'];
                        if(parentWindow && parentWindow['Admin'].MessageBus) {
                            parentWindow['Admin'].MessageBus.liveEditOpenContent();
                        }
                    }
                });
                this.appendTo(this.menu.getRootEl());
                this.menu.buttons.push(this);
            };
            return OpenContentButton;
        })(LiveEdit.ui.BaseButton);
        ui.OpenContentButton = OpenContentButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var InsertButton = (function (_super) {
            __extends(InsertButton, _super);
            function InsertButton(menu) {
                        _super.call(this);
                this.menu = null;
                this.menu = menu;
                this.init();
            }
            InsertButton.prototype.init = function () {
                var $button = this.createButton({
                    text: 'Insert',
                    id: 'live-edit-button-insert',
                    cls: 'live-edit-component-menu-button',
                    handler: function (event) {
                        event.stopPropagation();
                    }
                });
                this.appendTo(this.menu.getRootEl());
                this.menu.buttons.push(this);
            };
            return InsertButton;
        })(LiveEdit.ui.BaseButton);
        ui.InsertButton = InsertButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var DetailsButton = (function (_super) {
            __extends(DetailsButton, _super);
            function DetailsButton(menu) {
                        _super.call(this);
                this.menu = null;
                this.menu = menu;
                this.init();
            }
            DetailsButton.prototype.init = function () {
                var $button = this.createButton({
                    text: 'Show Details',
                    id: 'live-edit-button-details',
                    cls: 'live-edit-component-menu-button',
                    handler: function (event) {
                        event.stopPropagation();
                    }
                });
                this.appendTo(this.menu.getRootEl());
                this.menu.buttons.push(this);
            };
            return DetailsButton;
        })(LiveEdit.ui.BaseButton);
        ui.DetailsButton = DetailsButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var EditButton = (function (_super) {
            __extends(EditButton, _super);
            function EditButton(menu) {
                        _super.call(this);
                this.menu = null;
                this.menu = menu;
                this.init();
            }
            EditButton.prototype.init = function () {
                var _this = this;
                var $button = this.createButton({
                    id: 'live-edit-button-edit',
                    text: 'Edit',
                    cls: 'live-edit-component-menu-button',
                    handler: function (event) {
                        event.stopPropagation();
                        var $paragraph = _this.menu.selectedComponent;
                        if($paragraph && $paragraph.length > 0) {
                            $(window).trigger('paragraphEdit.liveEdit.component', [
                                $paragraph
                            ]);
                        }
                    }
                });
                this.appendTo(this.menu.getRootEl());
                this.menu.buttons.push(this);
            };
            return EditButton;
        })(LiveEdit.ui.BaseButton);
        ui.EditButton = EditButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var ResetButton = (function (_super) {
            __extends(ResetButton, _super);
            function ResetButton(menu) {
                        _super.call(this);
                this.menu = null;
                this.menu = menu;
                this.init();
            }
            ResetButton.prototype.init = function () {
                var $button = this.createButton({
                    text: 'Reset to Default',
                    id: 'live-edit-button-reset',
                    cls: 'live-edit-component-menu-button',
                    handler: function (event) {
                        return event.stopPropagation();
                    }
                });
                this.appendTo(this.menu.getRootEl());
                this.menu.buttons.push(this);
            };
            return ResetButton;
        })(LiveEdit.ui.BaseButton);
        ui.ResetButton = ResetButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var ClearButton = (function (_super) {
            __extends(ClearButton, _super);
            function ClearButton(menu) {
                        _super.call(this);
                this.menu = null;
                this.menu = menu;
                this.init();
            }
            ClearButton.prototype.init = function () {
                var $button = this.createButton({
                    text: 'Empty',
                    id: 'live-edit-button-clear',
                    cls: 'live-edit-component-menu-button',
                    handler: function (event) {
                        event.stopPropagation();
                    }
                });
                this.appendTo(this.menu.getRootEl());
                this.menu.buttons.push(this);
            };
            return ClearButton;
        })(LiveEdit.ui.BaseButton);
        ui.ClearButton = ClearButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var ViewButton = (function (_super) {
            __extends(ViewButton, _super);
            function ViewButton(menu) {
                        _super.call(this);
                this.menu = null;
                this.menu = menu;
                this.init();
            }
            ViewButton.prototype.init = function () {
                var $button = this.createButton({
                    text: 'View',
                    id: 'live-edit-button-view',
                    cls: 'live-edit-component-menu-button',
                    handler: function (event) {
                        return event.stopPropagation();
                    }
                });
                this.appendTo(this.menu.getRootEl());
                this.menu.buttons.push(this);
            };
            return ViewButton;
        })(LiveEdit.ui.BaseButton);
        ui.ViewButton = ViewButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var SettingsButton = (function (_super) {
            __extends(SettingsButton, _super);
            function SettingsButton(menu) {
                        _super.call(this);
                this.menu = null;
                this.menu = menu;
                this.init();
            }
            SettingsButton.prototype.init = function () {
                var $button = this.createButton({
                    text: 'Settings',
                    id: 'live-edit-button-settings',
                    cls: 'live-edit-component-menu-button',
                    handler: function (event) {
                        event.stopPropagation();
                        var parentWindow = window['parent'];
                        if(parentWindow && parentWindow['Admin'].MessageBus) {
                            parentWindow['Admin'].MessageBus.showLiveEditTestSettingsWindow({
                            });
                        }
                    }
                });
                this.appendTo(this.menu.getRootEl());
                this.menu.buttons.push(this);
            };
            return SettingsButton;
        })(LiveEdit.ui.BaseButton);
        ui.SettingsButton = SettingsButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var RemoveButton = (function (_super) {
            __extends(RemoveButton, _super);
            function RemoveButton(menu) {
                        _super.call(this);
                this.menu = null;
                this.menu = menu;
                this.init();
            }
            RemoveButton.prototype.init = function () {
                var _this = this;
                var $button = this.createButton({
                    text: 'Remove',
                    id: 'live-edit-button-remove',
                    cls: 'live-edit-component-menu-button',
                    handler: function (event) {
                        event.stopPropagation();
                        _this.menu.selectedComponent.remove();
                        $(window).trigger('remove.liveEdit.component');
                    }
                });
                this.appendTo(this.menu.getRootEl());
                this.menu.buttons.push(this);
            };
            return RemoveButton;
        })(LiveEdit.ui.BaseButton);
        ui.RemoveButton = RemoveButton;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
var LiveEdit;
(function (LiveEdit) {
    (function (ui) {
        var $ = $liveedit;
        var ComponentBar = (function (_super) {
            __extends(ComponentBar, _super);
            function ComponentBar() {
                        _super.call(this);
                this.BAR_WIDTH = 235;
                this.TOGGLE_WIDTH = 30;
                this.INNER_WIDTH = this.BAR_WIDTH - this.TOGGLE_WIDTH;
                this.hidden = true;
                this.addView();
                this.loadComponentsData();
                this.registerGlobalListeners();
                this.registerEvents();
                console.log('ComponentBar instantiated. Using jQuery ' + $().jquery);
            }
            ComponentBar.prototype.registerGlobalListeners = function () {
                var _this = this;
                $(window).on('select.liveEdit.component dragStart.liveEdit.component sortStart.liveEdit.component', function () {
                    return _this.fadeOut();
                });
                $(window).on('deselect.liveEdit.component dragStop.liveEdit.component sortstop.liveedit.component sortUpdate.liveEdit.component remove.liveEdit.component', function (event, triggerConfig) {
                    return _this.fadeIn(triggerConfig);
                });
            };
            ComponentBar.prototype.getComponentsDataUrl = function () {
                return '../../../admin2/live-edit/data/mock-components.json';
            };
            ComponentBar.prototype.addView = function () {
                var html = '';
                html += '<div class="live-edit-components-container live-edit-collapsed" style="width:' + this.BAR_WIDTH + 'px; right: -' + this.INNER_WIDTH + 'px">';
                html += '    <div class="live-edit-toggle-components-container" style="width:' + this.TOGGLE_WIDTH + 'px"><span class="live-edit-toggle-text-container">Toolbar</span></div>';
                html += '        <div class="live-edit-components">';
                html += '            <div class="live-edit-form-container">';
                html += '               <form onsubmit="return false;">';
                html += '                   <input type="text" placeholder="Filter" name="filter"/>';
                html += '               </form>';
                html += '            </div>';
                html += '            <ul>';
                html += '            </ul>';
                html += '        </div>';
                html += '    </div>';
                html += '</div>';
                this.createElement(html);
                this.appendTo($('body'));
            };
            ComponentBar.prototype.registerEvents = function () {
                var _this = this;
                this.getToggle().click(function () {
                    _this.toggle();
                });
                this.getFilterInput().on('keyup', function () {
                    _this.filterList($(_this).val());
                });
                this.getBar().on('mouseover', function () {
                    $(window).trigger('mouseOver.liveEdit.componentBar');
                });
            };
            ComponentBar.prototype.loadComponentsData = function () {
                var _this = this;
                $.getJSON(this.getComponentsDataUrl(), null, function (data, textStatus, jqXHR) {
                    _this.renderComponents(data);
                    $(window).trigger('dataLoaded.liveEdit.componentBar');
                });
            };
            ComponentBar.prototype.renderComponents = function (jsonData) {
                var _this = this;
                var groups = jsonData.componentGroups;
                $.each(groups, function (index, group) {
                    _this.addHeader(group);
                    if(group.components) {
                        _this.addComponentsToGroup(group.components);
                    }
                });
            };
            ComponentBar.prototype.addHeader = function (componentGroup) {
                var html = '';
                html += '<li class="live-edit-component-list-header">';
                html += '    <span>' + componentGroup.name + '</span>';
                html += '</li>';
                this.getComponentsContainer().append(html);
            };
            ComponentBar.prototype.addComponentsToGroup = function (components) {
                var _this = this;
                $.each(components, function (index, component) {
                    _this.addComponent(component);
                });
            };
            ComponentBar.prototype.addComponent = function (component) {
                var html = '';
                html += '<li class="live-edit-component" data-live-edit-component-key="' + component.key + '" data-live-edit-component-name="' + component.name + '" data-live-edit-component-type="' + component.type + '">';
                html += '    <img src="' + component.icon + '"/>';
                html += '    <div class="live-edit-component-text">';
                html += '        <div class="live-edit-component-text-name">' + component.name + '</div>';
                html += '        <div class="live-edit-component-text-subtitle">' + component.subtitle + '</div>';
                html += '    </div>';
                html += '</li>';
                this.getComponentsContainer().append(html);
            };
            ComponentBar.prototype.filterList = function (value) {
                var $element, name, valueLowerCased = value.toLowerCase();
                var list = this.getComponentList();
                list.each(function (index) {
                    $element = list[index];
                    name = $element.data('live-edit-component-name').toLowerCase();
                    $element.css('display', name.indexOf(valueLowerCased) > -1 ? '' : 'none');
                });
            };
            ComponentBar.prototype.toggle = function () {
                if(this.hidden) {
                    this.show();
                    this.hidden = false;
                } else {
                    this.hide();
                    this.hidden = true;
                }
            };
            ComponentBar.prototype.show = function () {
                var $bar = this.getBar();
                $bar.css('right', '0');
                this.getToggleTextContainer().text('');
                $bar.removeClass('live-edit-collapsed');
            };
            ComponentBar.prototype.hide = function () {
                var $bar = this.getBar();
                $bar.css('right', '-' + this.INNER_WIDTH + 'px');
                this.getToggleTextContainer().text('Toolbar');
                $bar.addClass('live-edit-collapsed');
            };
            ComponentBar.prototype.fadeIn = function (triggerConfig) {
                if(triggerConfig && triggerConfig.showComponentBar === false) {
                    return;
                }
                this.getBar().fadeIn(120);
            };
            ComponentBar.prototype.fadeOut = function () {
                this.getBar().fadeOut(120);
            };
            ComponentBar.prototype.getBar = function () {
                return this.getRootEl();
            };
            ComponentBar.prototype.getToggle = function () {
                return $('.live-edit-toggle-components-container', this.getRootEl());
            };
            ComponentBar.prototype.getFilterInput = function () {
                return $('.live-edit-form-container input[name=filter]', this.getRootEl());
            };
            ComponentBar.prototype.getComponentsContainer = function () {
                return $('.live-edit-components ul', this.getRootEl());
            };
            ComponentBar.prototype.getComponentList = function () {
                return $('.live-edit-component', this.getRootEl());
            };
            ComponentBar.prototype.getToggleTextContainer = function () {
                return $('.live-edit-toggle-text-container', this.getRootEl());
            };
            return ComponentBar;
        })(LiveEdit.ui.Base);
        ui.ComponentBar = ComponentBar;        
    })(LiveEdit.ui || (LiveEdit.ui = {}));
    var ui = LiveEdit.ui;
})(LiveEdit || (LiveEdit = {}));
((function ($) {
    'use strict';
    $(window).load(function () {
        var loaderSplash = $('.live-edit-loader-splash-container');
        loaderSplash.fadeOut('fast', function () {
            loaderSplash.remove();
            new LiveEdit.model.Page();
            new LiveEdit.model.Region();
            new LiveEdit.model.Layout();
            new LiveEdit.model.Part();
            new LiveEdit.model.Paragraph();
            new LiveEdit.model.Content();
            new LiveEdit.ui.HtmlElementReplacer();
            new LiveEdit.ui.Highlighter();
            new LiveEdit.ui.ToolTip();
            new LiveEdit.ui.Cursor();
            new LiveEdit.ui.Menu();
            new LiveEdit.ui.Shader();
            new LiveEdit.ui.Editor();
            new LiveEdit.ui.ComponentBar();
            new LiveEdit.MutationObserver();
            new LiveEdit.DragDropSort();
            $(window).resize(function () {
                return $(window).trigger('resize.liveEdit.window');
            });
        });
    });
    $(document).ready(function () {
        $(document).on('mousedown', 'btn, button, a, select', function (event) {
            event.preventDefault();
            return false;
        });
    });
})($liveedit));
//@ sourceMappingURL=all.js.map
