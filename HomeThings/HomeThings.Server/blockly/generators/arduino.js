﻿/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://code.google.com/p/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for generating Arduino for blocks.
 * @author gasolin@gmail.com (Fred Lin)
 */
'use strict';

goog.provide('Blockly.Arduino');
goog.require('Blockly.Generator');
goog.require('Blockly.StaticTyping');


/**
 * Arduino code generator.
 * @type !Blockly.Generator
 */
Blockly.Arduino = new Blockly.Generator('Arduino');
Blockly.Arduino.StaticTyping = new Blockly.StaticTyping();

//BlocklyDuino.pictSize = 2;
//set default image size
Blockly.Arduino.imageSizeNull = 0; //pictSize = 0
Blockly.Arduino.imageSizeSmall = 32; //pictSize = 1
Blockly.Arduino.imageSizeNormal = 64; //pictSize = 2
Blockly.Arduino.imageSizeBig = 96; //pictSize = 3
Blockly.Arduino.imageSizeOld = 32;
Blockly.Arduino.imageSize = Blockly.Arduino.imageSizeNormal;
Blockly.Arduino.imageBool = true;
Blockly.Arduino.cardSize = 200; //same as width in index.html showcardModal

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Arduino.addReservedWords(
  // http://arduino.cc/en/Reference/HomePage
  'setup,loop,if,else,for,switch,case,while,do,break,continue,return,goto,define,include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,true,false,interger, constants,floating,point,void,bookean,char,unsigned,byte,int,word,long,float,double,string,String,array,static, volatile,const,sizeof,pinMode,digitalWrite,digitalRead,analogReference,analogRead,analogWrite,tone,noTone,shiftOut,shitIn,pulseIn,millis,micros,delay,delayMicroseconds,min,max,abs,constrain,map,pow,sqrt,sin,cos,tan,randomSeed,random,lowByte,highByte,bitRead,bitWrite,bitSet,bitClear,bit,attachInterrupt,detachInterrupt,interrupts,noInterrupts'
);

/**
 * Order of operation ENUMs.
 *
 */
Blockly.Arduino.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Arduino.ORDER_UNARY_POSTFIX = 1;  // expr++ expr-- () [] .
Blockly.Arduino.ORDER_UNARY_PREFIX = 2;   // -expr !expr ~expr ++expr --expr
Blockly.Arduino.ORDER_MULTIPLICATIVE = 3; // * / % ~/
Blockly.Arduino.ORDER_ADDITIVE = 4;       // + -
Blockly.Arduino.ORDER_SHIFT = 5;          // << >>
Blockly.Arduino.ORDER_RELATIONAL = 6;     // is is! >= > <= <
Blockly.Arduino.ORDER_EQUALITY = 7;       // == != === !==
Blockly.Arduino.ORDER_BITWISE_AND = 8;    // &
Blockly.Arduino.ORDER_BITWISE_XOR = 9;    // ^
Blockly.Arduino.ORDER_BITWISE_OR = 10;    // |
Blockly.Arduino.ORDER_LOGICAL_AND = 11;   // &&
Blockly.Arduino.ORDER_LOGICAL_OR = 12;    // ||
Blockly.Arduino.ORDER_CONDITIONAL = 13;   // expr ? expr : expr
Blockly.Arduino.ORDER_ASSIGNMENT = 14;    // = *= /= ~/= %= += -= <<= >>= &= ^= |=
Blockly.Arduino.ORDER_NONE = 99;          // (...)

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Arduino.init = function (workspace) {
    // Create a dictionary of definitions to be printed at the top of the sketch
    Blockly.Arduino.includes_ = Object.create(null);
    // Create a dictionary of global definitions to be printed after variables
    Blockly.Arduino.definitions_ = Object.create(null);
    // Create a dictionary of variables
    Blockly.Arduino.variables_ = Object.create(null);
    // Create a dictionary of functions from the code generator
    Blockly.Arduino.codeFunctions_ = Object.create(null);
    // Create a dictionary of functions created by the user
    Blockly.Arduino.userFunctions_ = Object.create(null);
    // Create a dictionary mapping desired function names in definitions_
    // to actual function names (to avoid collisions with user functions)
    Blockly.Arduino.functionNames_ = Object.create(null);
    // Create a dictionary of setups to be printed in the setup() function
    Blockly.Arduino.setups_ = Object.create(null);
    // Create a dictionary of pins to check if their use conflicts
    Blockly.Arduino.pins_ = Object.create(null);

    if (!Blockly.Arduino.variableDB_) {
        Blockly.Arduino.variableDB_ =
        new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
    } else {
        Blockly.Arduino.variableDB_.reset();
    }

    // Iterate through to capture all blocks types and set the function arguments
    var varsWithTypes = Blockly.Arduino.StaticTyping.collectVarsWithTypes(workspace);
    Blockly.Arduino.StaticTyping.setProcedureArgs(workspace, varsWithTypes);

    // Set variable declarations with their Arduino type in the defines dictionary
    for (var varName in varsWithTypes) {
        Blockly.Arduino.addVariable(varName,
        Blockly.Arduino.getArduinoType_(varsWithTypes[varName]) + ' ' +
        varName + ';');
    }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Arduino.finish = function (code) {
    // Convert the includes, definitions, and functions dictionaries into lists
    var includes = [], definitions = [], variables = [], functions = [];
    for (var name in Blockly.Arduino.includes_) {
        includes.push(Blockly.Arduino.includes_[name]);
    }
    if (includes.length) {
        includes.push('\n');
    }
    for (var name in Blockly.Arduino.variables_) {
        variables.push(Blockly.Arduino.variables_[name]);
    }
    if (variables.length) {
        variables.push('\n');
    }
    for (var name in Blockly.Arduino.definitions_) {
        definitions.push(Blockly.Arduino.definitions_[name]);
    }
    if (definitions.length) {
        definitions.push('\n');
    }
    for (var name in Blockly.Arduino.codeFunctions_) {
        functions.push(Blockly.Arduino.codeFunctions_[name]);
    }
    for (var name in Blockly.Arduino.userFunctions_) {
        functions.push(Blockly.Arduino.userFunctions_[name]);
    }
    if (functions.length) {
        functions.push('\n');
    }

    // userSetupCode added at the end of the setup function without leading spaces
    var setups = [''], userSetupCode = '';
    if (Blockly.Arduino.setups_['userSetupCode'] !== undefined) {
        userSetupCode = '\n' + Blockly.Arduino.setups_['userSetupCode'];
        delete Blockly.Arduino.setups_['userSetupCode'];
    }
    for (var name in Blockly.Arduino.setups_) {
        setups.push(Blockly.Arduino.setups_[name]);
    }
    if (userSetupCode) {
        setups.push(userSetupCode);
    }

    // Clean up temporary data
    delete Blockly.Arduino.includes_;
    delete Blockly.Arduino.definitions_;
    delete Blockly.Arduino.codeFunctions_;
    delete Blockly.Arduino.userFunctions_;
    delete Blockly.Arduino.functionNames_;
    delete Blockly.Arduino.setups_;
    delete Blockly.Arduino.pins_;
    Blockly.Arduino.variableDB_.reset();

    var allDefs = includes.join('\n') + variables.join('\n') +
      definitions.join('\n') + functions.join('\n\n');
    var setup = 'void setup() {' + setups.join('\n  ') + '\n}\n\n';
    var loop = 'void loop() {\n  ' + code.replace(/\n/g, '\n  ') + '\n}';
    return allDefs + setup + loop;
};



/**
 * Adds a string of "include" code to be added to the sketch.
 * Once a include is added it will not get overwritten with new code.
 * @param {!string} includeTag Identifier for this include code.
 * @param {!string} code Code to be included at the very top of the sketch.
 */
Blockly.Arduino.addInclude = function (includeTag, code) {
    if (Blockly.Arduino.includes_[includeTag] === undefined) {
        Blockly.Arduino.includes_[includeTag] = code;
    }
};

/**
 * Adds a string of code to be declared globally to the sketch.
 * Once it is added it will not get overwritten with new code.
 * @param {!string} declarationTag Identifier for this declaration code.
 * @param {!string} code Code to be added below the includes.
 */
Blockly.Arduino.addDeclaration = function (declarationTag, code) {
    if (Blockly.Arduino.definitions_[declarationTag] === undefined) {
        Blockly.Arduino.definitions_[declarationTag] = code;
    }
};

/**
 * Adds a string of code into the Arduino setup() function. It takes an
 * identifier to not repeat the same kind of initialisation code from several
 * blocks. If overwrite option is set to true it will overwrite whatever
 * value the identifier held before.
 * @param {!string} setupTag Identifier for the type of set up code.
 * @param {!string} code Code to be included in the setup() function.
 * @param {boolean=} overwrite Flag to ignore previously set value.
 */
Blockly.Arduino.addSetup = function (setupTag, code, overwrite) {
    if (overwrite) {
        Blockly.Arduino.setups_[setupTag] = code;
    } else if (Blockly.Arduino.setups_[setupTag] === undefined) {
        Blockly.Arduino.setups_[setupTag] = code;
    }
};

/**
 * Adds a string of code as a function. It takes an identifier (meant to be the
 * function name) to only keep a single copy even if multiple blocks might
 * request this function to be created.
 * A function (and its code) will only be added on first request.
 * @param {!string} preferedName Identifier for the function.
 * @param {!string} code Code to be included in the setup() function.
 * @return {!string} A unique function name based on input name.
 */
Blockly.Arduino.addFunction = function (preferedName, code) {
    if (Blockly.Arduino.codeFunctions_[preferedName] === undefined) {
        var uniqueName = Blockly.Arduino.variableDB_.getDistinctName(
            preferedName, Blockly.Generator.NAME_TYPE);
        Blockly.Arduino.codeFunctions_[preferedName] =
            code.replace(Blockly.Arduino.DEF_FUNC_NAME, uniqueName);
        Blockly.Arduino.functionNames_[preferedName] = uniqueName;
    }
    return Blockly.Arduino.functionNames_[preferedName];
};

/**
 * Adds a string of code to declare a variable globally to the sketch.
 * Only if overwrite option is set to true it will overwrite whatever
 * value the identifier held before.
 * @param {!string} varName The name of the variable to declare.
 * @param {!string} code Code to be added for the declaration.
 * @param {boolean=} overwrite Flag to ignore previously set value.
 * @return {!boolean} Indicates if the declaration overwrote a previous one.
 */
Blockly.Arduino.addVariable = function (varName, code, overwrite) {
    var overwritten = false;
    if (overwrite || (Blockly.Arduino.variables_[varName] === undefined)) {
        Blockly.Arduino.variables_[varName] = code;
        overwritten = true;
    }
    return overwritten;
};


/**
 * Description.
 * @param {!Blockly.Block} block Description.
 * @param {!string} pin Description.
 * @param {!string} pinType Description.
 * @param {!string} warningTag Description.
 */
Blockly.Arduino.reservePin = function (block, pin, pinType, warningTag) {
    if (Blockly.Arduino.pins_[pin] !== undefined) {
        if (Blockly.Arduino.pins_[pin] != pinType) {
            block.setWarningText(Blockly.Msg.ARD_PIN_WARN1.replace('%1', pin)
              .replace('%2', warningTag).replace('%3', pinType)
              .replace('%4', Blockly.Arduino.pins_[pin]), warningTag);
        } else {
            block.setWarningText(null, warningTag);
        }
    } else {
        Blockly.Arduino.pins_[pin] = pinType;
        block.setWarningText(null, warningTag);
    }
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Arduino.scrubNakedValue = function (line) {
    return line + ';\n';
};

/**
 * Encode a string as a properly escaped Arduino string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Arduino string.
 * @private
 */
Blockly.Arduino.quote_ = function (string) {
    // TODO: This is a quick hack.  Replace with goog.string.quote
    string = string.replace(/\\/g, '\\\\')
                   .replace(/\n/g, '\\\n')
                   .replace(/\$/g, '\\$')
                   .replace(/'/g, '\\\'');
    return '\"' + string + '\"';
};

/**
 * Common tasks for generating Arduino from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Arduino code created for this block.
 * @return {string} Arduino code with comments and subsequent blocks added.
 * @private
 */
Blockly.Arduino.scrub_ = function (block, code) {
    if (code === null) {
        // Block has handled code generation itself.
        return '';
    }
    var commentCode = '';
    // Only collect comments for blocks that aren't inline.
    if (!block.outputConnection || !block.outputConnection.targetConnection) {
        // Collect comment for this block.
        var comment = block.getCommentText();
        if (comment) {
            commentCode += Blockly.Arduino.prefixLines(comment, '// ') + '\n';
        }
        // Collect comments for all value arguments.
        // Don't collect comments for nested statements.
        for (var x = 0; x < block.inputList.length; x++) {
            if (block.inputList[x].type == Blockly.INPUT_VALUE) {
                var childBlock = block.inputList[x].connection.targetBlock();
                if (childBlock) {
                    var comment = Blockly.Arduino.allNestedComments(childBlock);
                    if (comment) {
                        commentCode += Blockly.Arduino.prefixLines(comment, '// ');
                    }
                }
            }
        }
    }
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    var nextCode = Blockly.Arduino.blockToCode(nextBlock);
    return commentCode + code + nextCode;
};


/**
 * Generates Arduino Types from a Blockly Type.
 * @param {!Blockly.StaticTyping.BlocklyType} typeBlockly The Blockly type to be
 *     converted.
 * @return {string} Arduino type for the respective Blockly input type, in a
 *     string format.
 * @this {Blockly.StaticTyping}
 * @private
 */
Blockly.Arduino.getArduinoType_ = function (typeBlockly) {
    switch (typeBlockly.typeName) {
        case Blockly.Types.NUMBER.typeName:
            return 'int';
        case Blockly.Types.DECIMAL.typeName:
            return 'float';
        case Blockly.Types.TEXT.typeName:
            return 'String';
        case Blockly.Types.CHARACTER.typeName:
            return 'char';
        case Blockly.Types.BOOLEAN.typeName:
            return 'boolean';
        case Blockly.Types.NULL.typeName:
            return 'void';
        case Blockly.Types.UNDEF.typeName:
            return 'undefined';
        case Blockly.Types.CHILD_BLOCK_MISSING.typeName:
            // If no block connected default to int, change for easier debugging
            //return 'ChildBlockMissing';
            return 'int';
        default:
            //return 'Invalid Type';
            return 'int';
    }
};

/** Used for not-yet-implemented block code generators */
Blockly.Arduino.noGeneratorCodeInline = function () {
    return ['', Blockly.Arduino.ORDER_ATOMIC];
};

/** Used for not-yet-implemented block code generators */
Blockly.Arduino.noGeneratorCodeLine = function () { return ''; };