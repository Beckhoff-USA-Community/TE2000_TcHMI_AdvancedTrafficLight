/*
Zero-Clause BSD
Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
var TcHmi;
(function (TcHmi) {
    let Controls;
    (function (Controls) {
        let TrafficLight;
        (function (TrafficLight) {
            class TrafficLightControl extends TcHmi.Controls.System.TcHmiControl {
                /*
                Attribute philosophy
                --------------------
                - Local variables are not set while definition in class, so they have the value 'undefined'.
                - On compile the Framework sets the value from HTML or from theme (possibly 'null') via normal setters
                - The "changed detection" in the setter will result in psrocessing the value only once while compile
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
                    // Color vars and default values used for initial compiling
                    // If there is no user set value in the VS attribute field, and no value in the control "Description.json" file, these are used
                    // Below __redoncolor setRedOnColor with function is a full best practice example
                    // Other atribute setters may not have best practice logic purely for simplicity
                    this.__redoncolor = { color: 'Theme' };
                    this.__yellowoncolor = { color: 'Theme' };
                    this.__greenoncolor = { color: 'Theme' };
                    this.__redoffcolor = { color: 'Theme' };
                    this.__yellowoffcolor = { color: 'Theme' };
                    this.__greenoffcolor = { color: 'Theme' };
                    // Default value 
                    // Default fallback not stored in Description.json file since there is no public setter
                    // You could use a "Lights" interface and init vars here, or a class defined with constructor default values
                    this.__lightsDefault = new TrafficLight.Lights();
                    // Current lights value
                    this.__lights = new TrafficLight.Lights();
                    // Old lights value to compare against
                    this.__lightsOld = new TrafficLight.Lights();
                    // Touch vars for touch handling
                    this.__touchLock = false;
                    this.__onContextMenuHandler = this.__onContextMenu();
                    this.__onTouchStartHandler = this.__onTouchStart();
                    this.__onTouchEndOrCancelHandler = this.__onTouchEndLight();
                    this.__onClickHandler = this.__onClick();
                    this.__contextMenu = null;
                    this.mouseEvtOptions = {
                        passive: true,
                        capture: false // False, we handle the event first at the element directly triggered, not first through <html>, then <body>...
                    };
                    this.touchEvtOptions = {
                        passive: false,
                        capture: false
                    };
                }
                /**
                  * If raised, the control object exists in control cache and constructor of each inheritation level was called.
                  * Call attribute processor functions here to initialize default values!
                  */
                __previnit() {
                    // Fetch template root element
                    this.__elementTemplateRoot = this.__element.find('.TcHmi_Controls_TrafficLight_TrafficLightControl-Template');
                    if (this.__elementTemplateRoot.length === 0) {
                        throw new Error('Invalid Template.html');
                    }
                    ;
                    this.__elementErrorPopup = this.__elementTemplateRoot.find('.TcHmi_Controls_TrafficLight_TrafficLightControl-Template-errorOverlay');
                    if (this.__elementErrorPopup.length === 0) {
                        throw new Error('Invalid Template.html');
                    }
                    ;
                    // Error popup HTML is stored in template, but not needed at runtime until an error occurs
                    this.__elementErrorPopup.remove();
                    // Init the map
                    this.__localizedElements = new Map();
                    // Define the callback to run when the locale changes
                    // In this case, update all elements inner text with the defined key they were set with
                    this.__destroyLocalizationWatch = this.__localization.watch(data => {
                        if (data.error === TcHmi.Errors.NONE && data.reader) {
                            this.__localizationReader = data.reader;
                            for (const [element, info] of this.__localizedElements) {
                                let localizedText = data.reader.get(info.localeKey);
                                info.parameters && (localizedText = tchmi_format_string(localizedText, ...info.parameters)),
                                    element.text(tchmi_decode_control_characters(localizedText));
                            }
                        }
                    });
                    this.__elementTrafficLightSvg = this.__elementTemplateRoot.find('.traffic-light-svg');
                    this.__elementRedLight = this.__elementTrafficLightSvg.find('.traffic-light-red');
                    this.__elementYellowLight = this.__elementTrafficLightSvg.find('.traffic-light-yellow');
                    this.__elementGreenLight = this.__elementTrafficLightSvg.find('.traffic-light-green');
                    // Call __previnit of base class
                    super.__previnit();
                }
                /**
                 * @description Is called during control initialize phase after attribute setter have been called based on it's default or initial html dom values.
                 * @returns {void}
                 */
                __init() {
                    super.__init();
                    // Register listeners
                    // Context menu is a global event - we only attach it when the traffic light is attached
                    // HTML Native
                    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
                    // EventListener options, hands on
                    // https://javascript.info/bubbling-and-capturing
                    // List of Event Types like 'click'
                    // https://developer.mozilla.org/en-US/docs/Web/Events
                    this.__elementTrafficLightSvg[0].addEventListener("touchstart", this.__onTouchStartHandler, this.touchEvtOptions);
                    this.__elementTrafficLightSvg[0].addEventListener("touchend", this.__onTouchEndOrCancelHandler, this.touchEvtOptions);
                    this.__elementTrafficLightSvg[0].addEventListener("touchcancel", this.__onTouchEndOrCancelHandler, this.touchEvtOptions);
                    this.__elementTrafficLightSvg[0].addEventListener("click", this.__onClickHandler, this.mouseEvtOptions);
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
                    // Context menu is a global event, so we only need this when the traffic light is attached to the DOM
                    this.__elementTemplateRoot[0].addEventListener("contextmenu", this.__onContextMenuHandler, this.touchEvtOptions);
                    // If the default value of the traffic light class is a symbol, the valid symbol needs
                    // to 'watch' or subscribe to the server address
                    if (this.__lightsSymbol && !this.__destroyLightsSymbolWatch) {
                        this.__destroyLightsSymbolWatch = this.__lightsSymbol.watch(this.__onLightsSymbolWatch());
                    }
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
                    // Even if traffic light is preloaded, when not attached to the DOM the contextmenu listener is not needed
                    this.__elementTemplateRoot[0].removeEventListener("contextmenu", this.__onContextMenuHandler, this.touchEvtOptions);
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
                    this.__elementTrafficLightSvg[0].removeEventListener("touchstart", this.__onTouchStartHandler, this.touchEvtOptions);
                    this.__elementTrafficLightSvg[0].removeEventListener("touchend", this.__onTouchEndOrCancelHandler, this.touchEvtOptions);
                    this.__elementTrafficLightSvg[0].removeEventListener("touchcancel", this.__onTouchEndOrCancelHandler, this.touchEvtOptions);
                    this.__elementTrafficLightSvg[0].removeEventListener("click", this.__onClickHandler, this.mouseEvtOptions);
                    // Destroy the locale string handler when control is removed from memory
                    this.__destroyLocalizationWatch();
                    super.destroy();
                    /**
                    * Free resources like child controls etc.
                    */
                }
                /**
                * Returns the callback function to process lights whenever a new
                * value from the subscription is passed in
                *
                * @return {function(): void} -
                */
                __onLightsSymbolWatch() {
                    var _this = this;
                    /**
                    * Callback to be returned back into
                    * this.__lightsSymbol.watch()
                    *
                    * @param {void}
                    */
                    return function (data) {
                        _this.__processLights(data.value);
                    };
                }
                ;
                /**
               * Processes the Lights object value
               *
               * @param  {object} newValue - The canvas context
               * @return {void}
               */
                __processLights(newValue) {
                    devLog("Process Lights", newValue);
                    // If newValue is the same as the current value, return
                    if (tchmi_equal(newValue, this.__lights)) {
                        return;
                    }
                    ;
                    if (this.__lights == undefined) {
                        this.__lights = tchmi_clone_object(this.__lightsDefault);
                    }
                    this.__lightsOld = tchmi_clone_object(this.__lights);
                    this.__lights = newValue;
                    // If source is not the client, then its from the server
                    // Data is only needed to be read and processed, not written to server
                    if (this.__lights.RedLight !== this.__lightsOld.RedLight) {
                        this.__processRedColor();
                    }
                    ;
                    if (this.__lights.YellowLight !== this.__lightsOld.YellowLight) {
                        this.__processYellowColor();
                    }
                    if (this.__lights.GreenLight !== this.__lightsOld.GreenLight) {
                        this.__processGreenColor();
                    }
                    // process colors, each color state and color
                    TcHmi.EventProvider.raise(this.getId() + ".onLightsChanged", {
                        control: this,
                        lights: this.__lights,
                        lightdOld: this.__lightsOld
                    });
                }
                __removeErrorOverlay() {
                    this.__elementErrorPopup.attr("class", "TcHmi_Controls_TrafficLight_TrafficLightControl-Template-errorOverlay");
                    this.__elementErrorPopup.text("");
                    this.__elementErrorPopup.remove();
                    this.__localizedElements.delete(this.__elementErrorPopup);
                }
                __addErrorOverlay(errorClass, localeKey) {
                    this.__elementErrorPopup.addClass(errorClass);
                    this.__elementErrorPopup.text(this.__localizationReader.get(localeKey));
                    this.__elementTemplateRoot.append(this.__elementErrorPopup);
                    this.__localizedElements.set(this.__elementErrorPopup, { localeKey: localeKey });
                }
                ///// set lights Symbol
                setLightsSymbol(valueNew) {
                    devLog('Lights Symbols, setLightsSymbol:', valueNew);
                    if (this.__lightsSymbol !== valueNew) {
                        if (this.__destroyLightsSymbolWatch) {
                            this.__destroyLightsSymbolWatch();
                            this.__destroyLightsSymbolWatch = null;
                        }
                        if (valueNew instanceof TcHmi.Symbol) {
                            devLog('Lights Symbols, check schema:', valueNew);
                            // Helper code that could be used to check set symbol schema
                            // If it does match the required one - ST_TrafficLight, log error
                            valueNew.resolveSchema(data => {
                                if (data.error === TcHmi.Errors.NONE) {
                                    // Handle result value... 
                                    var schema = data.schema;
                                    // If the bound symbol schema id does not match the required input schema
                                    if ((schema === null || schema === void 0 ? void 0 : schema.id) !== "tchmi:server#/definitions/PLC1.ST_TrafficLight") {
                                        devLog('Lights Symbols, check schema id is not valid!');
                                        this.__removeErrorOverlay();
                                        this.__addErrorOverlay("opaque", "Schema_Mismatch");
                                    }
                                    // Else if it matches, remove the overlay
                                    else {
                                        this.__removeErrorOverlay();
                                        this.__lightsSymbol = valueNew;
                                        this.__redLightExp = '%s%' + this.__lightsSymbol.getExpression().getName() + '::RedLight%/s%';
                                        this.__yellowLightExp = '%s%' + this.__lightsSymbol.getExpression().getName() + '::YellowLight%/s%';
                                        this.__greenLightExp = '%s%' + this.__lightsSymbol.getExpression().getName() + '::GreenLight%/s%';
                                        this.__destroyLightsSymbolWatch = this.__lightsSymbol.watch(this.__onLightsSymbolWatch());
                                    }
                                }
                                else {
                                    // Handle error... failed to resolve schema
                                }
                            });
                        }
                        // if not a symbol input
                        else {
                            this.__lightsSymbol = null;
                            devLog('Lights Symbols, symbol value is null');
                            this.__addErrorOverlay("transparent", "Invalid_Light_Symbol");
                            this.__processLights(this.__lightsDefault);
                        }
                        TcHmi.EventProvider.raise(this.__id + ".onFunctionResultChanged", ["getLightsSymbol"]);
                    }
                }
                ;
                getLightsSymbol() {
                    return this.__lightsSymbol;
                }
                ;
                getLights() {
                    return this.__lights;
                }
                ;
                __onTouchStart() {
                    var _this = this;
                    return function (event) {
                        if (_this.getIsEnabled() && TcHmi.Access.checkAccess(_this, "operate")) {
                            _this.__lightsSymbol && event.preventDefault();
                            var t = Array.prototype.slice.apply(event.changedTouches).filter(function (t) {
                                return t.target === event.target;
                            });
                            if (0 !== t.length) {
                                _this.__touches = _this.__touches.concat(t);
                            }
                            devLog('Touch Start:', _this.__touches);
                        }
                    };
                }
                ;
                __onTouchEndLight() {
                    var _this = this;
                    return function (event) {
                        if (_this.getIsEnabled() && TcHmi.Access.checkAccess(_this, "operate")) {
                            // If a write has already occured within the last 300ms, return out of function
                            // Prevents mis touches after releasing
                            // Prevents too many writes at once
                            if (_this.__touchLock) {
                                console.warn('Another touchend write within 300ms was prevented');
                                return;
                            }
                            ;
                            var touchIndex = Array.prototype.slice.apply(event.changedTouches).map(function (t) {
                                return t.identifier;
                            });
                            _this.__touches = _this.__touches.filter(function (t) {
                                return -1 === touchIndex.indexOf(t.identifier);
                            });
                            devLog('Current touches: ', _this.__touches);
                            // If this isn't the first touch index in the touches list of the browser
                            // Return - prevent multiple writes from multiple continuous touches
                            if (touchIndex[0] != 0) {
                                return;
                            }
                            ;
                            if (event.srcElement !== document.elementFromPoint(event.changedTouches[0].pageX, event.changedTouches[0].pageY)) {
                                if (event.cancelable) {
                                    event.preventDefault();
                                }
                                return;
                            }
                            ;
                            if (event.cancelable) {
                                event.preventDefault();
                            }
                            ;
                            if (event.type === 'touchcancel') {
                                return;
                            }
                            ;
                            switch (event.srcElement) {
                                case _this.__elementRedLight[0]:
                                    TcHmi.Symbol.writeEx(_this.__redLightExp, !_this.__lights.RedLight, function (data) {
                                        if (data.error) {
                                            TcHmi.Log.error(TcHmi.Log.buildMessage(data.details));
                                        }
                                    });
                                    break;
                                case _this.__elementYellowLight[0]:
                                    TcHmi.Symbol.writeEx(_this.__yellowLightExp, !_this.__lights.YellowLight, function (data) {
                                        if (data.error) {
                                            TcHmi.Log.error(TcHmi.Log.buildMessage(data.details));
                                        }
                                    });
                                    break;
                                case _this.__elementGreenLight[0]:
                                    TcHmi.Symbol.writeEx(_this.__greenLightExp, !_this.__lights.GreenLight, function (data) {
                                        if (data.error) {
                                            TcHmi.Log.error(TcHmi.Log.buildMessage(data.details));
                                        }
                                    });
                                    break;
                                default:
                                    ;
                            }
                        }
                        ;
                        // Sets the touch lock and timeout to release the lock
                        // The same concept can be used elsewhere
                        _this.__touchLock = true;
                        var __this = _this;
                        setTimeout(function () {
                            __this.__touchLock = false;
                        }, 300);
                    };
                }
                ;
                __onClick() {
                    var _this = this;
                    return function (event) {
                        switch (event.target) {
                            case _this.__elementRedLight[0]:
                                if (!_this.__redLightExp) {
                                    TcHmi.Log.error;
                                }
                                TcHmi.Symbol.writeEx(_this.__redLightExp, !_this.__lights.RedLight, function (data) {
                                    if (data.error) {
                                        TcHmi.Log.error(TcHmi.Log.buildMessage(data.details));
                                    }
                                });
                                break;
                            case _this.__elementYellowLight[0]:
                                TcHmi.Symbol.writeEx(_this.__yellowLightExp, !_this.__lights.YellowLight, function (data) {
                                    if (data.error) {
                                        TcHmi.Log.error(TcHmi.Log.buildMessage(data.details));
                                    }
                                });
                                break;
                            case _this.__elementGreenLight[0]:
                                TcHmi.Symbol.writeEx(_this.__greenLightExp, !_this.__lights.GreenLight, function (data) {
                                    if (data.error) {
                                        TcHmi.Log.error(TcHmi.Log.buildMessage(data.details));
                                    }
                                });
                                break;
                            default:
                            // If no lights were clicked, default handling
                        }
                    };
                }
                ;
                __onContextMenu() {
                    var _this = this;
                    return function (event) {
                        devLog('Context menu event: ', event);
                        event.preventDefault();
                        console.log('create context menu');
                        // Handles if ContextMenu is already destroyed
                        if (_this.__contextMenu && !_this.__contextMenu.getIsDestroyed()) {
                            console.log('create context menu');
                            _this.__contextMenu.destroy();
                            _this.__contextMenu = null;
                        }
                        _this.__contextMenu = TcHmi.ControlFactory.createEx('TcHmi.Controls.ContextMenu.ContextMenuControl', _this.getId() + '_ContextMenu', {
                            'data-tchmi-top': _this.getTop(),
                            'data-tchmi-left': _this.getLeft() + _this.getWidth(),
                            'data-tchmi-width': 200,
                            'data-tchmi-height': 200,
                            'data-tchmi-background-color': {
                                'color': 'rgba(55, 55, 55, 1)'
                            }
                        });
                        var desktop = TcHmi.Controls.get('Desktop');
                        if (desktop && _this.__contextMenu) {
                            desktop.addChild(_this.__contextMenu);
                        }
                        if (!_this.__lightsSymbol === null) {
                            _this.__lightsSymbol.resolveSchema(function (data) {
                                if (data.error === TcHmi.Errors.NONE) {
                                    // Handle result value... 
                                    var schema = data.schema;
                                }
                                else {
                                    // Handle error... 
                                }
                            });
                        }
                        ;
                        // Parses out the internal cached symbol of all ADS symbols of ST_TrafficLight type
                        let __AdsList_trafficLightTypes = TcHmi.Symbol.readEx('%i%AdsList_TrafficLightTypes%/i%');
                        let lightsSymbolName;
                        // If the TL control is bound already, retrieve the symbol name
                        if (_this.__lightsSymbol) {
                            lightsSymbolName = _this.__lightsSymbol.getExpression().getName();
                        }
                        else {
                            lightsSymbolName = '';
                        }
                        console.log("List of traffic light type symbols: ", __AdsList_trafficLightTypes);
                        if (__AdsList_trafficLightTypes.length == 0) {
                            _this.__contextMenu.__elementList.append(`<li class="context-menu__item">
                                <a href="#" style = "font-weight:bold;" class="context-menu__link" data-action="error" data-caller=${_this.getId()}>Error: No traffic light types detected.</a>
                            </li>`);
                        }
                        ;
                        __AdsList_trafficLightTypes.forEach(function (element, index, array) {
                            console.log(element);
                            if (element == lightsSymbolName) {
                                _this.__contextMenu.__elementList.append(`<li class="context-menu__item">
                                <a href="#" style = "font-weight:bold;" class="context-menu__link" data-action="binding" data-caller=${_this.getId()}>${element}</a>
                            </li>`);
                            }
                            else {
                                _this.__contextMenu.__elementList.append(`<li class="context-menu__item">
                                <a href="#" class="context-menu__link" data-action="binding" data-caller=${_this.getId()}>${element}</a>
                            </li>`);
                            }
                        });
                    };
                }
                contextMenuOption(optionSelected) {
                    let _this = this;
                    devLog('Option from context menu selected: ', optionSelected);
                    var _symExp = optionSelected.text;
                    // Switch for context menu options
                    // Context menu control could have other options like
                    // Style, other bindable attributes, destroy, etc. 
                    // In this sample code, the context menu options are only bindings
                    switch (optionSelected.action) {
                        case 'binding':
                            _this.__setSymbol(_symExp);
                            break;
                        default:
                            ;
                    }
                }
                ;
                __setSymbol(symbolPath) {
                    var _this = this;
                    TcHmi.Symbol.exists('%s%' + symbolPath + '%/s%', function (data) {
                        if (data.error === TcHmi.Errors.NONE) {
                            // Handle result value... 
                            var symExists = data.result;
                            devLog('Symbol exists: ', symExists);
                            if (symExists) {
                                _this.setLightsSymbol(new TcHmi.Symbol('%s%' + symbolPath + '%/s%'));
                            }
                            else {
                                devLog('Symbol does not exist, attempting to map: ' + symExists);
                                TcHmi.Server.requestEx({
                                    requestType: 'ReadWrite',
                                    commands: [{
                                            symbol: 'AddSymbol',
                                            commandOptions: ['SendErrorMessage'],
                                            writeValue: {
                                                NAME: symbolPath,
                                                MAPPING: symbolPath.split(".").join("::"),
                                                ACCESS: 3,
                                                DOMAIN: 'ADS',
                                                AUTOMAP: true,
                                                USEMAPPING: true
                                            }
                                        }]
                                }, { timeout: 5000 }, function (data) {
                                    _this.setLightsSymbol(new TcHmi.Symbol('%s%' + symbolPath + '%/s%'));
                                });
                            }
                        }
                        else {
                            devLog('Error in requesting mapping status');
                        }
                    });
                }
                /**                 RED LIGHT                     */
                getRedStatus() {
                    return this.__lights.RedLight;
                }
                ;
                //setRedOnColor with many techniques for validations
                // It is up to you to decide how much validation is needed, and to test how much validation adds to performance reduction
                setRedOnColor(newColor) {
                    devLog(`Setting ${this.getId()} red on color to: `, newColor);
                    // convert input to Object
                    let convertedColor = TcHmi.ValueConverter.toObject(newColor);
                    // Null checker and type checker
                    // If null or not a SolidColor type, then set to default system color
                    if (convertedColor === null || !TcHmi.isSolidColor(convertedColor)) {
                        // the name is set under the attribute declaration in the control Description.json
                        // In this case "propertyName": "RedOnColor"
                        convertedColor = this.getAttributeDefaultValueInternal('RedOnColor');
                    }
                    // If the setters runs the same value already present, skipp processing
                    if (tchmi_equal(convertedColor, this.__redoncolor)) {
                        return;
                    }
                    this.__redoncolor = convertedColor;
                    // All subscriptions to Control::RedOnColor will be updated when this is raised
                    // This is how green control symbols are updated
                    TcHmi.EventProvider.raise(this.getId() + '.onPropertyChanged', { propertyName: 'RedOnColor' });
                    this.__processRedColor();
                }
                ;
                setRedOffColor(newColor) {
                    let convertedColor = TcHmi.ValueConverter.toObject(newColor);
                    if (convertedColor === null || !TcHmi.isSolidColor(convertedColor)) {
                        convertedColor = this.getAttributeDefaultValueInternal('RedOffColor');
                    }
                    ;
                    if (tchmi_equal(convertedColor, this.__redoffcolor)) {
                        return;
                    }
                    ;
                    this.__redoffcolor = convertedColor;
                    this.__processRedColor();
                }
                ;
                getRedOnColor() {
                    return this.__redoncolor;
                }
                ;
                getRedOffColor() {
                    return this.__redoffcolor;
                }
                ;
                __processRedColor() {
                    if (this.__lights.RedLight) {
                        TcHmi.StyleProvider.processFillColor(this.__elementRedLight, this.__redoncolor);
                    }
                    else {
                        TcHmi.StyleProvider.processFillColor(this.__elementRedLight, this.__redoffcolor);
                    }
                }
                ;
                /**                 YELLOW LIGHT                     */
                getYellowStatus() {
                    return this.__lights.YellowLight;
                }
                ;
                setYellowOnColor(newColor) {
                    let convertedColor = TcHmi.ValueConverter.toObject(newColor);
                    this.__yellowoncolor = convertedColor;
                    this.__processYellowColor();
                }
                ;
                setYellowOffColor(newColor) {
                    let convertedColor = TcHmi.ValueConverter.toObject(newColor);
                    this.__yellowoffcolor = convertedColor;
                    this.__processYellowColor();
                }
                ;
                getYellowOnColor() {
                    return this.__yellowoncolor;
                }
                ;
                getYellowOffColor() {
                    return this.__yellowoffcolor;
                }
                ;
                __processYellowColor() {
                    if (this.__lights.YellowLight) {
                        TcHmi.StyleProvider.processFillColor(this.__elementYellowLight, this.__yellowoncolor);
                    }
                    else {
                        TcHmi.StyleProvider.processFillColor(this.__elementYellowLight, this.__yellowoffcolor);
                    }
                }
                ;
                /**                 GREEN LIGHT                     */
                getGreenStatus() {
                    return this.__lights.GreenLight;
                }
                ;
                setGreenOnColor(newColor) {
                    let convertedColor = TcHmi.ValueConverter.toObject(newColor);
                    this.__greenoncolor = convertedColor;
                    this.__processGreenColor();
                }
                ;
                setGreenOffColor(newColor) {
                    let convertedColor = TcHmi.ValueConverter.toObject(newColor);
                    this.__greenoffcolor = convertedColor;
                    this.__processGreenColor();
                }
                ;
                getGreenOnColor() {
                    return this.__greenoncolor;
                }
                ;
                getGreenOffColor() {
                    return this.__greenoffcolor;
                }
                ;
                __processGreenColor() {
                    if (this.__lights.GreenLight) {
                        TcHmi.StyleProvider.processFillColor(this.__elementGreenLight, this.__greenoncolor);
                    }
                    else {
                        TcHmi.StyleProvider.processFillColor(this.__elementGreenLight, this.__greenoffcolor);
                    }
                }
                ;
            }
            TrafficLight.TrafficLightControl = TrafficLightControl;
        })(TrafficLight = Controls.TrafficLight || (Controls.TrafficLight = {}));
        Controls.registerEx('TrafficLightControl', 'TcHmi.Controls.TrafficLight', TrafficLight.TrafficLightControl);
    })(Controls = TcHmi.Controls || (TcHmi.Controls = {}));
})(TcHmi || (TcHmi = {}));
// Set to false to turn off logging for this project
var _debugLog = true;
function devLog(...value) {
    if (_debugLog) {
        console.log(...value);
    }
}
;
// Styles the Console .Log, triggered by %c in the below log
var styles = [
    'background: url(' + window.location.origin + '/Images/logo.gif)',
    'border: 1px solid #3E0E02',
    'color: white',
    'line-height: 55px',
    'width : 100px'
].join(';');
console.log('%c                                   ', styles);
console.log('Go here to learn more about the Console API\nhttps://developer.mozilla.org/en-US/docs/Web/API/console');
//# sourceMappingURL=TrafficLightControl.js.map