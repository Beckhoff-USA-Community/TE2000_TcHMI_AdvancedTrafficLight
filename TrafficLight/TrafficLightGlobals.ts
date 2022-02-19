module TcHmi {
    export module Controls {
        export module TrafficLight {

            // Local class for defaulting "Lights" type of values
            // No properties will be symbols themselves
            // for best practice on handling properties that are symbols themselves:
            // https://infosys.beckhoff.com/english.php?content=../content/1033/te2000_tc3_hmi_engineering/8973393163.html

            export class Lights {
                RedLight: boolean = false;
                YellowLight: boolean = false;
                GreenLight: boolean = false;
                constructor() { };
            }

            export class Framework {
                constructor() { };

            }

            var test: SymbolType

            // Function that searches for and returns an array of matches property values 
            var getListOfDatatypeMatches = function (object: JsonSchema, value: string) {

                return Object.keys(object).filter(function (key: string, index: number, array: string[]) {
                    let item: JsonSchema = object[key];

                    // Basic symbols that only have dut
                    if (item.$ref === value) { return true };

                    // Advanced symbols with addtional ADS info like pragmas
                    // Function must parse all properties to see if ST_TrafficLight is one of them
                    if (item.allOf) { return item.allOf.some(item => item.$ref === value); }

                    return false;

                });
            }

            var AdsSymbolCache: TcHmi.Symbol = new Symbol('%i%AdsSymbolCache%/i%');

            var destroyOnInitialized = TcHmi.EventProvider.register('onInitialized', function (e, data) {
                // This event will be raised only once, so we can free resources. 
                // It's best practice to use destroy function of the event object within the callback function to avoid conflicts.
                e.destroy();

                // Register callback to parse the symbols list for any Traffic Light types under the PLC1.MAIN namespace
                // PLC1 comes from the TcHmi name for the target runtime under the ADS Server Extension
                AdsSymbolCache.watch(data => {
                    if (data.value && data.value["PLC1.MAIN"]) {

                        let PlcMainVars: JsonSchema = data.value["PLC1.MAIN"].properties;
                        console.log("All MAIN vars and their schemas:", PlcMainVars);

                        // Run filter to only return string array of ST_TrafficLight symbol names
                        let results = getListOfDatatypeMatches(PlcMainVars, "#/definitions/PLC1.ST_TrafficLight")
                        console.log(results);

                        // Returned 'results' only have var name, not namespace - we add that back in
                        let qualifiedNames = results.map(element => "PLC1.MAIN." + element);

                        // Internal symbol that lists all ADS Symbols of datatype ST_TrafficLight
                        TcHmi.Symbol.writeEx('%i%AdsList_TrafficLightTypes%/i%', qualifiedNames)


                    }
                })

            });



        }
    
    }
}
