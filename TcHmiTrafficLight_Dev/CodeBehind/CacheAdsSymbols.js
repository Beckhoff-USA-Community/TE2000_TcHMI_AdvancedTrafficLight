var TcHmi;
(function (TcHmi) {
    // If you want to unregister an event outside the event code you need to use the return value of the method register()
    var destroyOnInitialized = TcHmi.EventProvider.register('onInitialized', function (e, data) {
        // This event will be raised only once, so we can free resources. 
        // It's best practice to use destroy function of the event object within the callback function to avoid conflicts.
        e.destroy();
        let request = {
            "requestType": "ReadWrite",
            "commands": [
                {
                    "commandOptions": ["SendErrorMessage", "SendWriteValue"],
                    "symbol": "ADS.ListSymbols"
                }
            ]
        };
        TcHmi.Server.request(request, function (data) {
            if (data === undefined || data.response === undefined || data.response.commands === undefined) {
                return;
            }
            // Store the full list of available ADS Symbols
            let AdsSymbolList = data.response.commands[0].readValue.definitions;
            // Store seperate all available ADS symbols under PLC1.MAIN
            // PLC1 is the namespace under the TcHmi ADS Server Extension, default port 851 for your PLC app, then MAIN pou
            let PlcMainVars = data.response.commands[0].readValue.definitions["PLC1.MAIN"].properties;
            console.log("All MAIN vars and their schemas:", PlcMainVars);
            // Cache all ADS Symbols from ADS Server in a local internal symbol
            // Additional logic may be needed to update defintions if the runtime changes while a TcHmi client is loaded without refreshing
            TcHmi.Symbol.writeEx('%i%AdsSymbolCache%/i%', AdsSymbolList);
            // Run filter to only return string array of ST_TrafficLight symbol names
            let results = getListOfDatatypeMatches(PlcMainVars, "#/definitions/PLC1.ST_TrafficLight");
            console.log(results);
            // Returned 'results' only have var name, not namespace - we add that back in
            let qualifiedNames = results.map(element => "PLC1.MAIN." + element);
            // Internal symbol that lists all ADS Symbols of datatype ST_TrafficLight
            TcHmi.Symbol.writeEx('%i%AdsList_TrafficLightTypes%/i%', qualifiedNames);
        });
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
    });
})(TcHmi || (TcHmi = {}));
//# sourceMappingURL=CacheAdsSymbols.js.map