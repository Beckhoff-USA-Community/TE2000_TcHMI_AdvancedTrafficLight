declare module TcHmi {
    module Controls {
        module ContextMenu {
            class ContextMenuControl extends TcHmi.Controls.System.TcHmiControl {
                /**
                 * @description Constructor of the control
                 * @param {JQuery} element Element from HTML (internal, do not use)
                 * @param {JQuery} pcElement precompiled Element (internal, do not use)
                 * @param {TcHmi.Controls.ControlAttributeList} attrs Attributes defined in HTML in a special format (internal, do not use)
                 * @returns {void}
                 */
                constructor(element: JQuery, pcElement: JQuery, attrs: TcHmi.Controls.ControlAttributeList);
                protected __elementTemplateRoot: JQuery;
                protected __elementNav: JQuery;
                __elementList: JQuery;
                protected __documentClickHandler: (event: any) => void;
                protected __optionSelect: (event: any) => void;
                /**
                  * If raised, the control object exists in control cache and constructor of each inheritation level was called.
                  * Call attribute processor functions here to initialize default values!
                  */
                __previnit(): void;
                /**
                 * @description Is called during control initialize phase after attribute setter have been called based on it's default or initial html dom values.
                 * @returns {void}
                 */
                __init(): void;
                /**
                * @description Is called by tachcontrol() after the control instance gets part of the current DOM.
                * Is only allowed to be called from the framework itself!
                */
                __attach(): void;
                /**
                * @description Is called by tachcontrol() after the control instance is no longer part of the current DOM.
                * Is only allowed to be called from the framework itself!
                */
                __detach(): void;
                /**
                * @description Destroy the current control instance.
                * Will be called automatically if system destroys control!
                */
                destroy(): void;
                __onClick(): (event: any) => void;
                __optionSelectHandler(): (event: any) => void;
            }
        }
        namespace ContextMenu {
            interface Option {
                action: string;
                text: string;
            }
        }
    }
}
