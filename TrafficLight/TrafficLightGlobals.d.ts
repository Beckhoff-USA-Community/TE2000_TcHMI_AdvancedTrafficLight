/// <reference path="../Packages/Beckhoff.TwinCAT.HMI.Framework.12.750.1/runtimes/native1.12-tchmi/TcHmi.d.ts" />
declare module TcHmi {
    module Controls {
        module TrafficLight {
            class Lights {
                RedLight: boolean;
                YellowLight: boolean;
                GreenLight: boolean;
                constructor();
            }
            class Framework {
                constructor();
            }
        }
    }
}
