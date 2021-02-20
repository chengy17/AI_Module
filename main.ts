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
        // id = 0,
        //% block="X_start"
        X_start = 0,
        //% block="Y_start"
        Y_start = X_start + 3,
        //% block="X_end"
        X_end = Y_start + 3,
        //% block="Y_end"
        Y_end = X_end + 3,
        //% block="X_center"
        X_center = Y_end + 3,
        //% block="Y_center"
        Y_center = X_center + 3,
        //% block="Width"
        Width = Y_center + 3,
        //% block="Height"
        Height = Width + 3,

        // Max_Value = Height + 3
    }

    export enum enObjRecPos {
        //% blcok="type"
        type = 0,
        //% block="X_start"
        X_start = type + 2,
        //% block="Y_start"
        Y_start = X_start + 3,
        //% block="X_end"
        X_end = Y_start + 3,
        //% block="Y_end"
        Y_end = X_end + 3,
        //% block="X_center"
        X_center = Y_end + 3,
        //% block="Y_center"
        Y_center = X_center + 3,
        //% block="Width"
        Width = Y_center + 3,
        //% block="Height"
        Height = Width + 3,

        // Max_Value = Height + 3
    }

    export enum enObjects {
        tv
    }

    export enum enColorPos {

        //% block="X_start"
        X_start = 0,
        //% block="Y_start"
        Y_start = X_start + 3,
        //% block="X_end"
        X_end = Y_start + 3,
        //% block="Y_end"
        Y_end = X_end + 3,
        //% block="X_center"
        X_center = Y_end + 3,
        //% block="Y_center"
        Y_center = X_center + 3,
        //% block="Width"
        Width = Y_center + 3,
        //% block="Height"
        Height = Width + 3,

        // Max_Value = Height + 3
    }


    let Running_Func: enFunctions = enFunctions.Home_Pages
    let recv_Data: string = ""
    let new_RecvLine: number = 0

    /**
     * 人脸识别参数
     */
    let face_count: number = 0
    
    
/**********************************************************************/
/**********************************************************************/
/**********************************************************************/
/*内部函数区************************************************************/

    function Uart_send(cmd: string) {
        let buf = Buffer.fromUTF8(cmd)
        serial.writeBuffer(buf)
    }
    
    // 数字转化成字符串，保存n位，前面补零
    function Int2str(num: number, len: number): string {
        return ( "000" + num ).substr(-len)
    }

    function Str2int(str: string): number {
        let val: number = +str
        return val
    }


    serial.onDataReceived(serial.delimiters(Delimiters.Dollar), function () {
        recv_Data = serial.readUntil(serial.delimiters(Delimiters.Hash))
        if (recv_Data.charAt(0) == '$') {
            new_RecvLine = 1
            let num = Str2int(recv_Data.substr(3, 2))
            if (num == 0) {
                recv_Data = "$0000000000000000000000000000000000000000000000000000000000000000000000000000000000#"
            }
        }
        else {
            recv_Data = ""
            new_RecvLine = 0
        }
    })

    function clear_data(): void {
        new_RecvLine = 0
        recv_Data = ""
    }

    function face_ID(index: number): number {
        if (Running_Func == enFunctions.Face_Recognition) {
            return Str2int(recv_Data.charAt(7 + index * 25))
        }
        return -1
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
        serial.setRxBufferSize(100)
        basic.pause(10)
    }

    /**
     * Func_Select
    */
    //% weight=100
    //% blockID="AI_Module_Func_Select"
    //% block="Func_Select %func"
    export function Func_Select(func: enFunctions): void {
        let cmd = '$01' + Int2str(func, 2) + '#'
        Uart_send(cmd)
        Running_Func = func
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
        clear_data()

        let cmd = '$' + Int2str(Running_Func + 1, 2) + '#'
        Uart_send(cmd)

        basic.pause(10)

        if (new_RecvLine) {
            return true
        }
        return false
    }

    /**
     * Transfer_Data
    */
    //% weight=100
    //% blockID="AI_Module_Transfer_Data"
    //% block="Transfer_Data"
    export function Transfer_Data(): void {
        clear_data()

        let cmd = '$' + Int2str(Running_Func + 1, 2) + '#'
        Uart_send(cmd)

        while (!new_RecvLine) {
            control.waitMicros(1)
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
            return Str2int(recv_Data.substr(3, 2))
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
            return Str2int(recv_Data.substr(5, 2))
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
            let learned = Str2int(recv_Data.substr(5, 2))
            let all = Str2int(recv_Data.substr(3, 2))
            return all-learned
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
                if (id == face_ID(i)) {
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
        if (Running_Func == enFunctions.Face_Recognition) {
            
            return Str2int(recv_Data.substr(pos + 7, 3))
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
            return Str2int(recv_Data.substr(3, 2))
        }
        return -1
    }


    /**
     * ObjRec_Get_Classes
    */
    //% weight=100
    //% blockID="AI_Module_ObjRec_Get_Classes"
    //% block="ObjRec_Get_Classes"
    //% subcategory="Object_Recognition"
    export function ObjRec_Get_Classes(): number {
        if (Running_Func == enFunctions.Object_Recognition) {
            return Str2int(recv_Data.substr(5, 2))
        }
        return -1
    }

    /**
     * ObjRec_Get_Postion
    */
    //% weight=100
    //% blockID="AI_Module_ObjRec_Get_Postion"
    //% block="ObjRec_Get_Postion |type %type|pos %pos"
    //% subcategory="Object_Recognition"
    export function ObjRec_Get_Postion(type: number, pos: enObjRecPos): number {
        if (Running_Func == enFunctions.Object_Recognition) {
            if (pos == enObjRecPos.type) {

                return Str2int(recv_Data.substr(pos + 5, 2))
            }
            return Str2int(recv_Data.substr(pos + 5, 3))
        }
        return -1
    }




    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /**
     * Color_Get_Postion
    */
    //% weight=100
    //% blockID="AI_Module_Color_Get_Postion"
    //% block="Color_Get_Postion |pos %pos"
    //% subcategory="Color_Discrimination"
    export function Color_Get_Postion(pos: enColorPos): number {
        if (Running_Func == enFunctions.Color_Discrimination) {
            return Str2int(recv_Data.substr(pos, 3))
        }
        return -1
    }

}
