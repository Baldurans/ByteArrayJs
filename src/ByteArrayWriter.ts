import {BooleanByteMap} from "./BooleanByteMap";
import {Base64} from "./Base64";

export class ByteArrayWriter {

    private totalLength: number;
    private readonly data: Array<{
        length: number;
        value: string | number | bigint;
        method: "setInt8" | "setInt16" | "setInt32" | "setUint8" | "setUint16" | "setUint32" | "setFloat64" | "setBigUint64"
    }>;

    constructor() {
        this.totalLength = 0;
        this.data = [];
    }

    public _write(value: string | number | bigint, length: number, method: "setInt8" | "setInt16" | "setInt32" | "setUint8" | "setUint16" | "setUint32" | "setFloat64" | "setBigUint64") {
        this.data.push({
            length: length,
            value: value,
            method: method
        });
        this.totalLength += length;
        return this;
    };

    public writeChar(char: string) {
        return this.writeUint8(char.charCodeAt(0));
    };

    public writeInt8(value: number) {
        return this._write(value, 1, 'setInt8');
    };

    public writeInt16(value: number) {
        return this._write(value, 2, 'setInt16');
    };

    public writeInt32(value: number) {
        return this._write(value, 4, 'setInt32');
    };

    public writeUint8(value: number) {
        return this._write(value, 1, 'setUint8');
    };

    public writeUint16(value: number) {
        return this._write(value, 2, 'setUint16');
    };

    public writeUint32(value: number) {
        return this._write(value, 4, 'setUint32');
    };

    public writeFloat64(value: number) {
        return this._write(value, 8, 'setFloat64');
    };

    public writeBigUint64(value: bigint) {
        return this._write(value, 8, "setBigUint64");
    }

    public writeWriter(writer: ByteArrayWriter) {
        if (!writer) {
            this.writeInt32(0);
        } else {
            this.writeInt32(writer.getTotalLength());
            const data = writer.getData();
            for (let i = 0; i < data.length; i++) {
                this._write(data[i].value, data[i].length, data[i].method);
            }
        }
        return this;
    };

    public writeBooleans(...args: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean]) {
        return this.writeBooleanMap(new BooleanByteMap().writeAll(...args));
    };

    public writeBooleanMap(booleanMap: BooleanByteMap) {
        return this.writeUint8(booleanMap.getValue());
    };

    public writeBooleansArrayFunc<T>(array: T[], func: (value: T) => boolean) {
        let booleanMap = null;
        for (let i = 0; i < array.length; i++) {
            if (booleanMap == null) {
                booleanMap = new BooleanByteMap();
            }
            booleanMap.writeBoolean(!!func(array[i]));
            if ((i + 1) % 8 == 0) {
                this.writeBooleanMap(booleanMap);
                booleanMap = null
            }
        }
        if (booleanMap) {
            booleanMap.fillZero();
            this.writeBooleanMap(booleanMap);
        }
        return this;
    };

    public getData() {
        return this.data;
    };

    public getTotalLength() {
        return this.totalLength;
    };

    public getBuffer() {
        const buffer = new ArrayBuffer(this.totalLength);
        const dataView = new DataView(buffer, 0);
        let offset = 0;
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            (dataView as any)[item.method](offset, item.value);
            offset += item.length;
        }
        return buffer;
    };

    public export(): string {
        return Base64.arrayBufferToBase64(this.getBuffer());
    }

}
