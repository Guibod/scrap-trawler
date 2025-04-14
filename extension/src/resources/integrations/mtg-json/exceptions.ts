export class MtgJsonException extends Error {
    constructor(message) {
        super(message);
        this.name = 'MtgJsonException';
    }
}

export class MtgJsonNotFoundException extends MtgJsonException {
    constructor(message) {
        super(message);
        this.name = 'MtgJsonNotFoundException';
    }
}

export class MtgJsonVersionException extends MtgJsonException {
    constructor(message) {
        super(message);
        this.name = 'MtgJsonVersionException';
    }
}

export class MtgJsonWriteStreamException extends MtgJsonException {
    constructor(message) {
        super(message);
        this.name = 'MtgJsonWriteStreamException';
    }
}