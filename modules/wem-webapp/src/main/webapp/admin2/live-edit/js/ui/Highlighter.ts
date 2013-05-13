module LiveEdit.ui {
    var $ = $liveedit;

    var componentHelper = LiveEdit.ComponentHelper;

    export class Highlighter extends LiveEdit.ui.Base {

        private selectedComponent:JQuery = null;

        constructor() {
            super();
            this.addView();
            this.registerGlobalListeners();

            console.log('Highlighter instantiated. Using jQuery ' + $().jquery);
        }


        private registerGlobalListeners() {
            $(window).on('component.mouseOver', (event, component) => {
                this.componentMouseOver(event, component);
            });

            $(window).on('component.onSelect', (event, component) => {
                this.selectComponent(event, component);
            });

            $(window).on('component.onDeselect', () => {
                this.deselect();
            });

            $(window).on('component.mouseOut component.onSortStart component.onRemove component.onParagraphEdit', () => {
                this.hide();
            });

            $(window).on('liveEdit.onWindowResize', (event:JQueryEventObject) => {
                this.handleWindowResize(event)
            });

            $(window).on('component.onSortStop', (event, uiEvent, ui, wasSelectedOnDragStart) => {
                if (wasSelectedOnDragStart) {
                    $(window).trigger('component.onSelect', [ui.item]);
                }
            });
        }


        private addView() {
            var html =  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="live-edit-highlight-border" style="top:-5000px;left:-5000px">' +
                        '    <rect width="150" height="150"/>' +
                        '</svg>';

            this.createElement(html);
            this.appendTo($('body'));
        }


        private componentMouseOver(event, component) {
            this.show();
            this.paintBorder(component);
        }


        private selectComponent(event, component) {
            this.selectedComponent = component;
            var componentType = componentHelper.getComponentType(component);

            // Move CSS class manipulation to model base
            $('.live-edit-selected-component').removeClass('live-edit-selected-component');

            component.addClass('live-edit-selected-component');

            // Highlighter should not be shown when type page is selected
            if (componentType === 'page') {
                this.hide();
                return;
            }

            this.paintBorder(component);
            this.show();
        }


        deselect() {
            $('.live-edit-selected-component').removeClass('live-edit-selected-component');
            this.selectedComponent = null;
        }


        paintBorder(component) {
            var border = this.getEl();

            this.resizeBorderToComponent(component);

            var style = this.getStyleForComponent(component);
            border.css('stroke', style.strokeColor);
            border.css('fill', style.fillColor);
            border.css('stroke-dasharray', style.strokeDashArray);
        }


        resizeBorderToComponent(component) {
            var componentBoxModel = componentHelper.getBoxModel(component);
            var w = Math.round(componentBoxModel.width),
                h = Math.round(componentBoxModel.height),
                top = Math.round(componentBoxModel.top),
                left = Math.round(componentBoxModel.left);

            var $highlighter = this.getEl(),
                $HighlighterRect = $highlighter.find('rect');

            $highlighter.width(w);
            $highlighter.height(h);
            $HighlighterRect.attr('width', w);
            $HighlighterRect.attr('height', h);
            $highlighter.css({
                top: top,
                left: left
            });
        }


        show() {
            this.getEl().show();
        }


        hide() {
            this.getEl().hide();
        }


        getStyleForComponent(component) {
            var componentType = componentHelper.getComponentType(component);

            var strokeColor,
                strokeDashArray,
                fillColor;

            switch (componentType) {
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
            }
        }


        handleWindowResize(event) {
            if (this.selectedComponent) {
                this.paintBorder(this.selectedComponent);
            }
        }

    }
}
