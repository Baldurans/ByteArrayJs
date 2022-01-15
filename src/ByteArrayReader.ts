import {BooleanByteMap} from "./BooleanByteMap";
import base64 from "base64-arraybuffer";

export class ByteArrayReader {

    private readonly buffer: ArrayBuffer;
    private readonly dataView: DataView;
    private offset: number;

    constructor(buffer: ArrayBuffer) {
        this.buffer = buffer;
        this.dataView = new DataView(buffer);
        this.offset = 0;
    }

    public _read(length: number, method: "getInt8" | "getInt16" | "getInt32" | "getUint8" | "getUint16" | "getUint32" | "getFloat64") {
        const value = this.dataView[method](this.offset);
        this.offset += length;
        return value;
    };

    public readBooleans(): [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean] {
        const map = this.readBooleanMap();
        return [map.readBoolean(), map.readBoolean(), map.readBoolean(), map.readBoolean(), map.readBoolean(), map.readBoolean(), map.readBoolean(), map.readBoolean()]
    };

    public readBooleanMap() {
        return new BooleanByteMap(this.readUint8()).reverse();
    };

    public readChar() {
        return String.fromCharCode(this.readInt8());
    };

    public readInt8() {
        return this._read(1, 'getInt8');
    };

    public readInt16() {
        return this._read(2, 'getInt16');
    };

    public readInt32() {
        return this._read(4, 'getInt32');
    };

    public readUint8() {
        return this._read(1, 'getUint8');
    };

    public readUint16() {
        return this._read(2, 'getUint16');
    };

    public readUint32() {
        return this._read(4, 'getUint32');
    };

    public readFloat64() {
        return this._read(8, 'getFloat64');
    };

    public readReader() {
        const length = this.readInt32();
        const mainBuf = new ArrayBuffer(length);
        const buffer = new Int8Array(mainBuf, 0, length);
        for (let i = 0; i < length; i++) {
            buffer[i] = this.readInt8();
        }
        return new ByteArrayReader(mainBuf);
    };

    public readBooleanArrayFunc(length: number, func: (i: number, value: boolean) => void) {
        let booleanMap = null;
        for (let i = 0; i < length; i++) {
            if (i % 8 == 0) {
                booleanMap = this.readBooleanMap();
            }
            func(i, booleanMap.readBoolean());
        }
    };

    public getBuffer() {
        return this.buffer;
    };

    public getByteLength() {
        return this.buffer.byteLength;
    };

    public getOffset() {
        return this.offset;
    };

    public hasUnreadBytes(): boolean {
        return this.offset < this.buffer.byteLength;
    }

    public static import(data: string): ByteArrayReader {
        return new ByteArrayReader(base64.decode(data));
    }
}
