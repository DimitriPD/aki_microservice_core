export class Location {
  constructor(public readonly latitude: number, public readonly longitude: number) { this.validate(); }
  private validate(): void { if (this.latitude < -90 || this.latitude > 90) throw new Error('Latitude must be between -90 and 90 degrees'); if (this.longitude < -180 || this.longitude > 180) throw new Error('Longitude must be between -180 and 180 degrees'); }
  equals(other: Location): boolean { return this.latitude === other.latitude && this.longitude === other.longitude; }
  toObject(): { latitude: number; longitude: number } { return { latitude: this.latitude, longitude: this.longitude }; }
}
