// Keep these lines for a best effort IntelliSense of Visual Studio 2017.
/// <reference path="./../Packages/Beckhoff.TwinCAT.HMI.Framework.12.750.1/runtimes/native1.12-tchmi/TcHmi.d.ts" />
var TcHmi;
(function (TcHmi) {
    let Controls;
    (function (Controls) {
        let TrafficLight;
        (function (TrafficLight) {
            // Local class for defaulting "Lights" type of values
            // No properties will be symbols themselves
            // for best practice on handling properties that are symbols themselves:
            // https://infosys.beckhoff.com/english.php?content=../content/1033/te2000_tc3_hmi_engineering/8973393163.html
            class Lights {
                constructor() {
                    this.RedLight = false;
                    this.YellowLight = false;
                    this.GreenLight = false;
                }
                ;
            }
            TrafficLight.Lights = Lights;
            class Framework {
                constructor() { }
                ;
            }
            TrafficLight.Framework = Framework;
            // Function that searches for and returns an array of matches property values 
            var getListOfDatatypeMatches = function (object, value) {
                return Object.keys(object).filter(function (key, index, array) {
                    let item = object[key];
                    // Basic symbols that only have dut
                    if (item.$ref === value) {
                        return true;
                    }
                    ;
                    // Advanced symbols with addtional ADS info like pragmas
                    // Function must parse all properties to see if ST_TrafficLight is one of them
                    if (item.allOf) {
                        return item.allOf.some(item => item.$ref === value);
                    }
                    return false;
                });
            };
            var AdsSymbolCache = new TcHmi.Symbol('%i%AdsSymbolCache%/i%');
            var destroyOnInitialized = TcHmi.EventProvider.register('onInitialized', function (e, data) {
                // This event will be raised only once, so we can free resources. 
                // It's best practice to use destroy function of the event object within the callback function to avoid conflicts.
                e.destroy();
                // Register callback to parse the symbols list for any Traffic Light types under the PLC1.MAIN namespace
                // PLC1 comes from the TcHmi name for the target runtime under the ADS Server Extension
                AdsSymbolCache.watch(data => {
                    if (data.value && data.value["PLC1.MAIN"]) {
                        let PlcMainVars = data.value["PLC1.MAIN"].properties;
                        console.log("All MAIN vars and their schemas:", PlcMainVars);
                        // Run filter to only return string array of ST_TrafficLight symbol names
                        let results = getListOfDatatypeMatches(PlcMainVars, "#/definitions/PLC1.ST_TrafficLight");
                        console.log(results);
                        // Returned 'results' only have var name, not namespace - we add that back in
                        let qualifiedNames = results.map(element => "PLC1.MAIN." + element);
                        // Internal symbol that lists all ADS Symbols of datatype ST_TrafficLight
                        TcHmi.Symbol.writeEx('%i%AdsList_TrafficLightTypes%/i%', qualifiedNames);
                    }
                });
            });
        })(TrafficLight = Controls.TrafficLight || (Controls.TrafficLight = {}));
    })(Controls = TcHmi.Controls || (TcHmi.Controls = {}));
})(TcHmi || (TcHmi = {}));
//# sourceMappingURL=TrafficLightGlobals.js.map