# TE2000_TcHMI_AdvancedTrafficLight

TwinCAT HMI 1.12 sample code for an advanced traffic light visual. 
Includes sample code for touch handling and locking, a context menu with a sample data binding command, auto mapping PLC vars, and setter validation best practices. 

Contains the following projects:

TcHmiTrafficLight_Dev
- The main TcHmi Project for testing

TrafficLight
- The Framework Project with a traffic light control

ContextMenu
- The Framework Project with a context menu control

TwinCAT Project
- A TwinCAT Project containing sample PLC code with ST_TrafficLight DUT and user attribute pragmas to read from TcHmi

![Alt Text](https://github.com/Beckhoff-USA-Community/TE2000_TcHMI_AdvancedTrafficLight/raw/master/RepoResources/Images/AdvancedTrafficLight.gif)
