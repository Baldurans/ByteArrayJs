export class BooleanByteMap {

    private buffer: number;
    private length: number;

    constructor(value?: number) {
        this.buffer = value;
        this.length = 0;
    }

    public writeAll(...args: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean]) {
        for (let i = 0; i < 8; i++) {
            this.writeBoolean(!!args[i]);
        }
        return this;
    };

    public writeBoolean(value: boolean) {
        this.buffer <<= 1;
        this.buffer |= (value ? 1 : 0);
        this.length++;
        return this;
    };

    public fillZero() {
        const len = this.length;
        for (let i = 0; i < 8 - len; i++) {
            this.writeBoolean(false);
        }
        return this;
    };

    public readBoolean() {
        const mask = 1;
        const value = this.buffer & mask;
        this.buffer >>= 1;
        return !!value;
    };

    public getValue() {
        return this.buffer;
    };

    public reverse() {
        const bools = [];
        for (let i = 0; i < 8; i++) {
            bools.push(this.readBoolean());
        }
        for (let i = 0; i < 8; i++) {
            this.writeBoolean(bools[i]);
        }
        return this;
    };

    public toString() {
        return this.buffer;
    };

}
