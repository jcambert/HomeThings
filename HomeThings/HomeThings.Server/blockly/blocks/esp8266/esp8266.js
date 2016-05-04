'use strict';
Blockly.Blocks['esp_webserver'] = {
    init: function () {
        this.appendValueInput("SSID")
            .setCheck("String")
            .appendField("SSID");
        this.appendValueInput("PASSWORD")
            .setCheck("String")
            .appendField("Password");
        this.appendValueInput("PORT")
            .setCheck(null)
            .appendField("Port");
        this.setOutput(true, "ESP8266WebServer");
        this.setColour(60);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
    }
};