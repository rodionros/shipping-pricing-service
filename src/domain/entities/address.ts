export class Address {
    constructor(
        public readonly city: string,
        public readonly postalCode: string,
        public readonly street: string,
        public readonly country: string
    ) {
        if (!city || !postalCode || !street || !country) {
            throw new Error("Address fields must be non-empty");
        }
    }
}