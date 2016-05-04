'use strict';

goog.provide('Blockly.Arduino.esp8266');

goog.require('Blockly.Arduino');

Blockly.Arduino['esp_webserver'] = function (block) {
    var value_ssid = Blockly.JavaScript.valueToCode(block, 'SSID', Blockly.JavaScript.ORDER_ATOMIC);
    var value_password = Blockly.JavaScript.valueToCode(block, 'PASSWORD', Blockly.JavaScript.ORDER_ATOMIC);
    var value_port = Blockly.JavaScript.valueToCode(block, 'PORT', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = 'WiFi.begin(" + value_ssid +"," + value_password + ");\nreturn server(+value_port+);';
    return code;
};