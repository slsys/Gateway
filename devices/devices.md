 <table  style="width: 100%" id="bidsTable">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th >Amount</th>

                        <th >Start Date</th>
                        <th >Bids</th>
                        <th >End Date</th>
                        <th ></th>
                    </tr>
                </thead>
                <tbody>
                        <tr>
                            <td >Peugeot 406 car fro sale</td>
                            <td >800000.00</td>

                            <td >2017-04-10 3:48:47 PM</td>
                            <td >1</td>
                            <td >2017-05-10 3:48:47 PM</td>
                            <td ></td>
                        </tr>
                        <tr>
                            <td >House for sale in Kubwa</td>
                            <td >4000000.00</td>

                            <td >2017-04-10 3:48:47 PM</td>
                            <td >0</td>
                            <td >2017-06-10 3:48:47 PM</td>
                            <td ></td>
                        </tr>
                        <tr>
                            <td >Five hectare farming land for lease</td>
                            <td >3000000.00</td>

                            <td >2017-04-10 3:48:47 PM</td>
                            <td >0</td>
                            <td >2017-07-10 3:48:47 PM</td>
                            <td ></td>
                        </tr>



                </tbody>
            </table>
И вот идет мой код JavaScript

 <script>
var table = document.getElementById("bidsTable");
for (var i = 1, row; row = table.rows[i]; i++) {
    //iterate through rows
    //rows would be accessed using the "row" variable assigned in the for loop

    var endDate = row.cells[4];
    countDownDate = new Date(endDate.innerHTML.replace(/-/g, "/")).getTime();
    var countDown = row.cells[5];
    // Update the count down every 1 second

    var x = setInterval(
    function () {
        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);


        // Display the result in the element
        countDown.innerHTML = (days + "d " + hours + "h "
            + minutes + "m " + seconds + "s ");

         //If the count down is finished, write some text 
        if (distance < 0) {
            clearInterval(x);
            countDown.innerHTML = "Bid closed";
        }
    }, 1000);
}
 </script>


# Xiaomi 

[MiJia temperature & humidity sensor WSDCGQ01LM](/WSDCGQ01LM.md)

[MiJia wireless switch (WXKG01LM)](/WXKG01LM.md)

[MiJia door & window contact sensor (MCCGQ01LM)](/MCCGQ01LM.md)

[MiJia human body movement sensor (RTCGQ01LM)](/RTCGQ01LM.md)

[MiJia Honeywell smoke detector (JTYJ-GD-01LM/BW)](/JTYJ-GD-01LM_BW.md)

[MiJia gas leak detector (JTQJ-BF-01LM/BW)](/JTQJ-BF-01LM_BW.md)

[Mi power plug ZigBee (ZNCZ02LM)](/ZNCZ02LM.md)

[Mi/Aqara smart home cube (MFKZQ01LM)](/MFKZQ01LM.md])

[Mi power plug ZigBee EU (ZNCZ04LM)](/ZNCZ04LM.md)

[Aqara temperature, humidity and pressure sensor (WSDCGQ11LM)](/WSDCGQ11LM.md)

[Aqara wireless switch (WXKG11LM)](/WXKG11LM.md)

[Aqara double key wireless wall switch (WXKG02LM)](/WXKG02LM.md)

[Aqara water leak sensor (SJCGQ11LM)](/SJCGQ11LM.md)

[Aqara door & window contact sensor (MCCGQ11LM)](/MCCGQ11LM.md)

[Aqara human body movement and illuminance sensor (RTCGQ11LM)](/RTCGQ11LM.md)

[Aqara vibration sensor (DJT11LM)](/DJT11LM.md)

[Aqara smart LED bulb (ZNLDP12LM)](/ZNLDP12LM.md)

[Aqara curtain motor (ZNCLDJ11LM)](/ZNCLDJ11LM.md)

[Aqara B1 curtain motor (ZNCLDJ12LM)](/ZNCLDJ12LM.md)

[Aqara double key wired wall switch (QBKG12LM)](/QBKG12LM.md)

[Aqara wireless switch with gyroscope (WXKG12LM)](/WXKG12LM.md)

[Aqara single key wireless wall switch (WXKG03LM)](/WXKG03LM.md)

[Aqara single key wired wall switch (QBKG11LM)](/QBKG11LM.md)

[Aqara single key wired wall switch without neutral wire (QBKG04LM)](/QBKG04LM.md)

[Aqara double key wired wall switch without neutral wire (QBKG03LM)](/QBKG03LM.md)

[Aqara wireless relay controller (LLKZMK11LM)](/LLKZMK11LM.md)

[Aqara socket Zigbee (QBCZ11LM)](/QBCZ11LM.md)

[Aqara S2 Lock (ZNMS12LM)](/ZNMS12LM.md)

[Aqara S2 Lock Pro (ZNMS13LM)](/ZNMS13LM.md)

[Vima Smart Lock (A6121)](/A6121.md)

# IKEA 
TRADFRI remote control (E1524)
TRADFRI wireless dimmer (ICTC-G-1)
TRADFRI motion sensor (E1525)
TRADFRI signal repeater (E1746)
TRADFRI LED bulb E27 1000 lumen, dimmable, opal white (LED1623G12)
TRADFRI LED bulb E14/E26/E27 600 lumen, dimmable, color, opal white (LED1624G9)         
TRADFRI LED bulb E12/E14/E17 400 lumen, dimmable warm white, chandelier opal (LED1649C5)
TRADFRI LED bulb E26/E27 980 lumen, dimmable, white spectrum, opal white (LED1545G12)

# Nue / 3A
Smart light controller (LXZB-02A)

# Trust 
Smart Dimmable LED Bulb (ZLED-2709)
RGB Tunable LED Bulb (ZLED-RGB9)
Smart tunable LED bulb (ZLED-TUNE9)

# Terncy 
Awareness switch (TERNCY-PP01)

# Danalock 
BT/ZB smartlock (V3-BTZB)

#  Sparx 
Single-channel relay switch (X2RM01)
Double-channel relay switch (X2RM02)
Triple-channel relay switch (X2RM03)

# eWeLink 
Zigbee OnOff Controller (DZ4743-00B)

# Konke 
Motion Sensor (2AJZ4KPBS)

# Itead 
Sonoff Zigbee DIY Smart Switch (BASICZBR3)

#  LifeControl 
Temperature, Humidity, eCO2, VOC sensor (MCLH-08)

#  Ksentry 
Zigbee OnOff Controller (KS-SM001)

#  DiY 
DIYRuZ 4 Relays + 4 switches + 1 buzzer (DIYRuZ_R4_5)
DIYRuZ 20 button keypad (DIYRuZ_KEYPAD20)
DIYRuZ door/window open sensor (DIYRuZ_magnet)
DIYRuZ relay switch power meter (DYRuZ_rspm)
