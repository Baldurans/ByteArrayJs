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

type PossibleValues = {
    char: string;
    "int8": number;
    "int16": number;
    "int32": number;
    "uint8": number;
    "uint16": number;
    "uint32": number;
    "float64": number;
    "bigUint64": bigint;
    "booleanMap": BooleanByteMap;
}

type Testable<ValueType extends keyof PossibleValues = keyof PossibleValues, ReadValueType extends keyof PossibleValues = keyof PossibleValues> = {
    type: ValueType;
    value: PossibleValues[ValueType];
    expectedValue?: PossibleValues[ValueType];
} | {
    type: ValueType;
    readType: ReadValueType;
    value: PossibleValues[ValueType];
    expectedValue?: PossibleValues[ReadValueType];

};

function getMethodName(type: "read" | "write", valueType: keyof PossibleValues) {
    return type + valueType.charAt(0).toUpperCase() + valueType.slice(1);
}

test("main", () => {

    const tests: Testable[] = [
        {value: 'a', type: "char"},

        {value: 255, expectedValue: -1, type: 'int8'},
        {value: -1, expectedValue: -1, type: 'uint8', readType: 'int8'},
        {value: 255, type: "int16"},
        {value: 255, type: "int32"},

        {value: 255, type: "uint8"},
        {value: -1, expectedValue: 255, type: "uint8"},
        {value: 255, type: "uint16"},
        {value: 255, type: "uint32"},


        {value: 1 / 3, type: 'float64'},
        {value: 1.12345e250, type: 'float64'},

        {
            value: new BooleanByteMap().writeAll(false, true, false, true, false, true, false, true),
            expectedValue: 170, // it is reversed for better reading
            type: "booleanMap"
        },
        {
            value: new BooleanByteMap().writeAll(true, false, true, false, true, false, true, false),
            expectedValue: 85, // it is reversed for better reading
            type: "booleanMap"
        },

        {value: 1n, type: 'bigUint64'},
        {value: BigInt(Number.MAX_SAFE_INTEGER) * 3n, type: 'bigUint64'},
    ];

    const writer = new ByteArrayWriter();
    for (let i = 0; i < tests.length; i++) {
        (writer[getMethodName("write", tests[i].type) as keyof ByteArrayWriter] as any)(tests[i].value);
    }
    const writer2 = new ByteArrayWriter();
    writer2.writeInt16(2055);
    writer2.writeUint8(77);
    writer.writeWriter(writer2);

    const reader = new ByteArrayReader(writer.getBuffer());
    tests.forEach((test) => {
        const expected = String(test.expectedValue || test.value);
        // Hack for typescript to work
        const value = String(reader[getMethodName("read", ((test as any).readType as keyof PossibleValues | undefined) || test.type) as "readUint8"]());
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
    expect(reader2.hasUnreadBytes()).toEqual(true)
    expect(reader2.readInt16()).toEqual(2055);
    expect(reader2.hasUnreadBytes()).toEqual(true)
    expect(reader2.readUint8()).toEqual(77);
    expect(reader2.hasUnreadBytes()).toEqual(false)
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
