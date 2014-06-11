module LiveEdit.ui {

    import ItemView = api.liveedit.ItemView;
    import SortableStartEvent = api.liveedit.SortableStartEvent;
    import SortableStopEvent = api.liveedit.SortableStopEvent;
    import ItemViewSelectedEvent = api.liveedit.ItemViewSelectedEvent;

    export class Cursor extends LiveEdit.ui.Base {

        bodyElement: JQuery;

        defaultBodyCursor: string;

        constructor() {
            super();

            this.bodyElement = wemjq('body');

            // Cache any user set body@style cursor in order to restore it later.
            // Not 100% as the cursor can change any time during the page's life cycle.
            // wemjq.css('cursor') should be avoided here used as it uses window.getComputedStyle()
            this.defaultBodyCursor = this.bodyElement[0].style.cursor;

            this.registerGlobalListeners();
        }

        private registerGlobalListeners(): void {
            wemjq(window).on('mouseOverComponent.liveEdit', (event: JQueryEventObject, component?: ItemView) => this.update(component));
            ItemViewSelectedEvent.on((event: ItemViewSelectedEvent) => this.update(event.getItemView()));
            wemjq(window).on('mouseOutComponent.liveEdit', () => this.reset());
            SortableStartEvent.on(() => this.hide());
            SortableStopEvent.on(() => this.reset());
        }

        private update(component: ItemView): void {
            this.bodyElement.css('cursor', component.getType().getConfig().getCursor());
        }

        private hide(): void {
            this.bodyElement.css('cursor', 'none');
        }

        private reset(): void {
            if (LiveEdit.component.dragdropsort.DragDropSort.isDragging()) {
                return;
            }
            this.bodyElement.css('cursor', this.defaultBodyCursor || '');
        }

    }
}