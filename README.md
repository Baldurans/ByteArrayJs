# Incremental Binary array writer/reader
Simple way to write binary data and later read it in same order.

## Where is it useful?
When:
* Storing data in simple formats (like json) takes too much disc/network etc space.

## Weakness?
What ever you write you later need to read in same order or results will be corrupted.
It would be recommended to add versioning to it, so you can read older and newer versions.
Start thinking about binary structure only when you really need it and your overall structure is set 
(you can easily store it as json for example).

## Example
```
const writer = new BinaryArrayWriter();
writer.writeInt8(10);
writer.writeBooleans(true, false, false, true, true, false, true, true);

const writer2 = new BinaryArrayWriter();
writer2.writeInt16(10000);
writer.writeWriter(writer2);

const string = writer.export();

const reader = BinaryArrayReader.import(string);
expect(reader.readInt8()).toEqual(10);

const booleans = reader.readBooleans();
expect(booleans).toEqual([true, false, false, true, true, false, true, true]);

const reader2 = reader.readReader();
expect(reader2.readInt16()).toEqual(10000);
```

## License
MIT - Do what ever you want with it. If you found it useful, let me know :)
