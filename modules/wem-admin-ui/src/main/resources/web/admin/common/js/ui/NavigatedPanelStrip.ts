module api.ui {

    export class NavigatedPanelStrip extends PanelStrip {

        private navigator: Navigator;
        private scrollIndex: number = -1;
        private focusIndex: number = -1;
        private focusVisible: boolean = false;

        constructor(navigator: Navigator, className?: string) {
            super(className);
            this.navigator = navigator;
            var listenToScroll = true;

            navigator.onNavigationItemSelected((event: NavigatorEvent) => {
                listenToScroll = false;
                this.showPanelByIndex(event.getItem().getIndex());
            });

            this.onPanelShown((event: PanelShownEvent) => {
                listenToScroll = true;
            });

            jQuery(this.getHTMLElement()).scroll((event: JQueryEventObject) => {
                if (listenToScroll) {
                    this.updateScrolledNavigationItem();
                }
            });
        }

        private updateScrolledNavigationItem() {
            var scrollTop = this.getHTMLElement().scrollTop;

            var focusVisible = this.isFocusedPanelVisible(scrollTop);
            var scrollIndex = this.getScrolledPanelIndex(scrollTop);

            if (this.scrollIndex != scrollIndex || this.focusVisible != focusVisible) {
                if (focusVisible) {
                    this.navigator.selectNavigationItem(this.focusIndex, true);
                } else {
                    this.navigator.selectNavigationItem(scrollIndex, true);
                }
                this.focusVisible = focusVisible;
                this.scrollIndex = scrollIndex;
            }
        }

        private isFocusedPanelVisible(scrollTop: number): boolean {
            if (this.focusIndex < 0) {
                return false;
            }
            var totalHeight = this.getEl().getHeight(),
                panelEl = this.getPanel(this.focusIndex).getEl(),
                panelTop = panelEl.getOffsetToParent().top,
                panelBottom = panelTop + panelEl.getHeight();

            return (panelTop <= 0 && panelBottom > 0) ||
                   (panelTop <= totalHeight && panelBottom > totalHeight);
        }

        private getScrolledPanelIndex(scrollTop: number): number {
            var panelEl, panelTop, panelBottom;
            if (scrollTop == 0) {
                // select first element if we are in the beginning
                return 0;
            }
            /* else if (scrollTop + this.getEl().getHeight() == this.getHTMLElement().scrollHeight) {
             // select last element if we are in the very end
             return this.getSize() - 1;
             }*/
            for (var i = 0; i < this.getSize(); i++) {
                panelEl = this.getPanel(i).getEl();
                panelTop = scrollTop + panelEl.getOffsetToParent().top;
                panelBottom = panelTop + panelEl.getHeight();

                if (scrollTop >= panelTop && scrollTop < panelBottom) {
                    return i;
                }
            }
            return -1;
        }

        getSelectedNavigationItem(): NavigationItem {
            return this.navigator.getSelectedNavigationItem();
        }

        addNavigablePanel(item: NavigationItem, panel: Panel, select?: boolean): number {
            this.navigator.addNavigationItem(item);
            var index = super.addPanel(panel);
            // select corresponding step on focus
            panel.onFocus((event: FocusEvent) => {
                this.navigator.selectNavigationItem(item.getIndex(), true);
                this.focusIndex = item.getIndex();
            });
            panel.onBlur((event: FocusEvent) => {
                this.focusIndex = -1;
                // Update navigation item according to scroll position
                this.updateScrolledNavigationItem();
            });
            if (select) {
                this.selectPanel(item);
            }
            return index;
        }

        selectPanel(item: NavigationItem) {
            this.selectPanelByIndex(item.getIndex());
        }

        selectPanelByIndex(index: number) {
            this.navigator.selectNavigationItem(index);
            // panel will be shown because of the selected navigator listener in constructor
        }

        removeNavigablePanel(panel: Panel, checkCanRemovePanel: boolean = true): number {
            var removedPanelIndex = super.removePanel(panel, checkCanRemovePanel);
            if (removedPanelIndex > -1) {
                var navigationItem: api.ui.NavigationItem = this.navigator.getNavigationItem(removedPanelIndex);
                this.navigator.removeNavigationItem(navigationItem);
            }
            return removedPanelIndex;
        }
    }

}