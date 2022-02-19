declare module TcHmi {
    module Controls {
        module TrafficLight {
            class TrafficLightControl extends TcHmi.Controls.System.TcHmiControl {
                /**
                 * @description Constructor of the control
                 * @param {JQuery} element Element from HTML (internal, do not use)
                 * @param {JQuery} pcElement precompiled Element (internal, do not use)
                 * @param {TcHmi.Controls.ControlAttributeList} attrs Attributes defined in HTML in a special format (internal, do not use)
                 * @returns {void}
                 */
                constructor(element: JQuery, pcElement: JQuery, attrs: TcHmi.Controls.ControlAttributeList);
                protected __elementTemplateRoot: JQuery;
                protected __elementErrorPopup: JQuery;
                protected __elementTrafficLightSvg: JQuery;
                protected __elementRedLight: JQuery;
                protected __elementYellowLight: JQuery;
                protected __elementGreenLight: JQuery;
                protected __destroyLocalizationWatch: DestroyFunction;
                protected __localizationReader: Locale.LocalizationReader;
                protected __localizedElements: Map<JQuery, {
                    localeKey: string;
                    parameters?: any[] | undefined;
                }>;
                private __redoncolor;
                private __yellowoncolor;
                private __greenoncolor;
                private __redoffcolor;
                private __yellowoffcolor;
                private __greenoffcolor;
                private __lightsDefault;
                private __lights;
                private __lightsOld;
                private __touchLock;
                private __touches;
                private __lightsSymbol;
                private __destroyLightsSymbolWatch;
                private __redLightExp;
                private __yellowLightExp;
                private __greenLightExp;
                private __onContextMenuHandler;
                private __onTouchStartHandler;
                private __onTouchEndOrCancelHandler;
                private __onClickHandler;
                private __contextMenu;
                private mouseEvtOptions;
                private touchEvtOptions;
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
                /**
                * Returns the callback function to process lights whenever a new
                * value from the subscription is passed in
                *
                * @return {function(): void} -
                */
                __onLightsSymbolWatch(): (data: any) => void;
                /**
               * Processes the Lights object value
               *
               * @param  {object} newValue - The canvas context
               * @return {void}
               */
                __processLights(newValue: TcHmi.Controls.TrafficLight.Lights): void;
                private __removeErrorOverlay;
                private __addErrorOverlay;
                setLightsSymbol(valueNew: TcHmi.Symbol): void;
                getLightsSymbol(): Symbol<any> | null;
                getLights(): Lights;
                __onTouchStart(): (event: any) => void;
                __onTouchEndLight(): (event: TouchEvent) => void;
                __onClick(): (event: MouseEvent) => void;
                __onContextMenu(): (event: MouseEvent) => void;
                contextMenuOption(optionSelected: TcHmi.Controls.ContextMenu.Option): void;
                __setSymbol(symbolPath: string): void;
                /**                 RED LIGHT                     */
                getRedStatus(): boolean;
                setRedOnColor(newColor: TcHmi.SolidColor): void;
                setRedOffColor(newColor: TcHmi.SolidColor): void;
                getRedOnColor(): SolidColor | null;
                getRedOffColor(): SolidColor | null;
                __processRedColor(): void;
                /**                 YELLOW LIGHT                     */
                getYellowStatus(): boolean;
                setYellowOnColor(newColor: TcHmi.SolidColor): void;
                setYellowOffColor(newColor: TcHmi.SolidColor): void;
                getYellowOnColor(): SolidColor | null;
                getYellowOffColor(): SolidColor | null;
                __processYellowColor(): void;
                /**                 GREEN LIGHT                     */
                getGreenStatus(): boolean;
                setGreenOnColor(newColor: TcHmi.SolidColor): void;
                setGreenOffColor(newColor: TcHmi.SolidColor): void;
                getGreenOnColor(): SolidColor | null;
                getGreenOffColor(): SolidColor | null;
                __processGreenColor(): void;
            }
        }
    }
}
declare var _debugLog: boolean;
declare function devLog(...value: any): void;
declare var styles: string;
