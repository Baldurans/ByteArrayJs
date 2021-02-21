import {BooleanByteMap} from "../src/BooleanByteMap";
import {ByteArrayWriter} from "../src/ByteArrayWriter";
import {ByteArrayReader} from "../src/ByteArrayReader";

test("simple", () => {
    const writer = new ByteArrayWriter();
    writer.writeInt8(10);
    writer.writeBooleans(true, false, false, true, true, false, true, true);

    const writer2 = new ByteArrayWriter();
    writer2.writeInt16(10000);
    writer.writeWriter(writer2);

    const string = writer.export();
    expect(string).toEqual("CpsAAAACJxA=");

    const reader = ByteArrayReader.import(string);
    expect(reader.readInt8()).toEqual(10);

    const booleans = reader.readBooleans();
    expect(booleans).toEqual([true, false, false, true, true, false, true, true]);

    const reader2 = reader.readReader();
    expect(reader2.readInt16()).toEqual(10000);
});

test("main", () => {

    const tests: Array<{
            value: string,
            writeMethod: "writeChar",
            readMethod: "readChar"
        }
        |
        {
            value: number,
            expectedValue?: number,
            writeMethod: "writeInt8" | "writeInt16" | "writeInt32" | "writeUint8" | "writeUint16" | "writeUint32" | "writeFloat64",
            readMethod: "readInt8" | "readInt16" | "readInt32" | "readUint8" | "readUint16" | "readUint32" | "readFloat64"
        }
        |
        {
            value: BooleanByteMap,
            expectedValue: number,
            writeMethod: "writeBooleanMap",
            readMethod: "readBooleanMap"
        }> = [
        {value: 'a', writeMethod: 'writeChar', readMethod: 'readChar'},

        {value: 255, expectedValue: -1, writeMethod: 'writeInt8', readMethod: 'readInt8'},
        {value: -1, expectedValue: -1, writeMethod: 'writeUint8', readMethod: 'readInt8'},
        {value: 255, writeMethod: 'writeInt16', readMethod: 'readInt16'},
        {value: 255, writeMethod: 'writeInt32', readMethod: 'readInt32'},

        {value: 255, writeMethod: 'writeUint8', readMethod: 'readUint8'},
        {value: -1, expectedValue: 255, writeMethod: 'writeUint8', readMethod: 'readUint8'},
        {value: 255, writeMethod: 'writeUint16', readMethod: 'readUint16'},
        {value: 255, writeMethod: 'writeUint32', readMethod: 'readUint32'},

        {value: 1 / 3, writeMethod: 'writeFloat64', readMethod: 'readFloat64'},
        {value: 1.12345e250, writeMethod: 'writeFloat64', readMethod: 'readFloat64'},

        {
            value: new BooleanByteMap().writeAll(false, true, false, true, false, true, false, true),
            expectedValue: 170, // it is reversed for better reading
            writeMethod: 'writeBooleanMap',
            readMethod: 'readBooleanMap'
        },
        {
            value: new BooleanByteMap().writeAll(true, false, true, false, true, false, true, false),
            expectedValue: 85, // it is reversed for better reading
            writeMethod: 'writeBooleanMap',
            readMethod: 'readBooleanMap'
        }
    ];

    const writer = new ByteArrayWriter();
    for (let i = 0; i < tests.length; i++) {
        (writer[tests[i].writeMethod] as any)(tests[i].value);
    }
    const writer2 = new ByteArrayWriter();
    writer2.writeInt16(2055);
    writer2.writeUint8(77);
    writer.writeWriter(writer2);

    const reader = new ByteArrayReader(writer.getBuffer());
    tests.forEach((test) => {
        const expected = String((test as any).expectedValue !== undefined ? (test as any).expectedValue : test.value);
        const value = String(reader[test.readMethod]());
        expect(value).toEqual(expected)
    })
});

test("test writeWriter/readReader", () => {
    const writer2 = new ByteArrayWriter();
    writer2.writeInt16(2055);
    writer2.writeUint8(77);

    const writer = new ByteArrayWriter();
    writer.writeWriter(writer2);

    const reader = new ByteArrayReader(writer.getBuffer());
    const reader2 = reader.readReader();
    expect(reader2.readInt16()).toEqual(2055);
    expect(reader2.readUint8()).toEqual(77);
});

test("test boolean func", () => {

    const writer = new ByteArrayWriter();
    const data = [0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0];
    writer.writeBooleansArrayFunc(data, (val) => val === 1)

    const reader = new ByteArrayReader(writer.getBuffer());
    const bol1 = reader.readBooleanMap();
    const bol2 = reader.readBooleanMap();

    expect(bol1.readBoolean()).toEqual(false);
    expect(bol1.readBoolean()).toEqual(true);
    expect(bol1.readBoolean()).toEqual(false);
    expect(bol1.readBoolean()).toEqual(true);
    expect(bol1.readBoolean()).toEqual(false);
    expect(bol1.readBoolean()).toEqual(true);
    expect(bol1.readBoolean()).toEqual(false);
    expect(bol1.readBoolean()).toEqual(true);

    expect(bol2.readBoolean()).toEqual(true);
    expect(bol2.readBoolean()).toEqual(false);
    expect(bol2.readBoolean()).toEqual(true);
    expect(bol2.readBoolean()).toEqual(false);
    expect(bol2.readBoolean()).toEqual(false);
    expect(bol2.readBoolean()).toEqual(false);
    expect(bol2.readBoolean()).toEqual(false);
    expect(bol2.readBoolean()).toEqual(false);
});

test("test boolean reverse", () => {
    const bin = new BooleanByteMap().writeAll(true, false, true, false, false, false, false, false).reverse();
    expect(bin.readBoolean()).toEqual(true);
    expect(bin.readBoolean()).toEqual(false);
    expect(bin.readBoolean()).toEqual(true);
    expect(bin.readBoolean()).toEqual(false);
    expect(bin.readBoolean()).toEqual(false);
    expect(bin.readBoolean()).toEqual(false);
    expect(bin.readBoolean()).toEqual(false);
    expect(bin.readBoolean()).toEqual(false);
});

test("test boolean fill zero", () => {
    const writer = new ByteArrayWriter();
    writer.writeBooleanMap(new BooleanByteMap().writeBoolean(true).writeBoolean(false).writeBoolean(true).fillZero());

    const reader = new ByteArrayReader(writer.getBuffer());
    const bol = reader.readBooleanMap();

    expect(bol.readBoolean()).toEqual(true);
    expect(bol.readBoolean()).toEqual(false);
    expect(bol.readBoolean()).toEqual(true);
    expect(bol.readBoolean()).toEqual(false);
    expect(bol.readBoolean()).toEqual(false);
    expect(bol.readBoolean()).toEqual(false);
    expect(bol.readBoolean()).toEqual(false);
    expect(bol.readBoolean()).toEqual(false);
});
