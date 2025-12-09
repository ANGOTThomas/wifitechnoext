//% color=#FF00FF <icon="\uf1eb" block="Wifi Techno"
namespace WifiTechno {
    let buffer = ""
    let isWifiConnected = false;
    /**
     * Setup Grove - Uart WiFi V2 to connect to  Wi-Fi
     */
    //% block="Setup Wifi|TX %txPin|RX %rxPin|Baud rate %baudrate|SSID = %ssid|Password = %passwd"
    //% group="WifiTechno"
    //% txPin.defl=SerialPin.P15
    //% rxPin.defl=SerialPin.P1
    //% baudRate.defl=BaudRate.BaudRate115200
    export function setupWifi(txPin: SerialPin, rxPin: SerialPin, baudRate: BaudRate, ssid: string, passwd: string) {
        let result = 0

        isWifiConnected = false

        serial.redirect(
            txPin,
            rxPin,
            baudRate
        )

        sendAtCmd("AT+RESTORE")
        result = waitAtResponse("OK", "ERROR", "None", 1000)

        serial.redirect(
            txPin,
            rxPin,
            baudRate
        )

        sendAtCmd("AT")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        basic.showString("AT", 200)
        basic.showNumber(result)

        sendAtCmd("ATE0")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        basic.showString("ATE0", 200)
        basic.showNumber(result)

        sendAtCmd("AT+CWMODE=1")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        basic.showString("M", 200)
        basic.showNumber(result)

        sendAtCmd("AT+CWDHCP=1,3")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        basic.showString("D", 200)
        basic.showNumber(result)

        sendAtCmd(`AT+CWJAP="${ssid}","${passwd}"`)
        result = waitAtResponse("WIFI GOT IP", "ERROR", "None", 20000)
        basic.showString("W", 200)
        basic.showNumber(result)

       
        if (result == 1) {
            isWifiConnected = true
        }
    }

    /**
     * Setup Grove - Uart WiFi V2 to connect to  Wi-Fi (IP fixed)
     */
    //% block="Setup Wifi_IP_fixed|TX %txPin|RX %rxPin|Débit %baudrate|SSID = %ssid|Mot de passe = %passwd |Adresse IP = %adresseip |Passerelle = %gateway | Masque = %masquesr"
    //% group="WifiTechno"
    //% txPin.defl=SerialPin.P15
    //% rxPin.defl=SerialPin.P1
    //% baudRate.defl=BaudRate.BaudRate115200
    export function setupWifi_IP_fixed(txPin: SerialPin, rxPin: SerialPin, baudRate: BaudRate, ssid: string, passwd: string,
        adresseip: string,
        gateway: string,
        masquesr: string) {
        let result = 0

        isWifiConnected = false

        serial.redirect(
            txPin,
            rxPin,
            baudRate
        )

        sendAtCmd("AT+RESTORE")
        result = waitAtResponse("READY", "ERROR", "None", 1000)

        serial.redirect(
            txPin,
            rxPin,
            baudRate
        )

        sendAtCmd("AT")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        basic.showString("AT", 200)
        basic.showNumber(result)

        sendAtCmd("ATE0")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        basic.showString("ATE0", 200)
        basic.showNumber(result)
        

        sendAtCmd("AT+CWMODE=1")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        basic.showString("M", 200)
        basic.showNumber(result)

        
        sendAtCmd("AT+CWDHCP=0,3")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        basic.showString("D", 200)
        basic.showNumber(result)

        sendAtCmd("AT+CIPSTA=\"" + adresseip + "\",\"" + gateway + "\",\"" + masquesr + "\"")
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        basic.showString("IPF", 200)
        basic.showNumber(result)
   
        sendAtCmd(`AT+CWJAP="${ssid}","${passwd}"`)
        result = waitAtResponse("WIFI CONNECTED", "ERROR", "None", 20000)
        basic.showString("W", 200)
        basic.showNumber(result)
        
        sendAtCmd('AT+CIPDNS=1,"8.8.8.8"')
        result = waitAtResponse("OK", "ERROR", "None", 1000)
        basic.showString("DNS", 200)
        basic.showNumber(result)

        if (result == 1) {
            isWifiConnected = true
        }
    }


    /**
     * Check if Grove - Uart WiFi V2 is connected to Wifi
     */
    //% block="Wifi OK?"
    //% group="WifiTechno"
    export function wifiOK() {
        return isWifiConnected
    }

    /**
     * Send data to ThinkSpeak
     */
    //% block="Send Data to your ThinkSpeak Channel|Write API Key %apiKey|Field1 %field1|Field2 %field2|Field3 %field3|Field4 %field4|Field5 %field5|Field6 %field6|Field7 %field7|Field8 %field8"
    //% group="WifiTechno"
    //% apiKey.defl="your Write API Key"
    export function sendToThinkSpeak(apiKey: string, field1: number, field2: number, field3: number, field4: number, field5: number, field6: number, field7: number, field8: number) {
        let result = 0
        let retry = 2

        // close the previous TCP connection
        if (isWifiConnected) {
            sendAtCmd("AT+CIPCLOSE")
            waitAtResponse("OK", "ERROR", "None", 2000)
        }

        while (isWifiConnected && retry > 0) {

            basic.showString("TS",200)
            retry = retry - 1;

            sendAtCmd("ATE0")
            result = waitAtResponse("OK", "ERROR", "None", 1000)
            basic.showString("ATE0", 200)
            basic.showNumber(result)
            
            sendAtCmd("AT+CIPMUX=0")
            result = waitAtResponse("OK", "ERROR", "None", 1000)
            basic.showString("MUX", 200)
            basic.showNumber(result)

            // establish TCP connection
            //sendAtCmd("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80")
            sendAtCmd('AT+CIPSTART="TCP","api.thingspeak.com",80')
            result = waitAtResponse("CONNECT","OK", "ERROR", 5000)
            basic.showString("TCP", 200)
            basic.showNumber(result)
        
            if (result == 3) continue
            
        

            let data = "GET /update?api_key=" + apiKey
            if (!isNaN(field1)) data = data + "&field1=" + field1
            if (!isNaN(field2)) data = data + "&field2=" + field2
            if (!isNaN(field3)) data = data + "&field3=" + field3
            if (!isNaN(field4)) data = data + "&field4=" + field4
            if (!isNaN(field5)) data = data + "&field5=" + field5
            if (!isNaN(field6)) data = data + "&field6=" + field6
            if (!isNaN(field7)) data = data + "&field7=" + field7
            if (!isNaN(field8)) data = data + "&field8=" + field8
            data = data + "\u000D\u000A"

            sendAtCmd("AT+CIPSEND=" + (data.length+2))
            basic.showString("dl", 200)
            basic.showNumber(data.length)
            result = waitAtResponse(">", "OK", "ERROR", 1000)
            basic.showString("L", 200)
            basic.showNumber(result)
            if (result == 3) continue
            
            sendAtCmd(data)
            result = waitAtResponse("Recv", "SEND FAIL", "ERROR", 5000)
            basic.showString("D", 200)
            basic.showNumber(result)

            // // close the TCP connection
            // sendAtCmd("AT+CIPCLOSE")
            // waitAtResponse("OK", "ERROR", "None", 2000)

            if (result == 1) break
        }
    }

    /**
     * Send data to IFTTT
     */
    //% block="Send Data to your IFTTT Event|Event %event|Key %key|value1 %value1|value2 %value2|value3 %value3"
    //% group="WifiTechno"
    //% event.defl="your Event"
    //% key.defl="your Key"
    //% value1.defl="hello"
    //% value2.defl="micro"
    //% value3.defl="bit"
    export function sendToIFTTT(event: string, key: string, value1: string, value2: string, value3: string) {
        let result = 0
        let retry = 2

        // close the previous TCP connection
        if (isWifiConnected) {
            sendAtCmd("AT+CIPCLOSE")
            waitAtResponse("OK", "ERROR", "None", 2000)
        }

        while (isWifiConnected && retry > 0) {
            retry = retry - 1;
            // establish TCP connection
            sendAtCmd("AT+CIPSTART=\"TCP\",\"maker.ifttt.com\",80")
            result = waitAtResponse("OK", "ALREADY CONNECTED", "ERROR", 2000)
            if (result == 3) continue

            let data = "GET /trigger/" + event + "/with/key/" + key
            data = data + "?value1=" + value1
            data = data + "&value2=" + value2
            data = data + "&value3=" + value3
            data = data + " HTTP/1.1"
            data = data + "\u000D\u000A"
            data = data + "User-Agent: curl/7.58.0"
            data = data + "\u000D\u000A"
            data = data + "Host: maker.ifttt.com"
            data = data + "\u000D\u000A"
            data = data + "Accept: */*"
            data = data + "\u000D\u000A"

            sendAtCmd("AT+CIPSEND=" + (data.length + 2))
            result = waitAtResponse(">", "OK", "ERROR", 2000)
            if (result == 3) continue
            sendAtCmd(data)
            result = waitAtResponse("SEND OK", "SEND FAIL", "ERROR", 5000)

            // // close the TCP connection
            // sendAtCmd("AT+CIPCLOSE")
            // waitAtResponse("OK", "ERROR", "None", 2000)

            if (result == 1) break
        }
    }


    function waitAtResponse(target1: string, target2: string, target3: string, timeout: number) {
        buffer = ""
        let start = input.runningTime()

        while ((input.runningTime() - start) < timeout) {
            
            buffer += serial.readString()
            grove.lcd_show_string("                ", 0, 0)
            grove.lcd_show_string(buffer, 0, 0)
            if (buffer.includes(target1)) return 1
            if (buffer.includes(target2)) return 2
            if (buffer.includes(target3)) return 3

            basic.pause(100)
            }
        
        
        return 0
    }

    function sendAtCmd(cmd: string) {
        serial.writeString(cmd + "\u000D\u000A")
    }
}

