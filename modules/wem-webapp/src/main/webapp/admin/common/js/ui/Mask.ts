module api.ui {

    export class Mask extends api.dom.DivEl {

        private masked: api.dom.Element;

        constructor(itemToMask?: api.dom.Element) {
            super("mask");

            this.masked = itemToMask;
            if (this.masked) {
                this.masked.onHidden((event) => {
                    this.hide();
                });
                this.masked.onRemoved((event) => {
                    this.remove();
                });
                // Masked element might have been resized on window resize
                window.addEventListener("resize", () => {
                    this.positionOver(this.masked);
                });
            }
            api.dom.Body.get().appendChild(this);
        }

        show() {
            if (this.masked) {
                this.positionOver(this.masked);
            }
            super.show();
        }

        private positionOver(masked: api.dom.Element) {
            var maskedEl = masked.getEl();

            var maskedOffset = maskedEl.getOffset();
            var maskedWidth = maskedEl.getWidthWithBorder();
            var maskedHeight = maskedEl.getHeightWithBorder();

            this.getEl().setTop(maskedOffset.top + "px").setLeft(maskedOffset.left + "px").
                setWidth(maskedWidth + "px").setHeight(maskedHeight + "px");
        }

        getMasked(): api.dom.Element {
            return this.masked;
        }

    }

}