/*
Copyright (C): 2021, Shenzhen Yahboom Tech
Edited By gengyue
"AI_Module": "file:main.ts"
*/

//% color=#4876FF weight=50 icon="\uf083"
namespace AI_Module {

    export enum enFunctions {
        //% block="Home_Pages"
        Home_Pages,
        //% block="Face_Recognition"
        Face_Recognition,
        //% block="Object_Recognition"
        Object_Recognition,
        //% block="Object_Tracking"
        Object_Tracking,
        //% block="Color_Discrimination"
        Color_Discrimination,
        //% block="Automatic_Drive"
        Automatic_Drive,
        //% block="Find_Barcode"
        Find_Barcode,
        //% block="Find_Qrcode"
        Find_Qrcode,
        //% block="Find_AprilTag"
        Find_AprilTag,
        //% block="Shape_Detection"
        Shape_Detection,

    }

    export enum enFacePos {
        //% block="X_start"
        X_start = 7,
        //% block="Y_start"
        Y_start = 9,
        //% block="X_center"
        X_center = 10,
        //% block="Y_center"
        Y_center = 12,
        //% block="Width"
        Width = 13,
        //% block="Height"
        Height = 15,
    }

    export enum enObjRecPos {
        //% block="X_start"
        X_start = 6,
        //% block="Y_start"
        Y_start = 8,
        //% block="X_center"
        X_center = 9,
        //% block="Y_center"
        Y_center = 11,
        //% block="Width"
        Width = 12,
        //% block="Height"
        Height = 14,
    }

    export enum enObjectsClass {
        aeroplane = 0,
        bicycle,
        bird,
        boat,
        bottle,
        bus,
        car,
        cat,
        chair,
        cow,
        diningtable,
        dog,
        horse,
        motorbike,
        person,
        pottedplant,
        sheep,
        sofa,
        train,
        tvmonitor,

    }

    export enum enColorPos {
        //% block="X_start"
        X_start = 4,
        //% block="Y_start"
        Y_start = 6,
        //% block="X_center"
        X_center = 7,
        //% block="Y_center"
        Y_center = 9,
        //% block="Width"
        Width = 10,
        //% block="Height"
        Height = 12,
    }


    let Running_Func: enFunctions = enFunctions.Home_Pages
    let new_RecvLine: number = 0



    let Rx_Data: Buffer = pins.createBuffer(52)
    let Rx_index: number = 0
    let Rx_Number: number = 0
    let Rx_Flag: number = 0
    let uartData: Buffer = null

    
/**********************************************************************/
/**********************************************************************/
/**********************************************************************/
/*内部函数区************************************************************/

    function face_get_ID(index: number): number {
        if (Running_Func == enFunctions.Face_Recognition) {
            return Rx_Data.getUint8(6 + index * 10)
        }
        return -1
    }


    function serialSendArray(a: Array<uint8>) {
        serial.writeBuffer(pins.createBufferFromArray(a))
    }

    function serialSendBuf(command: Buffer) {
        serial.writeBuffer(command)
    }

    

    function parseData(buf: Buffer, num: number) {
        let Rx_Temp: number = 0

        for (let i = 0; i < num; i++) {
            Rx_Temp = buf.getUint8(i)

            switch (Rx_Flag) {
                case 0:
                    if (Rx_Temp == 0xFF) {
                        Rx_Flag = 1
                    }
                    break 
                case 1:
                    if(Rx_Temp == 0xFE)
                    {
                        Rx_Data.setUint8(0, 0xFF)
                        Rx_Data.setUint8(1, 0xFE)
                        Rx_Flag = 2;
                        
                    } else
                    {
                        Rx_Flag = 0
                    }
                    break
                case 2:
                    Rx_Data.setUint8(2, Rx_Temp)
                    Rx_Number = Rx_Temp + 3
                    Rx_index = 3
                    Rx_Flag = 3
                    break
                case 3:
                    Rx_Data.setUint8(Rx_index, Rx_Temp)
                    Rx_index++
    
                    if(Rx_index >= Rx_Number - 1)
                    {
                        Rx_Flag = 0
                        Rx_Temp = 0
                        new_RecvLine = 1
                    }
                    break
                default:
                    Rx_Flag = 0
                    Rx_Temp = 0
                    new_RecvLine = 0
                    break
            }
        }
    }

    function readSerial() {
        while (true) {
            let uartData = serial.readBuffer(0)
            if (uartData.length > 0) {
                // serial.writeBuffer(uartData)
                parseData(uartData, uartData.length)
            }
        }
    }




/**********************************************************************/
/**********************************************************************/
/**********************************************************************/
/*外部函数区************************************************************/

    
    /**
     * Initialize AI_Module
    */
    //% weight=100
    //% blockId=AI_Module_init
    //% block="AI_Module_init"
    export function AI_Module_init(): void {
        serial.setRxBufferSize(50)
        basic.pause(10)
        control.inBackground(readSerial)
    }

    /**
     * Func_Select
    */
    //% weight=100
    //% blockID="AI_Module_Func_Select"
    //% block="Func_Select %func"
    export function Func_Select(func: enFunctions): void {
        Running_Func = func
        let cmd = [0xff, 0xfe, 0x02, 0x01, func & 0xff]
        serialSendArray(cmd)
    }

    /**
     * Func_Name
    */
    //% weight=100
    //% blockID="AI_Module_Func_Name"
    //% block="Func_Name %func"
    export function Func_Name(func: enFunctions): enFunctions {
        return func
    }

    /**
     * Func_Running
    */
    //% weight=100
    //% blockID="AI_Module_Func_Running"
    //% block="Func_Running"
    export function Func_Running(): enFunctions {
        return Running_Func
    }

    /**
     * Request_Data
    */
    //% weight=100
    //% blockID="AI_Module_Request_Data"
    //% block="Request_Data"
    export function Request_Data(): boolean {
        let cmd = [0xff, 0xfe, 0x01, (Running_Func + 1) & 0xff]
        serialSendArray(cmd)
        
        basic.pause(10)
        
        if (new_RecvLine) {
            return true
        }
        return false
    }

    /**
     * Clear_Data
    */
    //% weight=100
    //% blockID="AI_Module_Clear_Data"
    //% block="Clear_Data"
    export function Clear_Data(): void {
        new_RecvLine = 0
        for (let i = 0; i < Rx_Number; i++) {
            Rx_Data.setUint8(i, 0)
        }
        Rx_Number = 0
    }

    /**
     * ReadSerialData
    */
    //% weight=100
    //% blockID="AI_Module_ReadSerialData"
    //% block="ReadSerialData"
    export function ReadSerialData(): void {
        uartData = serial.readBuffer(0)
        if (uartData.length > 0) {
            // serial.writeBuffer(uartData)
            parseData(uartData, uartData.length)
        }
    }


    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    /**
     * Face_Get_Count
    */
    //% weight=100
    //% blockID="AI_Module_Face_Get_Count"
    //% block="Face_Get_Count"
    //% subcategory="Face_Recognition"
    export function Face_Get_Count(): number {
        if (Running_Func == enFunctions.Face_Recognition) {
            return Rx_Data.getUint8(4)
        }
        return -1
    }

    /**
     * Face_Learned_Count
    */
    //% weight=100
    //% blockID="AI_Module_Face_Learned_Count"
    //% block="Face_Learned_Count"
    //% subcategory="Face_Recognition"
    export function Face_Learned_Count(): number {
        if (Running_Func == enFunctions.Face_Recognition) {
            return Rx_Data.getUint8(5)
        }
        return -1
    }

    /**
     * Face_UnLearn_Count
    */
    //% weight=100
    //% blockID="AI_Module_Face_UnLearn_Count"
    //% block="Face_UnLearn_Count"
    //% subcategory="Face_Recognition"
    export function Face_UnLearn_Count(): number {
        if (Running_Func == enFunctions.Face_Recognition) {
            return Face_Get_Count() - Face_Learned_Count()
        }
        return -1
    }



    /**
     * Face_is_Learned
    */
    //% weight=100
    //% blockID="AI_Module_Face_is_Learned"
    //% block="Face id %id is_Learned"
    //% subcategory="Face_Recognition"
    export function Face_is_Learned(id: number): boolean {
        if (Running_Func == enFunctions.Face_Recognition) {
            for (let i = 0; i < 3; i++) {
                if (id == face_get_ID(i)) {
                    return true
                }
            }
        }
        return false
    }

    /**
     * Face_Get_Postion
    */
    //% weight=100
    //% blockID="AI_Module_Face_Get_Postion"
    //% block="Face_Get_Postion |id %id|pos %pos"
    //% subcategory="Face_Recognition"
    export function Face_Get_Postion(id: number, pos: enFacePos): number {
        let index_id = -1
        if (Running_Func == enFunctions.Face_Recognition) {
            for (let i = 0; i < 3; i++) {
                if (id == Rx_Data.getUint8(i * 10 + 6)) {
                    index_id = i
                    break
                }
            }
            if (index_id == -1) {
                return -2
            }
            else {
                if ((pos-index_id) % 3 == 0) {
                    return Rx_Data.getUint8(pos + index_id*10)
                }
                else {
                    let pos_H = Rx_Data.getUint8(pos + index_id*10)
                    let pos_L = Rx_Data.getUint8(pos + 1 + index_id*10)
                    return (pos_H << 8 + pos_L)
                }
            }
        }
        return -1
    }
    

    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    /**
     * ObjRec_Get_Count
    */
    //% weight=100
    //% blockID="AI_Module_ObjRec_Get_Count"
    //% block="ObjRec_Get_Count"
    //% subcategory="Object_Recognition"
    export function ObjRec_Get_Count(): number {
        if (Running_Func == enFunctions.Object_Recognition) {
            return Rx_Data.getUint8(4)
        }
        return -1
    }


    /**
     * ObjRec_Have_Classes
    */
    //% weight=100
    //% blockID="AI_Module_ObjRec_Have_Classes"
    //% block="ObjRec_Have_Classes"
    //% subcategory="Object_Recognition"
    export function ObjRec_Have_Classes(objClass: enObjectsClass): boolean {
        if (Running_Func == enFunctions.Object_Recognition) {
            for (let i = 0; i < 3; i++) {
                if (objClass == Rx_Data.getUint8(5 + i * 10)) {
                    return true
                }
            }
        }
        return false
    }

    /**
     * ObjRec_Classes_Count
    */
    //% weight=100
    //% blockID="AI_Module_ObjRec_Classes_Count"
    //% block="ObjRec_Classes_Count"
    //% subcategory="Object_Recognition"
    export function ObjRec_Classes_Count(objClass: enObjectsClass): number {
        let num: number = 0
        if (Running_Func == enFunctions.Object_Recognition) {
            for (let i = 0; i < 3; i++) {
                if (objClass == Rx_Data.getUint8(5 + i * 10)) {
                    num++
                }
            }
            return num
        }
        return -1
    }


    /**
     * ObjRec_Get_Postion
    */
    //% weight=100
    //% blockID="AI_Module_ObjRec_Get_Postion"
    //% block="ObjRec_Get_Postion |index %index|type %type|pos %pos"
    //% subcategory="Object_Recognition"
    //% index.min=1 index.max=3 index.defl=1
    export function ObjRec_Get_Postion(index: number, objClass: enObjectsClass, pos: enObjRecPos): number {
        if (Running_Func == enFunctions.Object_Recognition) {
            if (pos == Rx_Data.getUint8(5 + index * 10)) {

                return Rx_Data.getUint8(pos + 5)
            }
            return Rx_Data.getUint8(pos + 5)
        }
        return -1
    }




    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////

    /**
     * Color_Set_Threshold
    */
    //% weight=100
    //% blockID="AI_Module_Color_Set_Threshold"
    //% block="Color_Set_Threshold |value %value"
    //% value.min=0 value.max=100 value.defl=80
    //% subcategory="Color_Discrimination"
    export function Color_Set_Threshold(value: number) {
        if (Running_Func == enFunctions.Color_Discrimination) {
            if (value < 0) value = 0
            if (value > 100) value = 100
            let cmd = [0xff, 0xfe, 0x02, 0x04, value & 0xff]
            serialSendArray(cmd)
        }
    }


    /**
     * Color_Get_Postion
    */
    //% weight=100
    //% blockID="AI_Module_Color_Get_Postion"
    //% block="Color_Get_Postion |pos %pos"
    //% subcategory="Color_Discrimination"
    export function Color_Get_Postion(pos: enColorPos): number {
        if (Running_Func == enFunctions.Color_Discrimination) {
            if (pos % 3 == 0) {
                return Rx_Data.getUint8(pos)
            }
            else {
                let pos_H = Rx_Data.getUint8(pos)
                let pos_L = Rx_Data.getUint8(pos + 1)
                return (pos_H << 8 + pos_L)
            }
        }
        return -1
    }

}
