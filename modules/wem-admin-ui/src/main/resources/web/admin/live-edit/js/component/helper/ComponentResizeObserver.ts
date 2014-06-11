module LiveEdit.component.helper {

    import PageComponentDeselectEvent = api.liveedit.PageComponentDeselectEvent;
    import PageComponentSelectComponentEvent = api.liveedit.ItemViewSelectedEvent;
    import ItemView = api.liveedit.ItemView;

    export class ComponentResizeObserver {

        private component: ItemView;

        constructor() {
            this.registerGlobalListeners();
        }

        private observe(component: ItemView): void {

            this.disconnect();

            if (component.isEmpty()) {
                return;
            }

            this.component = component;
            this.component.getElement().on('resize', (event) => {
                if (this.component.isSelected()) {
                    // TODO: This bugged out jQuery, not sure what it was used for.
                    //wemjq(window).on('selectComponent.liveEdit', [component])
                }
            });

        }

        private disconnect(): void {
            if (this.component != null) {
                this.component.getElement().off('resize');
            }
            this.component = null;

        }

        private registerGlobalListeners(): void {
            PageComponentSelectComponentEvent.on((event: PageComponentSelectComponentEvent) => this.observe(event.getItemView()));
            PageComponentDeselectEvent.on(() => this.disconnect());
            wemjq(window).on('editTextComponent.liveEdit', (event: JQueryEventObject, component?: ItemView) => {
                this.observe(component);
            });
        }

    }
}
