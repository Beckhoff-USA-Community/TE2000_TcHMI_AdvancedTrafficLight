/*
Zero-Clause BSD
Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
var TcHmi;
(function (TcHmi) {
    let Controls;
    (function (Controls) {
        let ContextMenu;
        (function (ContextMenu) {
            class ContextMenuControl extends TcHmi.Controls.System.TcHmiControl {
                /*
                Attribute philosophy
                --------------------
                - Local variables are not set while definition in class, so they have the value 'undefined'.
                - On compile the Framework sets the value from HTML or from theme (possibly 'null') via normal setters
                - The "changed detection" in the setter will result in processing the value only once while compile
                - Attention: If we have a Server Binding on an Attribute the setter can be very late or never (leaving the value = undefined).
                */
                /**
                 * @description Constructor of the control
                 * @param {JQuery} element Element from HTML (internal, do not use)
                 * @param {JQuery} pcElement precompiled Element (internal, do not use)
                 * @param {TcHmi.Controls.ControlAttributeList} attrs Attributes defined in HTML in a special format (internal, do not use)
                 * @returns {void}
                 */
                constructor(element, pcElement, attrs) {
                    /** Call base class constructor */
                    super(element, pcElement, attrs);
                    this.__documentClickHandler = this.__onClick();
                    this.__optionSelect = this.__optionSelectHandler();
                }
                /**
                  * If raised, the control object exists in control cache and constructor of each inheritation level was called.
                  * Call attribute processor functions here to initialize default values!
                  */
                __previnit() {
                    // Fetch template root element
                    this.__elementTemplateRoot = this.__element.find('.TcHmi_Controls_ContextMenu_ContextMenuControl-Template');
                    if (this.__elementTemplateRoot.length === 0) {
                        throw new Error('Invalid Template.html');
                    }
                    this.__elementNav = this.__elementTemplateRoot.find('.context-menu-nav');
                    this.__elementList = this.__elementNav.find('.context-menu__items');
                    // Call __previnit of base class
                    super.__previnit();
                }
                /**
                 * @description Is called during control initialize phase after attribute setter have been called based on it's default or initial html dom values.
                 * @returns {void}
                 */
                __init() {
                    super.__init();
                }
                /**
                * @description Is called by tachcontrol() after the control instance gets part of the current DOM.
                * Is only allowed to be called from the framework itself!
                */
                __attach() {
                    super.__attach();
                    /**
                     * Initialize everything which is only available while the control is part of the active dom.
                     */
                    // Handles clicking outside of the context menu - any click not on the contextmenu itself 
                    // Aux click is any click
                    document.addEventListener("auxclick", this.__documentClickHandler);
                    document.addEventListener("click", this.__documentClickHandler);
                    // If this control is clicked, run the passed in function
                    this.__elementList[0].addEventListener("click", this.__optionSelect, false);
                }
                /**
                * @description Is called by tachcontrol() after the control instance is no longer part of the current DOM.
                * Is only allowed to be called from the framework itself!
                */
                __detach() {
                    super.__detach();
                    /**
                     * Disable everything which is not needed while the control is not part of the active dom.
                     * No need to listen to events for example!
                     */
                    document.removeEventListener("click", this.__documentClickHandler);
                    document.removeEventListener("auxclick", this.__documentClickHandler);
                    this.__elementList[0].removeEventListener("click", this.__optionSelect, false);
                }
                /**
                * @description Destroy the current control instance.
                * Will be called automatically if system destroys control!
                */
                destroy() {
                    /**
                    * While __keepAlive is set to true control must not be destroyed.
                    */
                    if (this.__keepAlive) {
                        return;
                    }
                    super.destroy();
                    /**
                    * Free resources like child controls etc.
                    */
                }
                __onClick() {
                    var _this = this;
                    return function (event) {
                        var element = event.srcElement || event.target;
                        TcHmi.Log.infoEx("Clicked element's class list: ", element.classList);
                        // If clicking anywhere in the browser that is not on the context menu, close it (destroy)
                        if (!element.classList.contains('context-menu')) {
                            if (!element.classList.contains('context-menu-nav')) {
                                TcHmi.Log.infoEx('Deleting...', element);
                                _this.destroy();
                            }
                        }
                    };
                }
                __optionSelectHandler() {
                    var _this = this;
                    return function (event) {
                        if (event.srcElement.tagName === "A") {
                            let _action = event.srcElement.getAttribute("data-action");
                            let _caller = event.srcElement.getAttribute("data-caller");
                            let option = { action: _action, text: event.srcElement.text };
                            let _callerRef = TcHmi.Controls.get(_caller);
                            // Run the caller control's context menu code
                            // In this sample code, the Traffic Light has a contentMenuOption function which runs based on the passed in option
                            _callerRef.contextMenuOption(option);
                            // Remove the context menu reference
                            _callerRef.__contextMenuControl = null;
                            // Destroy the context menu (close popup)
                            _this.destroy();
                        }
                    };
                }
            }
            ContextMenu.ContextMenuControl = ContextMenuControl;
        })(ContextMenu = Controls.ContextMenu || (Controls.ContextMenu = {}));
        Controls.registerEx('ContextMenuControl', 'TcHmi.Controls.ContextMenu', ContextMenu.ContextMenuControl);
    })(Controls = TcHmi.Controls || (TcHmi.Controls = {}));
})(TcHmi || (TcHmi = {}));
//# sourceMappingURL=ContextMenuControl.js.map