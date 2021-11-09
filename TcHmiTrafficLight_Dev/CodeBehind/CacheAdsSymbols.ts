module TcHmi {
    // If you want to unregister an event outside the event code you need to use the return value of the method register()
    var destroyOnInitialized = TcHmi.EventProvider.register('onInitialized', function (e, data) {
        // This event will be raised only once, so we can free resources. 
        // It's best practice to use destroy function of the event object within the callback function to avoid conflicts.
        e.destroy();

        // Setup a Subscription to the ADS Symbols list so any runtime changes also update the internal cache held here
            let request: Server.IMessage = {
                "requestType": "Subscription",
                "commands": [
                    {
                        "commandOptions": ["SendErrorMessage", "SendWriteValue"],
                        "symbol": "ADS.ListSymbols::definitions"
                    }
                ]
            }

        // With subscription, any change will return a new value and run this callback
            TcHmi.Server.request(request, function (data: Server.IResultObject) {
                if (data === undefined || data.response === undefined || data.response.commands === undefined) {
                    console.log("ADS.ListSymbols returned undefined");
                    return;
                }
                if (data.response.commands[0].error) {
                    console.log("ADS.ListSymbols returned error:", data.response.commands[0].error);
                    return;
                };

                    // Store the full list of available ADS Symbols
                let AdsSymbolList = data.response.commands[0].readValue;

                // Cache all ADS Symbols from ADS Server in a local internal symbol
                // The subscription callback will run anytime a change is detected within the "ADS.ListSymbols::definitions" symbol and update the local cache
                TcHmi.Symbol.writeEx('%i%AdsSymbolCache%/i%', AdsSymbolList)


            });

        });
 }