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
        //% block="Find_Line"
        Find_Line,
        //% block="Find_Qrcode"
        Find_Qrcode,
        //% block="Find_AprilTag"
        Find_AprilTag,
        //% block="Find_Barcode"
        Find_Barcode,
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

    export enum enLinePos {
        //% block="X_start"
        X_start = 4,
        //% block="Y_start"
        Y_start = 6,
        //% block="X_stop"
        X_stop = 7,
        //% block="Y_stop"
        Y_stop = 9,
        //% block="Direction"
        Direction = 10,
    }

    export enum enQRCodePos {
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

    export enum enAprilTagPos {
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

    export enum enBarCodePos {
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

    


    let g_Running_Func: enFunctions = enFunctions.Home_Pages
    let g_new_RecvLine: number = 0

    let g_Rx_Data: Buffer = pins.createBuffer(52)
    let g_Rx_index: number = 0
    let g_Rx_Number: number = 0
    let g_Rx_Flag: number = 0
    let g_Rx_Time: number = 0

    
/**********************************************************************/
/**********************************************************************/
/**********************************************************************/
/*内部函数区************************************************************/

    function face_get_ID(index: number): number {
        if (g_Running_Func == enFunctions.Face_Recognition) {
            return g_Rx_Data.getUint8(6 + index * 10)
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

            switch (g_Rx_Flag) {
                case 0:
                    if (Rx_Temp == 0xFF) {
                        g_Rx_Flag = 1
                    }
                    break 
                case 1:
                    if(Rx_Temp == 0xFE)
                    {
                        g_Rx_Data.setUint8(0, 0xFF)
                        g_Rx_Data.setUint8(1, 0xFE)
                        g_Rx_Flag = 2;
                        
                    } else
                    {
                        g_Rx_Flag = 0
                    }
                    break
                case 2:
                    g_Rx_Number = Rx_Temp + 3
                    if (g_Rx_Number > 50) {
                        g_Rx_Number = 0
                        g_Rx_index = 0
                        g_Rx_Flag = 0
                    }
                    else {
                        g_Rx_Data.setUint8(2, Rx_Temp)
                        g_Rx_index = 3
                        g_Rx_Flag = 3
                        g_Rx_Time = control.millis()
                    }    
                    break
                case 3:
                    g_Rx_Data.setUint8(g_Rx_index, Rx_Temp)
                    g_Rx_index++
    
                    if(g_Rx_index >= g_Rx_Number)
                    {
                        g_Rx_Flag = 0
                        Rx_Temp = 0
                        g_new_RecvLine = 1
                    }
                    if (control.millis() - g_Rx_Time >= 10) {
                        g_Rx_Flag = 0
                        Rx_Temp = 0
                        g_new_RecvLine = 0
                        Clear_Data()
                    }
                    break
                default:
                    g_Rx_Flag = 0
                    Rx_Temp = 0
                    g_new_RecvLine = 0
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
    //% blockExternalInputs=1
    //% Tx.defl=SerialPin.P1 Rx.defl=SerialPin.P2
    //% Tx.fieldEditor="gridpicker" Tx.fieldOptions.columns=3
    //% Tx.fieldOptions.tooltips="false"
    //% Rx.fieldEditor="gridpicker" Rx.fieldOptions.columns=3
    //% Rx.fieldOptions.tooltips="false"
    //% blockId=AI_Module_init
    //% block="AI_Module_init|Tx %Tx|Rx %Rx|baudrate %baud"
    export function AI_Module_init(Tx: SerialPin, Rx: SerialPin, baud: BaudRate): void {
        basic.pause(10)
        serial.setRxBufferSize(50)
        serial.redirect(Tx, Rx, baud)
    }

    /**
     * Func_Select
    */
    //% weight=100
    //% blockID="AI_Module_Func_Select"
    //% block="Func_Select %func"
    export function Func_Select(func: enFunctions): void {
        g_Running_Func = func
        let cmd = [0xff, 0xfe, 0x02, 0x01, func & 0xff]
        serialSendArray(cmd)
    }

    /**
     * Func_Current
    */
    //% weight=100
    //% blockID="AI_Module_Func_Current"
    //% block="Func_Current %func"
    export function Func_Current(func: enFunctions): boolean {
        let cmd = [0xff, 0xfe, 0x02, 0x01, 0xff]
        serialSendArray(cmd)
        let func_num = func & 0xff

        basic.pause(2)

        if (g_new_RecvLine) {
            let read_func = g_Rx_Data.getUint8(4)
            g_Running_Func = read_func
            return func_num == read_func
        }
        return false
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
        let cmd = [0xff, 0xfe, 0x02, 0x01, 0xff]
        serialSendArray(cmd)
        
        basic.pause(10)

        if (g_new_RecvLine) {
            let read_func = g_Rx_Data.getUint8(4)
            g_Running_Func = read_func
        }
        return g_Running_Func
    }

    /**
     * Request_Data
    */
    //% weight=100
    //% blockID="AI_Module_Request_Data"
    //% block="Request_Data"
    export function Request_Data(): boolean {
        let cmd = [0xff, 0xfe, 0x01, (g_Running_Func + 1) & 0xff]
        serialSendArray(cmd)
        
        basic.pause(10)
        
        if (g_new_RecvLine) {
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
        g_new_RecvLine = 0
        for (let i = 0; i < g_Rx_Number; i++) {
            g_Rx_Data.setUint8(i, 0)
        }
        g_Rx_Number = 0
    }

    /**
     * ReadSerialData
    */
    //% weight=100
    //% blockID="AI_Module_ReadSerialData"
    //% block="ReadSerialData"
    export function ReadSerialData(): void {
        let uartData = serial.readBuffer(0)
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
        if (g_Running_Func == enFunctions.Face_Recognition) {
            return g_Rx_Data.getUint8(4)
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
        if (g_Running_Func == enFunctions.Face_Recognition) {
            return g_Rx_Data.getUint8(5)
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
        if (g_Running_Func == enFunctions.Face_Recognition) {
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
        if (g_Running_Func == enFunctions.Face_Recognition) {
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
        if (g_Running_Func == enFunctions.Face_Recognition) {
            for (let i = 0; i < 3; i++) {
                if (id == g_Rx_Data.getUint8(i * 10 + 6)) {
                    index_id = i
                    break
                }
            }
            if (index_id == -1) {
                return -2
            }
            else {
                if ((pos-index_id) % 3 == 0) {
                    return g_Rx_Data.getUint8(pos + index_id*10)
                }
                else {
                    let pos_H = g_Rx_Data.getUint8(pos + index_id*10)
                    let pos_L = g_Rx_Data.getUint8(pos + 1 + index_id*10)
                    return (pos_H << 8 | pos_L)
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
        if (g_Running_Func == enFunctions.Object_Recognition) {
            return g_Rx_Data.getUint8(4)
        }
        return -1
    }


    /**
     * ObjRec_Have_Classes
    */
    //% weight=100
    //% blockID="AI_Module_ObjRec_Have_Classes"
    //% block="ObjRec_Have_Classes %objClass"
    //% subcategory="Object_Recognition"
    export function ObjRec_Have_Classes(objClass: enObjectsClass): boolean {
        if (g_Running_Func == enFunctions.Object_Recognition) {
            for (let i = 0; i < 3; i++) {
                if (objClass == g_Rx_Data.getUint8(5 + i * 10)) {
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
    //% block="ObjRec %objClass Count"
    //% subcategory="Object_Recognition"
    export function ObjRec_Classes_Count(objClass: enObjectsClass): number {
        let num: number = 0
        if (g_Running_Func == enFunctions.Object_Recognition) {
            for (let i = 0; i < 3; i++) {
                if (objClass == g_Rx_Data.getUint8(5 + i * 10)) {
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
    //% block="ObjRec index %index|objClass %objClass|pos %pos"
    //% subcategory="Object_Recognition"
    //% index.min=1 index.max=3 index.defl=1
    export function ObjRec_Get_Postion(index: number, objClass: enObjectsClass, pos: enObjRecPos): number {
        if (g_Running_Func == enFunctions.Object_Recognition) {
            let objTempBuf: Buffer = pins.createBuffer(30)
            objTempBuf.fill(0, 0, objTempBuf.length)
            let count = 0
            // 把检测到的对象数据重新排列
            for (let i = 0; i < 3; i++) {
                if (objClass == g_Rx_Data.getUint8(5 + i * 10)) {
                    for (let ii = 0; ii < 10; ii++) {
                        objTempBuf.setUint8(ii + count * 10, g_Rx_Data.getUint8(ii + 5 + i * 10))
                    }
                    count++
                }
            }
            // count = ObjRec_Classes_Count(objClass)
            if (count > 0) {
                if (index > count) {
                    return -3
                }

                if (pos % 3 == 0) {
                    let val_H = objTempBuf.getUint8((index - 1) * 10 + pos - 5)
                    let val_L = objTempBuf.getUint8((index - 1) * 10 + pos - 5 + 1)
                    return (val_H << 8 | val_L)
                }
                else {
                    return objTempBuf.getUint8((index - 1) * 10 + pos - 5)
                }
            }
            else {
                return -2
            }
        }
        return -1
    }


    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////

    /**
     * Line_Have
    */
    //% weight=100
    //% blockID="AI_Module_Line_Have"
    //% block="Line_Have"
    //% subcategory="Find_Line"
    export function Line_Have(): boolean {
        if (g_Running_Func == enFunctions.Find_Line) {
            if (g_Rx_Number > 5) {
                return true
            }
        }
        return false
    }
    
    /**
     * Line_Get_Postion
    */
    //% weight=100
    //% blockID="AI_Module_Line_Get_Postion"
    //% block="Line_Get_Postion %pos"
    //% subcategory="Find_Line"
    export function Line_Get_Postion(pos: enLinePos): number {
        if (Line_Have()) {
            if (pos == enLinePos.Direction) {
                return g_Rx_Data.getUint8(pos)
            }
            if (pos % 3 == 0) {
                return g_Rx_Data.getUint8(pos)
            }
            else {
                let pos_H = g_Rx_Data.getUint8(pos)
                let pos_L = g_Rx_Data.getUint8(pos + 1)
                return (pos_H << 8 | pos_L)
            }
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
        if (g_Running_Func == enFunctions.Color_Discrimination) {
            if (value < 0) value = 0
            if (value > 100) value = 100
            let cmd = [0xff, 0xfe, 0x02, 0x04, value & 0xff]
            serialSendArray(cmd)
        }
    }



    /**
     * Color_Have_Learned
    */
    //% weight=100
    //% blockID="AI_Module_Color_Have_Learned"
    //% block="Color_Have_Learned"
    //% subcategory="Color_Discrimination"
    export function Color_Have_Learned(): boolean {
        if (g_Running_Func == enFunctions.Color_Discrimination) {
            if (g_Rx_Number > 6) {
                return true
            }
        }
        return false
    }


    /**
     * Color_Get_Postion
    */
    //% weight=100
    //% blockID="AI_Module_Color_Get_Postion"
    //% block="Color_Get_Postion |pos %pos"
    //% subcategory="Color_Discrimination"
    export function Color_Get_Postion(pos: enColorPos): number {
        if (g_Running_Func == enFunctions.Color_Discrimination) {
            if (pos % 3 == 0) {
                return g_Rx_Data.getUint8(pos)
            }
            else {
                let pos_H = g_Rx_Data.getUint8(pos)
                let pos_L = g_Rx_Data.getUint8(pos + 1)
                return (pos_H << 8 | pos_L)
            }
        }
        return -1
    }




    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////

    /**
     * Qrcode_Have
    */
    //% weight=100
    //% blockID="AI_Module_Qrcode_Have"
    //% block="Qrcode_Have"
    //% subcategory="Qrcode_Recognition"
    export function Qrcode_Have(): boolean {
        if (g_Running_Func == enFunctions.Find_Qrcode) {
            if (g_Rx_Number > 13) {
                return true
            }
        }
        return false
    }
    
    /**
     * Qrcode_Get_Postion
    */
    //% weight=100
    //% blockID="AI_Module_Qrcode_Get_Postion"
    //% block="Qrcode_Get_Postion %pos"
    //% subcategory="Qrcode_Recognition"
    export function Qrcode_Get_Postion(pos: enQRCodePos): number {
        if (Qrcode_Have()) {
            if (pos % 3 == 0) {
                return g_Rx_Data.getUint8(pos)
            }
            else {
                let pos_H = g_Rx_Data.getUint8(pos)
                let pos_L = g_Rx_Data.getUint8(pos + 1)
                return (pos_H << 8 | pos_L)
            }
        }
        return -1
    }


    /**
     * Qrcode_Get_Data
    */
    //% weight=100
    //% blockID="AI_Module_Qrcode_Get_Data"
    //% block="Qrcode_Get_Data"
    //% subcategory="Qrcode_Recognition"
    export function Qrcode_Get_Data(): string {
        let result: string = ""
        if (Qrcode_Have()) {
            let buf: Buffer = pins.createBuffer(g_Rx_Number-13)
            for (let i = 0; i < g_Rx_Number - 13; i++) {
                buf.setUint8(i, g_Rx_Data.getUint8(i+13))
            }
            result = buf.toString()
        }
        return result
    }



    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////

    /**
     * Tag_Have
    */
    //% weight=100
    //% blockID="AI_Module_Tag_Have"
    //% block="AprilTag_Have"
    //% subcategory="AprilTag_Recognition"
    export function Tag_Have(): boolean {
        if (g_Running_Func == enFunctions.Find_AprilTag) {
            if (g_Rx_Number > 5) {
                return true
            }
        }
        return false
    }


    /**
     * Tag_Get_Postion
    */
    //% weight=100
    //% blockID="AI_Module_Tag_Get_Postion"
    //% block="Tag_Get_Postion %pos"
    //% subcategory="AprilTag_Recognition"
    export function Tag_Get_Postion(pos: enAprilTagPos): number {
        if (Tag_Have()) {
            if (pos % 3 != 0) {
                return g_Rx_Data.getUint8(pos)
            }
            else {
                let pos_H = g_Rx_Data.getUint8(pos)
                let pos_L = g_Rx_Data.getUint8(pos + 1)
                return (pos_H << 8 | pos_L)
            }
        }
        return -1
    }


    /**
     * Tag_Get_ID
    */
    //% weight=100
    //% blockID="AI_Module_Tag_Get_ID"
    //% block="Tag_Get_ID"
    //% subcategory="AprilTag_Recognition"
    export function Tag_Get_ID(): number {
        if (Tag_Have()) {
            let pos_H = g_Rx_Data.getUint8(4)
            let pos_L = g_Rx_Data.getUint8(5)
            return (pos_H << 8 | pos_L)
        }
        return -1
    }




    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////

    /**
     * BarCode_Have
    */
    //% weight=100
    //% blockID="AI_Module_BarCode_Have"
    //% block="BarCode_Have"
    //% subcategory="BarCode_Recognition"
    export function BarCode_Have(): boolean {
        if (g_Running_Func == enFunctions.Find_Barcode) {
            if (g_Rx_Number > 5) {
                return true
            }
        }
        return false
    }


    /**
     * BarCode_Get_Postion
    */
    //% weight=100
    //% blockID="AI_Module_BarCode_Get_Postion"
    //% block="BarCode_Get_Postion %pos"
    //% subcategory="BarCode_Recognition"
    export function BarCode_Get_Postion(pos: enBarCodePos): number {
        if (BarCode_Have()) {
            if (pos % 3 == 0) {
                return g_Rx_Data.getUint8(pos)
            }
            else {
                let pos_H = g_Rx_Data.getUint8(pos)
                let pos_L = g_Rx_Data.getUint8(pos + 1)
                return (pos_H << 8 | pos_L)
            }
        }
        return -1
    }


    /**
     * BarCode_Get_Data
    */
    //% weight=100
    //% blockID="AI_Module_BarCode_Get_Data"
    //% block="BarCode_Get_Data"
    //% subcategory="BarCode_Recognition"
    export function BarCode_Get_Data(): string {
        let result: string = ""
        if (BarCode_Have()) {
            let buf: Buffer = pins.createBuffer(g_Rx_Number-13)
            for (let i = 0; i < g_Rx_Number - 13; i++) {
                buf.setUint8(i, g_Rx_Data.getUint8(i+13))
            }
            result = buf.toString()
        }
        return result
    }

}
